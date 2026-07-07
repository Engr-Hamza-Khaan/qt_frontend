import {
  Gamepad2,
  Disc3,
  Cable,
  Joystick,
  Wrench,
} from 'lucide-react';

export const CONSOLE_PLATFORMS = [
  { label: 'PlayStation', to: '/shop?search=playstation' },
  { label: 'Xbox', to: '/shop?search=xbox' },
  { label: 'Nintendo', to: '/shop?search=nintendo' },
  { label: 'VR Consoles', to: '/shop?search=vr+consoles' },
];

export function buildShopFilterUrl({ categorySlug, search } = {}) {
  const params = new URLSearchParams();
  if (categorySlug) params.set('categorySlug', categorySlug);
  if (search) params.set('search', search);
  return `/shop?${params.toString()}`;
}

export const ACCESSORIES_SUBFILTERS = [
  { label: 'Gift Cards', categorySlug: 'accessories', search: 'gift cards' },
  { label: 'Merchandise', categorySlug: 'accessories', search: 'merchandise' },
  { label: 'Custom 3D Figures', categorySlug: 'custom-3d-figures' },
];

export const ACCESSORIES_ITEMS = ACCESSORIES_SUBFILTERS.map((item) => ({
  ...item,
  to: buildShopFilterUrl(item),
}));

/** Categories rendered inside a parent accordion instead of a flat row */
export const CATEGORY_ACCORDION_SLUGS = ['accessories'];

/** Hidden from flat list — shown under their parent accordion */
export const NESTED_CATEGORY_SLUGS = ['custom-3d-figures'];

export const SHOP_CATEGORY_ORDER = ['consoles', 'games', 'accessories'];

export const STORE_NAV = [
  {
    id: 'consoles',
    label: 'Consoles',
    icon: Gamepad2,
    dropdown: CONSOLE_PLATFORMS,
    isActive: (loc) =>
      CONSOLE_PLATFORMS.some((item) => loc.pathname + loc.search === item.to) ||
      loc.search.includes('search=playstation') ||
      loc.search.includes('search=xbox') ||
      loc.search.includes('search=nintendo') ||
      loc.search.includes('search=vr'),
  },
  {
    id: 'games',
    label: 'Games',
    icon: Disc3,
    to: '/shop?categorySlug=games',
    isActive: (loc) => loc.search.includes('categorySlug=games'),
  },
  {
    id: 'accessories',
    label: 'Accessories',
    icon: Cable,
    to: '/shop?categorySlug=accessories',
    dropdown: ACCESSORIES_ITEMS,
    isActive: (loc) =>
      loc.search.includes('categorySlug=accessories') ||
      loc.search.includes('categorySlug=custom-3d-figures'),
  },
  {
    id: 'controller-tester',
    label: 'Controller Tester',
    icon: Joystick,
    to: '/controller-tester',
    isActive: (loc) => loc.pathname === '/controller-tester',
  },
  {
    id: 'repair-and-sell',
    label: 'Repair and Sell',
    icon: Wrench,
    dropdown: [
      { label: 'Repair', to: '/repair' },
      { label: 'Sell / Trade-In', to: '/sell' },
    ],
    isActive: (loc) => loc.pathname === '/repair' || loc.pathname === '/sell',
  },
];
