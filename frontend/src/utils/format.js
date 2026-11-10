const PRODUCT_IMAGE_MAP = {
  'iphone-15.jpg': 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=80',
  's24-ultra.jpg': 'https://images.unsplash.com/photo-1707227156499-4a2b829c9b4d?auto=format&fit=crop&w=900&q=80',
  'xiaomi-14.jpg': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80',
  'oppo-find.jpg': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
  'iphone-14.jpg': 'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?auto=format&fit=crop&w=900&q=80',
  'macbook-m3.jpg': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
  'thinkpad-x1.jpg': 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=900&q=80',
  'dell-xps.jpg': 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=900&q=80',
  'asus-rog.jpg': 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80',
  'ipad-pro.jpg': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80',
  'tab-s9.jpg': 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=900&q=80',
};

const FALLBACK_TECH_IMAGE =
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=900&q=80';

export function resolveProductImage(imageUrl, productName = '') {
  if (!imageUrl) return FALLBACK_TECH_IMAGE;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  if (PRODUCT_IMAGE_MAP[imageUrl]) {
    return PRODUCT_IMAGE_MAP[imageUrl];
  }
  const lower = productName.toLowerCase();
  if (lower.includes('iphone')) return PRODUCT_IMAGE_MAP['iphone-15.jpg'];
  if (lower.includes('macbook') || lower.includes('laptop')) return PRODUCT_IMAGE_MAP['macbook-m3.jpg'];
  if (lower.includes('ipad') || lower.includes('tab')) return PRODUCT_IMAGE_MAP['ipad-pro.jpg'];
  return FALLBACK_TECH_IMAGE;
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
