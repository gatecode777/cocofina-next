/** @type {import('next').NextConfig} */
const nextConfig = {
  // Serve uploaded files from /public/uploads
  // Files saved to public/uploads/** are automatically served at /uploads/**
  
  images: {
    // If you use next/image, whitelist your own domain
    remotePatterns: [],
    // Allow local images from /public
    unoptimized: false,
  },

  // Allow importing CSS from node_modules (e.g. swiper)
  transpilePackages: ['swiper'],

  // Disable strict mode if you face double-render issues during dev
  reactStrictMode: false,

  // Required for mongoose to work in Next.js API routes
  serverExternalPackages: ['mongoose', 'bcryptjs'],

  experimental: {
    // Needed for file upload (multer / formData parsing)
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;