const STATIC_IMAGES = [
  "cocofinaproduct.png",
  "cocofina.png",
  "banner.png",
  "default-product.png",
  "product_400g.png",
  "product_1kg.png",
  "01.png",
  "02.png",
  "03.webp",
  "04.webp",
];

export const getUploadUrl = (filename, folder = 'products') => {
  if (!filename) return '/cocofinaproduct.png';
  if (typeof filename !== 'string') return '/cocofinaproduct.png';

  if (
    filename.startsWith('http://') ||
    filename.startsWith('https://') ||
    filename.startsWith('data:') ||
    filename.startsWith('blob:') ||
    filename.startsWith('/')
  ) {
    return filename;
  }

  const cleanName = filename.replace(/^\/+/, '');

  if (cleanName.startsWith('images/') || cleanName.startsWith('assets/') || STATIC_IMAGES.includes(cleanName)) {
    return `/${cleanName}`;
  }

  return `/uploads/${folder}/${cleanName}`;
};

export const getProductImageUrl = (filename) => {
  return getUploadUrl(filename, 'products') || '/cocofinaproduct.png';
};
