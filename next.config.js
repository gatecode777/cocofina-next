/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Add this for EC2 deployment
  output: 'standalone',

  // Serve uploaded files from /public/uploads
  images: {
    remotePatterns: [],
    unoptimized: false,
  },

  // Allow importing CSS from node_modules (e.g. swiper)
  transpilePackages: ['swiper'],

  // Disable strict mode
  reactStrictMode: false,

  // Required for mongoose to work in Next.js API routes
  // serverExternalPackages: ['mongoose', 'bcryptjs'],

  experimental: {
    // Needed for file upload (multer / formData parsing)
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;