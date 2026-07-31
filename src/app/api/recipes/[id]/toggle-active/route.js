// src/app/api/recipes/[id]/toggle-active/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/logActivity';
import Recipe from '@/models/Recipe';

// PUT /api/recipes/[id]/toggle-active — admin only
export async function PUT(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;

    await connectDB();

    const recipe = await Recipe.findById(params.id);
    if (!recipe) {
      return NextResponse.json({ success: false, message: 'Recipe not found' }, { status: 404 });
    }

    recipe.isActive = !recipe.isActive;
    await recipe.save();

    await logActivity(request, admin, {
      action: 'update',
      module: 'recipes',
      description: `Toggled status of recipe "${recipe.title}" to ${recipe.isActive ? 'Active' : 'Inactive'}`,
      targetId: recipe._id,
      targetName: recipe.title,
    });

    return NextResponse.json({
      success: true,
      message: `Recipe status set to ${recipe.isActive ? 'Active' : 'Inactive'}`,
      isActive: recipe.isActive,
    });
  } catch (err) {
    console.error('PUT toggle-active error:', err);
    return NextResponse.json({ success: false, message: 'Failed to toggle status' }, { status: 500 });
  }
}
