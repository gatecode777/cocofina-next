// src/app/api/blogcategories/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { saveFile } from '@/lib/apiHelpers';
import BlogCategory from '@/models/BlogCategory';
import Blog from '@/models/Blog';

// GET /api/blogcategories
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');

    const query = {};
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
    // Only filter by isActive when explicitly provided
    if (isActive !== null && isActive !== '' && isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const categories = await BlogCategory.find(query).sort({ order: 1, name: 1 }).lean();

    const withCount = await Promise.all(
      categories.map(async (cat) => ({
        ...cat,
        blogCount: await Blog.countDocuments({ category: cat._id, status: 'published' }),
      }))
    );

    return NextResponse.json({ success: true, categories: withCount, total: withCount.length });
  } catch (err) {
    console.error('GET /api/blogcategories error:', err);
    return NextResponse.json({ success: false, message: 'Failed to fetch blog categories' }, { status: 500 });
  }
}

// POST /api/blogcategories
export async function POST(request) {
  try {
    // 1. Auth check
    const { admin, error } = await requireAdmin(request);
    if (error) return error;

    // 2. Connect DB
    await connectDB();

    // 3. Parse body — handles both JSON and multipart
    const contentType = request.headers.get('content-type') || '';
    let name, description, order, isActive, imageFile;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      name = formData.get('name');
      description = formData.get('description');
      order = formData.get('order');
      isActive = formData.get('isActive');
      imageFile = formData.get('image');
    } else {
      // AdminBlogCategories sends JSON
      const body = await request.json();
      name = body.name;
      description = body.description;
      order = body.order;
      isActive = body.isActive;
    }

    // 4. Validate
    if (!name?.trim())
      return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 });

    // 5. Check duplicate
    const existing = await BlogCategory.findOne({ name: name.trim() });
    if (existing)
      return NextResponse.json({ success: false, message: 'A category with this name already exists' }, { status: 409 });

    // 6. Build data object
    const catData = {
      name: name.trim(),
      description: description?.trim() || '',
      order: order !== undefined && order !== null ? parseInt(order) || 0 : 0,
      isActive: isActive !== undefined
        ? (isActive === 'true' || isActive === true)
        : true,
    };

    // 7. Handle image upload if present
    console.log("STEP 1");
    if (imageFile instanceof File) {
      console.log("STEP 2 - before saveFile");
      catData.image = await saveFile(imageFile, 'blogcategories');
      console.log("STEP 3 - after saveFile");
    }
    console.log("STEP 4 - before create");

    // 8. Create — this is where next() missing causes silent hang
    const category = await BlogCategory.create(catData);

    return NextResponse.json(
      { success: true, message: 'Blog category created', category },
      { status: 201 }
    );
  } catch (err) {
    console.error('POST /api/blogcategories error:', err);
    if (err.code === 11000)
      return NextResponse.json({ success: false, message: 'Category name already exists' }, { status: 409 });
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to create blog category' },
      { status: 500 }
    );
  }
}