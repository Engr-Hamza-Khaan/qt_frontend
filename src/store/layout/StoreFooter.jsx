import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Facebook, Instagram, ChevronDown } from 'lucide-react';
import BrandLogo from '../../components/ui/BrandLogo';
import { BRAND_NAME } from '../../config/brand';
import { WHATSAPP_DISPLAY, getWhatsAppUrl } from '../config/contact';

function FooterAccordionSection({ title, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-neon-purple/15 sm:border-0">
      <button
        type="button"
        className="flex w-full items-center justify-between py-4 sm:hidden text-left"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <h4 className="text-white font-semibold text-sm font-display">{title}</h4>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <h4 className="hidden sm:block text-white font-semibold mb-4 text-sm font-display">{title}</h4>

      <div className={`pb-4 sm:pb-0 ${open ? 'block' : 'hidden'} sm:block`}>
        {children}
      </div>
    </div>
  );
}

function StoreFooter() {
  return (
    <footer className="mt-auto border-t border-neon-purple/20" style={{ background: 'rgba(8, 5, 15, 0.98)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 sm:gap-8">
          <div className="pb-6 sm:pb-0 border-b border-neon-purple/15 sm:border-0">
            <Link to="/" className="inline-block mb-4">
              <BrandLogo
                variant="white"
                logoSize="md"
                nameClassName="text-lg font-bold text-white leading-none"
                subtitleClassName="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5"
              />
            </Link>
            <p className="text-sm leading-relaxed mb-4 text-gray-400">
              Premium consoles, games, accessories &amp; gaming merch. New and pre-owned
              gear at the best prices in Pakistan.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-neon-purple/15 border border-neon-purple/30 flex items-center justify-center hover:bg-neon-purple/25 hover:border-neon-purple/50 transition text-gray-300" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-neon-purple/15 border border-neon-purple/30 flex items-center justify-center hover:bg-neon-purple/25 hover:border-neon-purple/50 transition text-gray-300" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          <FooterAccordionSection title="Quick Links">
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link to="/shop" className="hover:text-neon-purple transition">All Products</Link></li>
              <li><Link to="/shop?featured=true" className="hover:text-neon-purple transition">Featured</Link></li>
              <li><Link to="/shop?flashSale=true" className="hover:text-neon-purple transition">Deals & Offers</Link></li>
              <li><Link to="/sell" className="hover:text-neon-purple transition">Sell / Trade-In</Link></li>
              <li><Link to="/repair" className="hover:text-neon-purple transition">Repair Service</Link></li>
            </ul>
          </FooterAccordionSection>

          <FooterAccordionSection title="Customer Service">
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link to="/page/about-us" className="hover:text-neon-purple transition">About Us</Link></li>
              <li><Link to="/page/shipping-policy" className="hover:text-neon-purple transition">Shipping Policy</Link></li>
              <li><Link to="/page/return-policy" className="hover:text-neon-purple transition">Return Policy</Link></li>
            </ul>
          </FooterAccordionSection>

          <FooterAccordionSection title="Contact Us">
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-neon-purple" />
                <span>Karachi, Sindh, Pakistan</span>
              </li>
              <li className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 text-neon-purple fill-current" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neon-purple transition"
                >
                  {WHATSAPP_DISPLAY}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0 text-neon-purple" />
                <a href="mailto:info@quickturn.pk" className="hover:text-neon-purple transition">info@quickturn.pk</a>
              </li>
            </ul>
          </FooterAccordionSection>
        </div>

        <div className="border-t border-neon-purple/15 mt-6 sm:mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p className="text-center sm:text-left">© {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span>Cash on Delivery</span>
            <span className="hidden xs:inline">•</span>
            <span>Bank Transfer</span>
            <span className="hidden xs:inline">•</span>
            <span>Secure Checkout</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default StoreFooter;
