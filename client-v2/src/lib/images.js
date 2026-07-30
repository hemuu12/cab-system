const CLOUDINARY_UPLOAD = '/image/upload/';
const RESPONSIVE_WIDTHS = [360, 640, 960, 1280];

export const optimizedImageUrl = (url, width = 960) => {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes(CLOUDINARY_UPLOAD)) return url;
  const transformation = `f_auto,q_auto:eco,c_limit,w_${Math.max(1, Math.round(width))}`;
  return url.replace(CLOUDINARY_UPLOAD, `${CLOUDINARY_UPLOAD}${transformation}/`);
};

export const responsiveImageSet = (url, widths = RESPONSIVE_WIDTHS) => {
  if (!url?.includes('res.cloudinary.com') || !url.includes(CLOUDINARY_UPLOAD)) return undefined;
  return widths.map(width => `${optimizedImageUrl(url, width)} ${width}w`).join(', ');
};
