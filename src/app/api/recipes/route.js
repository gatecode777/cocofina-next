// src/app/api/recipes/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/logActivity';
import { saveFile } from '@/lib/apiHelpers';
import Recipe from '@/models/Recipe';

const INITIAL_RECIPES = [
  {
    title: "Morning Caramel Iced Latte",
    category: "Beverage",
    time: "5 mins",
    servings: "1 cup",
    image: "/images/bg_sap.png",
    description: "A rich, velvety iced coffee with warm butterscotch notes from unrefined Cocofina coconut sugar.",
    ingredients: [
      "2 tsp Cocofina Coconut Sugar",
      "1 shot fresh Espresso or strong brew",
      "150ml chilled Almond or Oat Milk",
      "Handful of ice cubes",
    ],
    steps: [
      "Dissolve 2 tsp of Cocofina Coconut Sugar into hot espresso until fully dissolved.",
      "Fill a tall glass with ice and pour in chilled milk.",
      "Slowly pour the warm caramel espresso over milk and stir well.",
    ],
    isActive: true,
    order: 1,
  },
  {
    title: "Organic Coconut Sugar Cookies",
    category: "Baking",
    time: "25 mins",
    servings: "12 cookies",
    image: "/images/product_400g.png",
    description: "Chewy, golden cookies with a subtle molasses aroma and crisp edges.",
    ingredients: [
      "1 cup Cocofina Coconut Sugar (1:1 substitute for brown sugar)",
      "1/2 cup unsalted organic butter, softened",
      "1 egg + 1 tsp vanilla extract",
      "1.5 cups whole wheat or oat flour + 1/2 tsp baking soda",
    ],
    steps: [
      "Cream softened butter and Cocofina Coconut Sugar together until fluffy.",
      "Mix in egg and vanilla extract.",
      "Fold in flour and baking soda. Bake at 175°C (350°F) for 10-12 minutes.",
    ],
    isActive: true,
    order: 2,
  },
  {
    title: "Desi Coconut Sugar Kheer / Payasam",
    category: "Traditional Indian Dessert",
    time: "35 mins",
    servings: "4 bowls",
    image: "/images/product_1kg.png",
    description: "A healthy twist on classic Indian rice pudding with a rich caramel-golden tint.",
    ingredients: [
      "3/4 cup Cocofina Coconut Sugar",
      "1 liter full-cream or coconut milk",
      "1/4 cup Basmati rice, soaked",
      "Cardamom pods, roasted cashews & raisins in ghee",
    ],
    steps: [
      "Simmer milk and soaked rice on low heat until thickened.",
      "Stir in cardamom and roasted dry fruits.",
      "Turn off heat, allow to cool slightly for 2 minutes, then stir in Cocofina Coconut Sugar.",
    ],
    isActive: true,
    order: 3,
  },
];

// GET /api/recipes — public / admin
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const isActive = searchParams.get('isActive');

    // Auto seed initial recipes if DB is empty
    const count = await Recipe.countDocuments();
    if (count === 0) {
      await Recipe.insertMany(INITIAL_RECIPES);
    }

    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'all') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const recipes = await Recipe.find(query).sort({ order: 1, createdAt: -1 });

    return NextResponse.json({ success: true, recipes, total: recipes.length });
  } catch (err) {
    console.error('GET /api/recipes error:', err);
    return NextResponse.json({ success: false, message: 'Failed to fetch recipes' }, { status: 500 });
  }
}

// POST /api/recipes — admin only
export async function POST(request) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;

    await connectDB();

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
      ingredients = ingredientsStr ? JSON.parse(ingredientsStr) : [];

      const stepsStr = formData.get('steps');
      steps = stepsStr ? JSON.parse(stepsStr) : [];
    } else {
      const body = await request.json();
      title = body.title;
      category = body.category;
      time = body.time;
      servings = body.servings;
      description = body.description;
      ingredients = body.ingredients || [];
      steps = body.steps || [];
      order = body.order;
      isActive = body.isActive;
    }

    if (!title) {
      return NextResponse.json({ success: false, message: 'Title is required' }, { status: 400 });
    }

    const recipeData = {
      title,
      category: category || 'General',
      time: time || '15 mins',
      servings: servings || '2 servings',
      description: description || '',
      ingredients: Array.isArray(ingredients) ? ingredients.filter(Boolean) : [],
      steps: Array.isArray(steps) ? steps.filter(Boolean) : [],
      order: order ? parseInt(order) : 0,
      isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : true,
    };

    if (imageFile instanceof File) {
      recipeData.image = await saveFile(imageFile, 'recipes');
    }

    const recipe = await Recipe.create(recipeData);

    await logActivity(request, admin, {
      action: 'create',
      module: 'recipes',
      description: `Created recipe "${recipe.title}"`,
      targetId: recipe._id,
      targetName: recipe.title,
    });

    return NextResponse.json({ success: true, message: 'Recipe created successfully', recipe }, { status: 201 });
  } catch (err) {
    console.error('POST /api/recipes error:', err);
    return NextResponse.json({ success: false, message: err.message || 'Failed to create recipe' }, { status: 500 });
  }
}
