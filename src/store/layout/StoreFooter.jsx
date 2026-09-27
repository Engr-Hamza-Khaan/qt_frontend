import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Facebook, Instagram, ChevronDown } from 'lucide-react';
import { BRAND_NAME } from '../../config/brand';
import { WHATSAPP_DISPLAY, getWhatsAppUrl } from '../config/contact';
import { openTermsModal } from '../components/TermsModal';

function FooterAccordionSection({ title, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-blue-500/15 sm:border-0">
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
  const handleOpenTerms = (e) => {
    e.preventDefault();
    openTermsModal();
  };

  return (
    <footer className="mt-auto border-t border-blue-500/20" style={{ background: 'rgba(5, 12, 56, 0.98)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Column 1: Brand Info & Socials (5 cols) */}
          <div className="md:col-span-5 pb-4 md:pb-0 border-b md:border-0 border-blue-500/15">
            <Link to="/" className="inline-flex items-center gap-2.5 group mb-4">
              <img
                src="/logo(white).png"
                alt="Quick Turn Logo"
                className="h-10 w-auto object-contain drop-shadow-[0_0_12px_rgba(75,125,255,0.3)] group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col justify-center">
                <span className="font-outfit font-black text-xl text-white tracking-wider uppercase leading-none group-hover:text-blue-200 transition-colors">
                  QUICK TURN
                </span>
                <span className="text-[10px] text-gray-300 tracking-wider font-medium leading-tight mt-0.5">
                  Where Deals Turn Right.
                </span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed mb-5 text-gray-300 max-w-sm">
              Premium consoles, games, accessories &amp; gaming merch. New and pre-owned
              gear at the best prices in Pakistan.
            </p>
            <div className="flex items-center gap-2.5 flex-wrap">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center hover:bg-blue-500/25 hover:border-blue-500/50 transition text-gray-200" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-pink-500/15 border border-pink-500/30 flex items-center justify-center hover:bg-pink-500/25 hover:border-pink-500/50 transition text-gray-200" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center hover:bg-red-500/25 hover:border-red-500/50 transition text-gray-200" aria-label="YouTube">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center hover:bg-cyan-500/25 hover:border-cyan-500/50 transition text-gray-200" aria-label="TikTok">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.69c-.01 2.27-.85 4.54-2.43 6.15-1.58 1.63-3.87 2.53-6.17 2.45-2.22-.05-4.38-.97-5.89-2.58-1.55-1.63-2.39-3.9-2.31-6.17.06-2.26.98-4.46 2.6-6 1.61-1.57 3.86-2.42 6.11-2.35.34.01.69.04 1.03.09v4.14c-.37-.11-.76-.17-1.15-.17-1.15-.02-2.31.42-3.13 1.23-.83.82-1.28 1.99-1.23 3.16.03 1.16.51 2.29 1.35 3.09.83.82 2 1.25 3.17 1.2 1.17-.03 2.3-.51 3.09-1.37.8-.84 1.23-2 1.21-3.17V.02z"/></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-blue-600/15 border border-blue-600/30 flex items-center justify-center hover:bg-blue-600/25 hover:border-blue-600/50 transition text-gray-200" aria-label="LinkedIn">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links (3.5 cols) */}
          <div className="md:col-span-3 lg:col-span-3 md:pl-4 lg:pl-8">
            <FooterAccordionSection title="Quick Links">
              <ul className="space-y-2.5 text-sm text-gray-300">
                <li><Link to="/shop" className="hover:text-blue-400 transition">All Products</Link></li>
                <li><Link to="/wishlist" className="hover:text-blue-400 transition">My Wishlist</Link></li>
                <li><Link to="/shop?featured=true" className="hover:text-blue-400 transition">Featured</Link></li>
                <li><Link to="/shop?flashSale=true" className="hover:text-blue-400 transition">Deals &amp; Offers</Link></li>
                <li><Link to="/sell" className="hover:text-blue-400 transition">Sell / Trade-In</Link></li>
                <li><Link to="/repair" className="hover:text-blue-400 transition">Repair Service</Link></li>
                <li><Link to="/page/about-us" className="hover:text-blue-400 transition">About Us</Link></li>
              </ul>
            </FooterAccordionSection>
          </div>

          {/* Column 3: Contact Us (4 cols) */}
          <div className="md:col-span-4 lg:col-span-4 md:pl-4 lg:pl-6">
            <FooterAccordionSection title="Contact Us">
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-blue-400" />
                  <div>
                    <span>Near Chhipa Head Office, Sindhi Muslim Karachi.</span>
                    <a
                      href="https://maps.google.com/?q=Near+Chhipa+Head+Office+Sindhi+Muslim+Karachi"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-blue-400 hover:text-blue-300 mt-0.5 font-medium underline"
                    >
                      + Map Location
                    </a>
                  </div>
                </li>
                <li className="flex items-center gap-2.5">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 text-blue-400 fill-current" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <div className="flex flex-col">
                    <a href="tel:03378362834" className="hover:text-blue-400 transition font-medium">03378362834</a>
                    <a href="tel:03242027133" className="hover:text-blue-400 transition font-medium text-xs text-gray-400">03242027133</a>
                  </div>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 shrink-0 text-blue-400" />
                  <a href="mailto:quickturnpk@gmail.com" className="hover:text-blue-400 transition">quickturnpk@gmail.com</a>
                </li>
              </ul>
            </FooterAccordionSection>
          </div>
        </div>

        <div className="border-t border-blue-500/15 mt-6 sm:mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <p>© {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.</p>
            <span className="hidden sm:inline">•</span>
            <button
              type="button"
              onClick={handleOpenTerms}
              className="text-gray-300 hover:text-blue-400 transition underline-offset-2 hover:underline"
            >
              Terms &amp; Conditions
            </button>
          </div>
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
