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

export function formatPlatformLabel(platform) {
  if (!platform) return '';
  const str = String(platform).trim();
  const lower = str.toLowerCase();

  // Exclude non-gaming-platform categories like Software, Hardware, Accessories, etc.
  if (['software', 'hardware', 'accessories', 'games', 'gaming', 'store', 'uncategorized'].includes(lower)) {
    return '';
  }

  if (lower.includes('xbox series') || lower === 'xbox series x' || lower === 'xbox series s') return 'XBOX';
  if (lower.includes('xbox one')) return 'XBOX ONE';
  if (lower.includes('xbox')) return 'XBOX';

  if (lower.includes('nintendo switch') || lower.includes('switch')) return 'NINTENDO';
  if (lower.includes('nintendo')) return 'NINTENDO';

  if (lower.includes('playstation 5') || lower === 'ps5') return 'PS5';
  if (lower.includes('playstation 4') || lower === 'ps4') return 'PS4';
  if (lower.includes('playstation 3') || lower === 'ps3') return 'PS3';
  if (lower.includes('playstation')) return 'PLAYSTATION';

  if (lower === 'pc' || lower.includes('windows')) return 'PC';

  return str.toUpperCase();
}

export function getProductConditionTag(product) {
  if (!product) return null;

  let cond = product.condition;
  if (!cond && Array.isArray(product.variations) && product.variations.length > 0) {
    cond = product.variations.find((v) => v.condition)?.condition;
  }
  if (!cond && product.attributes?.condition) {
    cond = product.attributes.condition;
  }

  if (!cond) return null;

  const lower = String(cond).toLowerCase().trim();

  if (lower === 'new' || lower === 'brand new') {
    return {
      label: 'NEW',
      className: 'bg-emerald-500 text-white font-black border border-emerald-400/50 shadow-md',
    };
  }

  if (lower === 'used' || lower === 'pre-owned' || lower === 'preowned' || lower === 'old' || lower === 'refurbished') {
    return {
      label: 'OLD',
      className: 'bg-amber-500 text-slate-950 font-black border border-amber-400/50 shadow-md',
    };
  }

  return {
    label: String(cond).toUpperCase(),
    className: 'bg-slate-800 text-white font-bold border border-slate-700 shadow-md',
  };
}

export function getPlatformBadgeStyle(platform) {
  const formatted = formatPlatformLabel(platform);

  switch (formatted) {
    case 'XBOX':
    case 'XBOX ONE':
      return 'bg-[#107C41] text-white border border-[#107C41] shadow-md font-extrabold';
    case 'NINTENDO':
    case 'SWITCH':
      return 'bg-[#E60012] text-white border border-[#E60012] shadow-md font-extrabold';
    case 'PS4':
      return 'bg-[#003087] text-white border border-[#003087] shadow-md font-extrabold';
    case 'PS5':
      return 'bg-white text-[#002060] border border-white shadow-md font-black';
    case 'PC':
      return 'bg-cyan-600 text-white border border-cyan-600 shadow-md font-extrabold';
    default:
      return 'bg-slate-800 text-white border border-slate-700 shadow-md font-bold';
  }
}

export function getProductPlatforms(product) {
  if (!product) return [];

  const rawPlatforms = [];

  // 1. Check all variation platforms
  if (Array.isArray(product.variations)) {
    product.variations.forEach((v) => {
      if (v?.platform) rawPlatforms.push(v.platform);
    });
  }

  // 2. Check product.attributes.platform
  if (product?.attributes?.platform) {
    if (Array.isArray(product.attributes.platform)) {
      rawPlatforms.push(...product.attributes.platform);
    } else {
      rawPlatforms.push(product.attributes.platform);
    }
  }

  // 3. Check product.platform
  if (product?.platform) {
    rawPlatforms.push(product.platform);
  }

  // 4. Check category platform
  if (product?.category?.platform) {
    rawPlatforms.push(product.category.platform);
  }

  // 5. Check tags for known platforms
  if (Array.isArray(product?.tags)) {
    const known = ['PS5', 'PS4', 'Xbox', 'Xbox Series X', 'Xbox One', 'Nintendo', 'Nintendo Switch', 'Switch', 'PC'];
    product.tags.forEach((tag) => {
      const match = known.find((k) => k.toLowerCase() === String(tag).toLowerCase());
      if (match) rawPlatforms.push(match);
    });
  }

  // 6. Check title for platform mentions if rawPlatforms is empty
  if (rawPlatforms.length === 0 && product?.title) {
    const title = product.title;
    if (/\bps5\b|playstation 5/i.test(title)) rawPlatforms.push('PS5');
    if (/\bps4\b|playstation 4/i.test(title)) rawPlatforms.push('PS4');
    if (/\bxbox\b/i.test(title)) rawPlatforms.push('XBOX');
    if (/\bnintendo\b|\bswitch\b/i.test(title)) rawPlatforms.push('NINTENDO');
    if (/\bpc\b/i.test(title)) rawPlatforms.push('PC');
  }

  // Format and deduplicate
  const formattedSet = new Set();
  const result = [];

  rawPlatforms.forEach((p) => {
    const formatted = formatPlatformLabel(p);
    if (formatted && !formattedSet.has(formatted)) {
      formattedSet.add(formatted);
      result.push(formatted);
    }
  });

  return result;
}

