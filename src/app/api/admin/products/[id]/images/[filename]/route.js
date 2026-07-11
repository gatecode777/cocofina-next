// src/app/api/admin/products/[id]/images/[filename]/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { deleteFile } from '@/lib/apiHelpers';
import Product from '@/models/Product';

export async function DELETE(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();

    const { id, filename } = params;

    // Find the product first to check if it exists and get current images
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    // Check if image exists in the product
    const imageExists = product.images?.includes(filename);
    if (!imageExists) {
      return NextResponse.json({ success: false, message: 'Image not found in product' }, { status: 404 });
    }

    // Prepare update data
    const updatedImages = (product.images || []).filter(img => img !== filename);
    const updatedThumbnail = product.thumbnail === filename ? (updatedImages[0] || '') : product.thumbnail;

    // Using findByIdAndUpdate instead of save()
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        $set: {
          images: updatedImages,
          thumbnail: updatedThumbnail
        }
      },
      { new: true } // Return the updated document
    );

    if (!updatedProduct) {
      return NextResponse.json({ success: false, message: 'Failed to update product' }, { status: 500 });
    }

    // Delete the actual file from storage
    await deleteFile(filename, 'products');

    return NextResponse.json({ 
      success: true, 
      message: 'Image deleted successfully',
      images: updatedProduct.images,
      thumbnail: updatedProduct.thumbnail
    });
    
  } catch (err) {
    console.error('Error deleting image:', err);
    return NextResponse.json({ success: false, message: 'Server error: ' + err.message }, { status: 500 });
  }
}
