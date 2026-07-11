export const getUploadUrl = (filename, folder = 'products') => {
  if (!filename) return '';
  if (
    typeof filename === 'string' && (
      filename.startsWith('http://') ||
      filename.startsWith('https://') ||
      filename.startsWith('data:') ||
      filename.startsWith('blob:')
    )
  ) {
    return filename;
  }
  return `https://ik.imagekit.io/zjd5xircoy/cocofina/${folder}/${filename}`;
};
