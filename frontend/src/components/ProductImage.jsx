import React from 'react';
import { resolveProductImage } from '../utils/format';
import officialProductPhotos from '../utils/officialProductPhotos';

export default function ProductImage({ imageUrl, ...props }) {
  const fallback = resolveProductImage(imageUrl);

  const handleError = ({ currentTarget }) => {
    const currentSource = currentTarget.getAttribute('src');
    const placeholder = resolveProductImage();

    if (currentSource !== fallback) {
      currentTarget.src = fallback;
    } else if (currentSource !== placeholder) {
      currentTarget.src = placeholder;
    }
  };

  return <img {...props} src={officialProductPhotos.get(imageUrl) || fallback} onError={handleError} />;
}
