
export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/logActivity';
import { saveFile } from '@/lib/apiHelpers';
import Blog from '@/models/Blog';
import BlogCategory from '@/models/BlogCategory';

// GET /api/admin/blogs
export async function GET(request) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page     = parseInt(searchParams.get('page')   || '1');
    const limit    = parseInt(searchParams.get('limit')  || '20');
    const status   = searchParams.get('status')   || '';
    const category = searchParams.get('category') || '';
    const search   = searchParams.get('search')   || '';
    const featured = searchParams.get('featured') || '';

    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (featured === 'true') filter.isFeatured = true;
    if (category && category !== 'null' && category !== 'undefined' && category.trim() !== '') filter.category = category.trim();
    if (search?.trim()) filter.$or = [
      { title:   { $regex: search.trim(), $options: 'i' } },
      { excerpt: { $regex: search.trim(), $options: 'i' } },
    ];

    const skip  = (page - 1) * limit;
    const total = await Blog.countDocuments(filter);
    const blogs = await Blog.find(filter)
      .populate('category', 'name slug')  // Changed from 'blogCategory' to 'category'
      .sort({ createdAt: -1 }).skip(skip).limit(limit)
      .select('-content').lean();

    logActivity(request, admin, {
      action: 'view',
      module: 'blogs',
      description: `Viewed blogs (page ${page})`,
    }).catch(err => console.error('logActivity error:', err));

    return NextResponse.json({ success: true, blogs, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('GET blogs error:', err);
    return NextResponse.json({ success: false, message: 'Failed to fetch blogs' }, { status: 500 });
  }
}

// POST /api/admin/blogs  (multipart)
export async function POST(request) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;

    if (admin.role !== 'super_admin' && !admin.permissions?.blogs?.create)
      return NextResponse.json({ success: false, message: 'Permission denied' }, { status: 403 });

    await connectDB();

    const formData = await request.formData();
    const title            = formData.get('title');
    const excerpt          = formData.get('excerpt') || '';
    const rawCategory      = formData.get('category');
    const category         = (rawCategory && rawCategory !== 'null' && rawCategory !== 'undefined' && rawCategory.trim() !== '') ? rawCategory.trim() : null;
    const status           = formData.get('status') || 'draft';
    const isFeatured       = formData.get('isFeatured') === 'true';
    const coverImageAlt    = formData.get('coverImageAlt') || '';
    const authorName       = formData.get('authorName') || '';
    const authorDesignation= formData.get('authorDesignation') || '';
    const coverImageFile   = formData.get('coverImage');
    const authorImageFile  = formData.get('authorImage');

    let content = [], seo = {}, tags = [];
    try { content = JSON.parse(formData.get('content') || '[]'); } catch {}
    try { seo     = JSON.parse(formData.get('seo')     || '{}'); } catch {}
    try { tags    = JSON.parse(formData.get('tags')    || '[]'); } catch {}

    if (!title?.trim()) {
      return NextResponse.json({ success: false, message: 'Title is required' }, { status: 400 });
    }

    const [coverImage, authorImage] = await Promise.all([
      (coverImageFile instanceof File && coverImageFile.size > 0) ? saveFile(coverImageFile, 'blogs') : Promise.resolve(''),
      (authorImageFile instanceof File && authorImageFile.size > 0) ? saveFile(authorImageFile, 'profiles') : Promise.resolve(''),
    ]);

    // Generate slug from title
    const slug = title.trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const blog = await Blog.create({
      title: title.trim(),
      slug,
      excerpt,
      category: category || null,
      tags,
      content,
      status,
      isFeatured,
      coverImage,
      coverImageAlt,
      author: { 
        name: authorName, 
        image: authorImage, 
        designation: authorDesignation 
      },
      seo,
    });

    logActivity(request, admin, {
      action: 'create',
      module: 'blogs',
      description: `Created blog "${blog.title}"`,
      targetId: blog._id,
      targetName: blog.title,
    }).catch(err => console.error('logActivity error:', err));

    return NextResponse.json({ success: true, message: 'Blog created', blog }, { status: 201 });
  } catch (err) {
    console.error('POST blog error:', err);
    if (err.code === 11000) {
      return NextResponse.json({ 
        success: false, 
        message: 'A blog with this title/slug already exists' 
      }, { status: 409 });
    }
    return NextResponse.json({ 
      success: false, 
      message: err.message || 'Failed to create blog' 
    }, { status: 500 });
  }
}
