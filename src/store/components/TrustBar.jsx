import { ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';

const ITEMS = [
  { icon: ShieldCheck, title: 'Genuine Products', desc: '100% authentic warranty' },
  { icon: Truck, title: 'Fast Delivery', desc: 'Nationwide shipping' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '7-day return policy' },
  { icon: Headphones, title: 'Expert Support', desc: 'WhatsApp & phone help' },
];

function TrustBar() {
  return (
    <section className="store-section-alt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4 md:gap-6">
          {ITEMS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col items-center text-center gap-2 sm:flex-row sm:items-center sm:text-left sm:gap-3 min-w-0"
            >
              <div className="store-trust-icon w-10 h-10 sm:w-10 sm:h-10 shrink-0">
                <Icon className="w-5 h-5 text-neon-purple" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-white">{title}</p>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrustBar;
