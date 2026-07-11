// src/lib/apiHelpers.js
import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

// Memoized ImageKit instance
let imagekitInstance = null;
const getImageKitInstance = () => {
  if (!imagekitInstance) {
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    if (publicKey && privateKey && urlEndpoint) {
      let endpoint = urlEndpoint;
      if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
        endpoint = `https://${endpoint}`;
      }
      imagekitInstance = new ImageKit({
        publicKey,
        privateKey,
        urlEndpoint: endpoint
      });
    }
  }
  return imagekitInstance;
};

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

// Save an uploaded File object to ImageKit or fallback to public/uploads/<folder>/<filename>
export const saveFile = async (file, folder = 'products') => {
  const { extname } = await import('path');

  const ext      = extname(file.name) || '.jpg';
  const filename = `${folder}-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const ik = getImageKitInstance();
  if (ik) {
    try {
      const response = await ik.upload({
        file: buffer,
        fileName: filename,
        folder: `/cocofina/${folder}`,
      });
      return response.url; // Return the absolute ImageKit URL
    } catch (error) {
      console.error('ImageKit upload failed, falling back to local storage:', error);
    }
  }

  // Fallback to local
  const { writeFile, mkdir } = await import('fs/promises');
  const { join } = await import('path');

  const uploadDir = join(process.cwd(), 'public', 'uploads', folder);
  await mkdir(uploadDir, { recursive: true });
  const filepath = join(uploadDir, filename);

  await writeFile(filepath, buffer);
  return filename; // return just the filename for local compatibility
};

// Delete a file
export const deleteFile = async (filename, folder = 'products') => {
  if (!filename) return;
  // If it's an ImageKit URL, skip deleting it or do nothing
  if (filename.startsWith('http')) {
    return;
  }
  // User requested: "do not remove any local images also if somewhere image comes from local then let it be"
  // So we skip deleting the local files.
};