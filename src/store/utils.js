export const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function getMediaUrl(path) {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

export function getProductImage(product) {
  const featured = product?.media?.find((m) => m.isFeatured) || product?.media?.[0];
  return getMediaUrl(featured?.url);
}

export function getLowestPrice(product) {
  const variations = product?.variations || [];
  if (!variations.length) return 0;
  return Math.min(...variations.map((v) => parseFloat(v.price) || 0));
}

export function getTotalStock(product) {
  return (product?.variations || []).reduce((sum, v) => sum + (v.stockQuantity || 0), 0);
}

export function getProductPlatforms(product) {
  const platforms = [
    ...new Set(
      (product?.variations || [])
        .map((v) => v.platform)
        .filter(Boolean),
    ),
  ];

  if (!platforms.length && product?.category?.platform) {
    platforms.push(product.category.platform);
  }

  return platforms;
}
