import { BRAND_NAME } from '../../config/brand';

export const WHATSAPP_PHONE = '923378362834';
export const WHATSAPP_DISPLAY = '03378362834';
export const PHONE_SECONDARY = '03242027133';
export const CONTACT_EMAIL = 'quickturnpk@gmail.com';
export const STORE_ADDRESS = 'Near Chhipa Head Office, Sindhi Muslim Karachi.';

export function getWhatsAppUrl(message = `Hi, I need help with a product on ${BRAND_NAME}.`) {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}
