

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/logActivity';
import Blog from '@/models/Blog';
import mongoose from 'mongoose';
export const dynamic = "force-dynamic";

export async function PUT(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();
    
    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid blog ID' }, { status: 400 });
    }
    
    const { status } = await request.json();
    if (!['draft', 'published', 'archived'].includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
    }
    
    const updateData = { status };
    if (status === 'published') {
      updateData.publishedAt = new Date();
    }
    
    console.log('Updating blog:', id, 'to status:', status);
    
    const blog = await Blog.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!blog) {
      return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });
    }
    
    await logActivity(request, admin, {
      action: 'toggle_status',
      module: 'blogs',
      description: `Updated blog status to "${blog.status}"`,
      targetId: blog._id,
      targetName: blog.title,
    });

    console.log('Updated blog status to:', blog.status);
    
    return NextResponse.json({ 
      success: true, 
      message: `Blog status updated to ${status}`, 
      blog 
    });
    
  } catch (err) {
    console.error('Status update error:', err);
    return NextResponse.json({ 
      success: false, 
      message: 'Server error: ' + err.message 
    }, { status: 500 });
  }
}