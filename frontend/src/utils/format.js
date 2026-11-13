export function resolveProductImage(imageUrl) {
  if (imageUrl && /^(?:\/catalog\/|https?:\/\/)/i.test(imageUrl)) {
    return imageUrl;
  }
  return '/catalog/photo-unavailable.svg';
}

export function formatCurrencyVND(amount) {
  const num = Number(amount || 0);
  return new Intl.NumberFormat('vi-VN').format(num) + ' ₫';
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

