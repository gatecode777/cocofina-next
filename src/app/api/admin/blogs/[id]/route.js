// src/app/api/admin/blogs/[id]/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/logActivity';
import { saveFile, deleteFile } from '@/lib/apiHelpers';
import Blog from '@/models/Blog';

export async function GET(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();
    const blog = await Blog.findById(params.id).populate('category', 'name slug').lean();
    if (!blog) return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });
    
    await logActivity(request, admin, {
      action: 'view',
      module: 'blogs',
      description: `Viewed blog "${blog.title}"`,
      targetId: blog._id,
      targetName: blog.title,
    });

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

    const formData = await request.formData();

    const updateData = {};

    const title = formData.get('title');
    if (title !== null) updateData.title = title.trim();

    const slug = formData.get('slug');
    if (slug !== null && slug?.trim()) {
      updateData.slug = slug.trim().toLowerCase().replace(/\s+/g, '-');
    }

    const excerpt = formData.get('excerpt');
    if (excerpt !== null) updateData.excerpt = excerpt;

    const category = formData.get('category');
    if (category !== null) updateData.category = category || null;

    const status = formData.get('status');
    if (status !== null) updateData.status = status;

    const isFeatured = formData.get('isFeatured');
    if (isFeatured !== null) updateData.isFeatured = isFeatured === 'true';

    const coverImageAlt = formData.get('coverImageAlt');
    if (coverImageAlt !== null) updateData.coverImageAlt = coverImageAlt;

    const authorName = formData.get('authorName');
    if (authorName !== null) updateData['author.name'] = authorName;

    const authorDesignation = formData.get('authorDesignation');
    if (authorDesignation !== null) updateData['author.designation'] = authorDesignation;

    const rawContent = formData.get('content');
    if (rawContent !== null) {
      try { updateData.content = JSON.parse(rawContent); } catch {}
    }

    const rawSeo = formData.get('seo');
    if (rawSeo !== null) {
      try { updateData.seo = JSON.parse(rawSeo); } catch {}
    }

    const rawTags = formData.get('tags');
    if (rawTags !== null) {
      try { updateData.tags = JSON.parse(rawTags); } catch {}
    }

    // Fetch existing blog (needed for deleting old images)
    const existingBlog = await Blog.findById(params.id);
    if (!existingBlog) {
      return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });
    }

    const coverImageFile = formData.get('coverImage');
    if (coverImageFile instanceof File) {
      await deleteFile(existingBlog.coverImage, 'blogs');
      updateData.coverImage = await saveFile(coverImageFile, 'blogs');
    }

    const authorImageFile = formData.get('authorImage');
    if (authorImageFile instanceof File) {
      await deleteFile(existingBlog.author.image, 'profiles');
      updateData['author.image'] = await saveFile(authorImageFile, 'profiles');
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    await logActivity(request, admin, {
      action: 'edit',
      module: 'blogs',
      description: `Updated blog "${updatedBlog.title}"`,
      targetId: updatedBlog._id,
      targetName: updatedBlog.title,
    });

    return NextResponse.json({
      success: true,
      message: 'Blog updated',
      blog: updatedBlog
    });

  } catch (err) {
    if (err.code === 11000) {
      return NextResponse.json({ success: false, message: 'Slug already exists' }, { status: 409 });
    }
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