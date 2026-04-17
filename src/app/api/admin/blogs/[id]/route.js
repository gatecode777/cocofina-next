// src/app/api/admin/blogs/[id]/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { saveFile, deleteFile } from '@/lib/apiHelpers';
import Blog from '@/models/Blog';

export async function GET(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();
    const blog = await Blog.findById(params.id).populate('category', 'name slug').lean();
    if (!blog) return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });
    return NextResponse.json({ success: true, blog });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();

    const blog = await Blog.findById(params.id);
    if (!blog) return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });

    const formData = await request.formData();
    const title            = formData.get('title');
    const excerpt          = formData.get('excerpt');
    const category         = formData.get('category');
    const status           = formData.get('status');
    const isFeatured       = formData.get('isFeatured');
    const coverImageAlt    = formData.get('coverImageAlt');
    const authorName       = formData.get('authorName');
    const authorDesignation= formData.get('authorDesignation');
    const slug             = formData.get('slug');
    const coverImageFile   = formData.get('coverImage');
    const authorImageFile  = formData.get('authorImage');

    if (title      !== null) blog.title     = title.trim();
    if (slug       !== null && slug?.trim()) blog.slug = slug.trim().toLowerCase().replace(/\s+/g, '-');
    if (excerpt    !== null) blog.excerpt   = excerpt;
    if (category   !== null) blog.category  = category || null;
    if (status     !== null) blog.status    = status;
    if (isFeatured !== null) blog.isFeatured = isFeatured === 'true';
    if (coverImageAlt    !== null) blog.coverImageAlt    = coverImageAlt;
    if (authorName       !== null) blog.author.name       = authorName;
    if (authorDesignation!== null) blog.author.designation = authorDesignation;

    const rawContent = formData.get('content');
    const rawSeo     = formData.get('seo');
    const rawTags    = formData.get('tags');
    if (rawContent !== null) try { blog.content = JSON.parse(rawContent); } catch {}
    if (rawSeo     !== null) try { blog.seo     = JSON.parse(rawSeo);     } catch {}
    if (rawTags    !== null) try { blog.tags    = JSON.parse(rawTags);    } catch {}

    if (coverImageFile instanceof File) {
      await deleteFile(blog.coverImage, 'blogs');
      blog.coverImage = await saveFile(coverImageFile, 'blogs');
    }
    if (authorImageFile instanceof File) {
      await deleteFile(blog.author.image, 'profiles');
      blog.author.image = await saveFile(authorImageFile, 'profiles');
    }

    await blog.save();
    return NextResponse.json({ success: true, message: 'Blog updated', blog });
  } catch (err) {
    if (err.code === 11000) return NextResponse.json({ success: false, message: 'Slug already exists' }, { status: 409 });
    return NextResponse.json({ success: false, message: 'Failed to update blog' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();
    const blog = await Blog.findByIdAndDelete(params.id);
    if (!blog) return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });
    await deleteFile(blog.coverImage, 'blogs');
    return NextResponse.json({ success: true, message: 'Blog deleted' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}