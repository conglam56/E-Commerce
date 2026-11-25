import React from 'react';
import { resolveProductImage } from '../utils/format';
import officialProductPhotos from '../utils/officialProductPhotos';

export default function ProductImage({ imageUrl, fallbackUrl, ...props }) {
  const fallback = resolveProductImage(fallbackUrl || imageUrl);
  const primary = officialProductPhotos.get(imageUrl) || resolveProductImage(imageUrl);

  const handleError = ({ currentTarget }) => {
    const currentSource = currentTarget.getAttribute('src');
    const placeholder = resolveProductImage();

    if (currentSource !== fallback) {
      currentTarget.src = fallback;
    } else if (currentSource !== placeholder) {
      currentTarget.src = placeholder;
    }
  };

  return <img {...props} src={primary} onError={handleError} />;
}
