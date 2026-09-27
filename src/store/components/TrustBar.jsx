import { ShieldCheck, Truck, RotateCcw, Headphones, Zap, Sparkles, Award, Clock } from 'lucide-react';

const ICON_MAP = {
  shield: ShieldCheck,
  truck: Truck,
  rotate: RotateCcw,
  headphones: Headphones,
  zap: Zap,
  sparkles: Sparkles,
  award: Award,
  clock: Clock,
};

const DEFAULT_ITEMS = [
  { icon: 'shield', title: 'Genuine Products', desc: '100% authentic warranty' },
  { icon: 'truck', title: 'Fast Delivery', desc: 'Nationwide shipping' },
  { icon: 'rotate', title: 'Easy Returns', desc: '7-day return policy' },
  { icon: 'headphones', title: 'Expert Support', desc: 'WhatsApp & phone help' },
];

function TrustBar({ trustConfig = [] }) {
  const items = (Array.isArray(trustConfig) && trustConfig.length > 0)
    ? trustConfig
    : DEFAULT_ITEMS;

  return (
    <section className="store-section-alt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4 md:gap-6">
          {items.map((item, index) => {
            const IconComponent = (typeof item.icon === 'string' ? ICON_MAP[item.icon] : item.icon) || ShieldCheck;
            return (
              <div
                key={item.title || index}
                className="flex flex-col items-center text-center gap-2 sm:flex-row sm:items-center sm:text-left sm:gap-3 min-w-0"
              >
                <div className="store-trust-icon w-10 h-10 sm:w-10 sm:h-10 shrink-0">
                  <IconComponent className="w-5 h-5 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default TrustBar;
