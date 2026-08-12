import {
  Gamepad2,
  Disc3,
  Cable,
  Joystick,
  Wrench,
} from 'lucide-react';

export const CONSOLE_PLATFORMS = [
  { label: 'PlayStation', to: '/shop?categorySlug=consoles&search=playstation' },
  { label: 'Xbox', to: '/shop?categorySlug=consoles&search=xbox' },
  { label: 'Nintendo', to: '/shop?categorySlug=consoles&search=nintendo' },
  { label: 'VR Consoles', to: '/shop?categorySlug=consoles&search=vr' },
];

export const GAMES_DROPDOWN = [
  { label: 'PlayStation Games', to: '/shop?categorySlug=games&search=playstation' },
  { label: 'Xbox Games', to: '/shop?categorySlug=games&search=xbox' },
  { label: 'Nintendo Games', to: '/shop?categorySlug=games&search=nintendo' },
];

export const ACCESSORIES_DROPDOWN = [
  { label: 'Controllers', to: '/shop?categorySlug=accessories&search=controllers' },
  { label: 'Controller accessories', to: '/shop?categorySlug=accessories&search=controller+accessories' },
  { label: 'Headphones', to: '/shop?categorySlug=accessories&search=headphones' },
  { label: 'Chargers', to: '/shop?categorySlug=accessories&search=chargers' },
  { label: 'Gaming cables', to: '/shop?categorySlug=accessories&search=gaming+cables' },
  { label: 'Gaming accessories', to: '/shop?categorySlug=accessories&search=gaming+accessories' },
  {
    label: 'Merchandise',
    to: '/shop?categorySlug=accessories&search=merchandise',
    hasSubmenu: true,
    children: [
      { label: 'Gaming shirts', to: '/shop?categorySlug=accessories&search=gaming+shirts' },
      { label: 'Hoodies', to: '/shop?categorySlug=accessories&search=hoodies' },
      { label: 'Mugs', to: '/shop?categorySlug=accessories&search=mugs' },
      { label: 'Gaming collectibles', to: '/shop?categorySlug=custom-3d-figures' },
    ],
  },
];

export const GIFT_CARDS_DROPDOWN = [
  { label: 'USA region gift cards', to: '/shop?categorySlug=accessories&search=usa+region+gift+cards' },
  { label: 'UK region gift cards', to: '/shop?categorySlug=accessories&search=uk+region+gift+cards' },
  { label: 'UAE region gift cards', to: '/shop?categorySlug=accessories&search=uae+region+gift+cards' },
];

export const MERCHANDISE_DROPDOWN = [
  { label: 'Gaming shirts', to: '/shop?categorySlug=accessories&search=gaming+shirts' },
  { label: 'Hoodies', to: '/shop?categorySlug=accessories&search=hoodies' },
  { label: 'Mugs', to: '/shop?categorySlug=accessories&search=mugs' },
  { label: 'Gaming collectibles', to: '/shop?categorySlug=custom-3d-figures' },
];

export const REPAIR_SELL_DROPDOWN = [
  { label: 'Repair Service', to: '/repair' },
  { label: 'Sell / Trade-In', to: '/sell' },
];

export function buildShopFilterUrl({ categorySlug, search } = {}) {
  const params = new URLSearchParams();
  if (categorySlug) params.set('categorySlug', categorySlug);
  if (search) params.set('search', search);
  return `/shop?${params.toString()}`;
}

export const ACCESSORIES_SUBFILTERS = [
  { label: 'Controllers', categorySlug: 'accessories', search: 'controllers' },
  { label: 'Controller accessories', categorySlug: 'accessories', search: 'controller accessories' },
  { label: 'Headphones', categorySlug: 'accessories', search: 'headphones' },
  { label: 'Chargers', categorySlug: 'accessories', search: 'chargers' },
  { label: 'Gaming cables', categorySlug: 'accessories', search: 'gaming cables' },
  { label: 'Gaming accessories', categorySlug: 'accessories', search: 'gaming accessories' },
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
    iconOutline: '/Icons/Console Outline.png',
    iconFilled: '/Icons/Console Filled.png',
    to: '/shop?categorySlug=consoles',
    dropdown: CONSOLE_PLATFORMS,
    isActive: (loc) =>
      loc.pathname === '/shop' &&
      (loc.search.includes('categorySlug=consoles') ||
        CONSOLE_PLATFORMS.some((sub) => loc.pathname + loc.search === sub.to)),
  },
  {
    id: 'games',
    label: 'Games',
    iconOutline: '/Icons/CD Outline.png',
    iconFilled: '/Icons/CD Filled.png',
    to: '/shop?categorySlug=games',
    dropdown: GAMES_DROPDOWN,
    isActive: (loc) =>
      loc.pathname === '/shop' &&
      (loc.search.includes('categorySlug=games') ||
        GAMES_DROPDOWN.some((sub) => loc.pathname + loc.search === sub.to)),
  },
  {
    id: 'accessories',
    label: 'Accessories',
    iconOutline: '/Icons/Accessories Outline.png',
    iconFilled: '/Icons/Accessories Filled.png',
    to: '/shop?categorySlug=accessories',
    dropdown: ACCESSORIES_DROPDOWN,
    isActive: (loc) =>
      loc.pathname === '/shop' &&
      (loc.search.includes('categorySlug=accessories') ||
        loc.search.includes('categorySlug=custom-3d-figures')) &&
      !loc.search.includes('gift+cards') &&
      !loc.search.includes('region+gift+cards'),
  },
  {
    id: 'home',
    label: 'Home',
    isCenterLogo: true,
    iconOutline: '/Icons/QT Icon.png',
    iconFilled: '/Icons/QT Icon.png',
    to: '/',
    isActive: (loc) => loc.pathname === '/' && !loc.search,
  },
  {
    id: 'gift-cards',
    label: 'Gift Cards',
    iconOutline: '/Icons/Gift Cards.png',
    iconFilled: '/Icons/Gift Card Filled.png',
    to: '/shop?categorySlug=accessories&search=gift+cards',
    dropdown: GIFT_CARDS_DROPDOWN,
    isActive: (loc) =>
      loc.pathname === '/shop' &&
      (loc.search.includes('gift+cards') ||
        loc.search.includes('region+gift+cards') ||
        GIFT_CARDS_DROPDOWN.some((sub) => loc.pathname + loc.search === sub.to)),
  },
  {
    id: 'controller-tester',
    label: 'Controller Tester',
    iconOutline: '/Icons/Controller Tester Outline.png',
    iconFilled: '/Icons/Controller Tester Filled.png',
    to: '/controller-tester',
    isActive: (loc) => loc.pathname === '/controller-tester',
  },
  {
    id: 'repair-and-sell',
    label: 'Repair / Sell',
    iconOutline: '/Icons/Trade Sell Outline.png',
    iconFilled: '/Icons/Trade Sell Filled.png',
    dropdown: REPAIR_SELL_DROPDOWN,
    isActive: (loc) =>
      loc.pathname === '/repair' ||
      loc.pathname === '/sell' ||
      REPAIR_SELL_DROPDOWN.some((sub) => loc.pathname === sub.to),
  },
];
