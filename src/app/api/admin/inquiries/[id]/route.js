// src/app/api/admin/inquiries/[id]/route.js
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/logActivity';
import Inquiry from '@/models/Inquiry';
import inquiryEmitter from '@/lib/inquiryEvents';

// PATCH /api/admin/inquiries/[id] — update status or notes
export async function PATCH(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;

    await connectDB();
    const { id } = params;

    const body = await request.json().catch(() => ({}));
    const { status, notes } = body;

    const updateFields = {};
    if (status) {
      if (!['new', 'read', 'in_progress', 'resolved', 'archived'].includes(status)) {
        return NextResponse.json(
          { success: false, message: 'Invalid status value' },
          { status: 400 }
        );
      }
      updateFields.status = status;
    }

    if (notes !== undefined) {
      updateFields.notes = String(notes).trim();
    }

    const updatedInquiry = await Inquiry.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedInquiry) {
      return NextResponse.json(
        { success: false, message: 'Inquiry not found' },
        { status: 404 }
      );
    }

    // Broadcast update to real-time subscribers
    try {
      inquiryEmitter.emit('inquiry-updated', {
        id: updatedInquiry._id,
        status: updatedInquiry.status,
        notes: updatedInquiry.notes,
        updatedAt: updatedInquiry.updatedAt,
      });
    } catch (e) {
      console.error('Error emitting inquiry-updated event:', e);
    }

    await logActivity(request, admin, {
      action: 'edit',
      module: 'inquiries',
      description: `Updated inquiry ${id} (status: ${updatedInquiry.status})`,
      targetId: id,
      targetName: updatedInquiry.name,
    });

    return NextResponse.json({
      success: true,
      message: 'Inquiry updated successfully',
      inquiry: updatedInquiry,
    });
  } catch (err) {
    console.error('Error updating inquiry:', err);
    return NextResponse.json(
      { success: false, message: 'Server error while updating inquiry' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/inquiries/[id] — remove inquiry
export async function DELETE(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;

    await connectDB();
    const { id } = params;

    const deleted = await Inquiry.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Inquiry not found' },
        { status: 404 }
      );
    }

    // Broadcast deletion to real-time subscribers
    try {
      inquiryEmitter.emit('inquiry-deleted', { id });
    } catch (e) {
      console.error('Error emitting inquiry-deleted event:', e);
    }

    await logActivity(request, admin, {
      action: 'delete',
      module: 'inquiries',
      description: `Deleted inquiry ${id} from ${deleted.name}`,
      targetId: id,
      targetName: deleted.name,
    });

    return NextResponse.json({
      success: true,
      message: 'Inquiry deleted successfully',
    });
  } catch (err) {
    console.error('Error deleting inquiry:', err);
    return NextResponse.json(
      { success: false, message: 'Server error while deleting inquiry' },
      { status: 500 }
    );
  }
}
