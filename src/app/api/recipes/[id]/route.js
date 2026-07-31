// src/app/api/recipes/[id]/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/logActivity';
import { saveFile } from '@/lib/apiHelpers';
import Recipe from '@/models/Recipe';

// GET /api/recipes/[id]
export async function GET(request, { params }) {
  try {
    await connectDB();
    const recipe = await Recipe.findById(params.id);
    if (!recipe) {
      return NextResponse.json({ success: false, message: 'Recipe not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, recipe });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to fetch recipe' }, { status: 500 });
  }
}

// PUT /api/recipes/[id] — admin only
export async function PUT(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;

    await connectDB();

    const recipe = await Recipe.findById(params.id);
    if (!recipe) {
      return NextResponse.json({ success: false, message: 'Recipe not found' }, { status: 404 });
    }

    const contentType = request.headers.get('content-type') || '';
    let title, category, time, servings, description, ingredients, steps, order, isActive, imageFile;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      title = formData.get('title');
      category = formData.get('category');
      time = formData.get('time');
      servings = formData.get('servings');
      description = formData.get('description');
      order = formData.get('order');
      isActive = formData.get('isActive');
      imageFile = formData.get('image');

      const ingredientsStr = formData.get('ingredients');
      ingredients = ingredientsStr ? JSON.parse(ingredientsStr) : undefined;

      const stepsStr = formData.get('steps');
      steps = stepsStr ? JSON.parse(stepsStr) : undefined;
    } else {
      const body = await request.json();
      title = body.title;
      category = body.category;
      time = body.time;
      servings = body.servings;
      description = body.description;
      ingredients = body.ingredients;
      steps = body.steps;
      order = body.order;
      isActive = body.isActive;
    }

    if (title) recipe.title = title;
    if (category !== undefined) recipe.category = category;
    if (time !== undefined) recipe.time = time;
    if (servings !== undefined) recipe.servings = servings;
    if (description !== undefined) recipe.description = description;
    if (ingredients !== undefined && Array.isArray(ingredients)) recipe.ingredients = ingredients.filter(Boolean);
    if (steps !== undefined && Array.isArray(steps)) recipe.steps = steps.filter(Boolean);
    if (order !== undefined) recipe.order = parseInt(order) || 0;
    if (isActive !== undefined) recipe.isActive = isActive === 'true' || isActive === true;

    if (imageFile instanceof File) {
      recipe.image = await saveFile(imageFile, 'recipes');
    }

    await recipe.save();

    await logActivity(request, admin, {
      action: 'update',
      module: 'recipes',
      description: `Updated recipe "${recipe.title}"`,
      targetId: recipe._id,
      targetName: recipe.title,
    });

    return NextResponse.json({ success: true, message: 'Recipe updated successfully', recipe });
  } catch (err) {
    console.error('PUT /api/recipes/[id] error:', err);
    return NextResponse.json({ success: false, message: err.message || 'Failed to update recipe' }, { status: 500 });
  }
}

// DELETE /api/recipes/[id] — admin only
export async function DELETE(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;

    await connectDB();

    const recipe = await Recipe.findByIdAndDelete(params.id);
    if (!recipe) {
      return NextResponse.json({ success: false, message: 'Recipe not found' }, { status: 404 });
    }

    await logActivity(request, admin, {
      action: 'delete',
      module: 'recipes',
      description: `Deleted recipe "${recipe.title}"`,
      targetId: params.id,
      targetName: recipe.title,
    });

    return NextResponse.json({ success: true, message: 'Recipe deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/recipes/[id] error:', err);
    return NextResponse.json({ success: false, message: 'Failed to delete recipe' }, { status: 500 });
  }
}
