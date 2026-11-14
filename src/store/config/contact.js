import { BRAND_NAME } from '../../config/brand';

export const WHATSAPP_PHONE = '923378362834';
export const WHATSAPP_DISPLAY = '03378362834';
export const PHONE_SECONDARY = '03242027133';
export const CONTACT_EMAIL = 'quickturnpk@gmail.com';
export const STORE_ADDRESS = 'Near Chhipa Head Office, Sindhi Muslim Karachi.';

export function getWhatsAppUrl(message = `Hi, I need help with a product on ${BRAND_NAME}.`) {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

export const ONLINE_STORE_LABEL = 'Online Store (For Visit Contact Us)';

// Social links — replace with the real profile URLs.
export const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/quickturnpk',
  instagram: 'https://www.instagram.com/quickturnpk',
  youtube: 'https://www.youtube.com/@quickturnpk',
  tiktok: 'https://www.tiktok.com/@quickturnpk',
  linkedin: 'https://www.linkedin.com/company/quickturnpk',
};

// Shown on checkout when "Bank Transfer" is selected. Optional qrImage: path to an image in /public.
export const BANK_DETAILS = {
  accountTitle: 'Muhammad Amin Khan',
  iban: 'PKTIMEZN0001200108683978',
  accountNumber: '01200108683978',
  bank: 'Meezan Bank',
  branch: 'Khalid Bin Walid Road Branch',
  qrImage: '',
};
