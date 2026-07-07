import { BRAND_NAME } from '../../config/brand';

export const WHATSAPP_PHONE = '923001234567';
export const WHATSAPP_DISPLAY = '+92 300 1234567';

export function getWhatsAppUrl(message = `Hi, I need help with a product on ${BRAND_NAME}.`) {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}
