// src/lib/apiHelpers.js
import { NextResponse } from 'next/server';

export const ok   = (data, status = 200)  => NextResponse.json({ success: true,  ...data }, { status });
export const fail = (msg,  status = 400)  => NextResponse.json({ success: false, message: msg }, { status });
export const err  = (e,    fallback = 'Server error') => {
  console.error(e);
  if (e.code === 11000) {
    const field = Object.keys(e.keyValue || {})[0] || 'field';
    return fail(`${field} already exists`, 409);
  }
  return NextResponse.json({ success: false, message: e.message || fallback }, { status: 500 });
};

// Parse JSON body safely
export const parseBody = async (request) => {
  try { return await request.json(); }
  catch { return {}; }
};

// Parse multipart/form-data using native Web APIs (no multer needed in Next.js)
export const parseForm = async (request) => {
  const formData = await request.formData();
  const fields = {};
  const files  = {};
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      if (!files[key]) files[key] = [];
      files[key].push(value);
    } else {
      fields[key] = value;
    }
  }
  return { fields, files };
};

// Save an uploaded File object to public/uploads/<folder>/<filename>
export const saveFile = async (file, folder = 'products') => {
  const { writeFile, mkdir } = await import('fs/promises');
  const { join, extname } = await import('path');

  const uploadDir = join(process.cwd(), 'public', 'uploads', folder);
  await mkdir(uploadDir, { recursive: true });

  const ext      = extname(file.name) || '.jpg';
  const filename = `${folder}-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
  const filepath = join(uploadDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  return filename; // return just the filename, not the full path
};

// Delete a file from public/uploads/<folder>/<filename>
export const deleteFile = async (filename, folder = 'products') => {
  if (!filename) return;
  const { unlink } = await import('fs/promises');
  const { join }   = await import('path');
  const filepath = join(process.cwd(), 'public', 'uploads', folder, filename);
  try { await unlink(filepath); } catch { /* already gone */ }
};