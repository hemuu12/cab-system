import { v2 as cloudinary } from 'cloudinary';

if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ secure: true });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

export const isCloudinaryConfigured = () => Boolean(
  process.env.CLOUDINARY_URL ||
  (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
);

export function uploadImage(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'image', overwrite: false, ...options },
      (error, result) => error ? reject(error) : resolve(result)
    );
    stream.end(buffer);
  });
}

export function deleteImage(publicId) {
  return cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
}
