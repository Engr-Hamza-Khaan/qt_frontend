import Logo from './Logo';
import { BRAND_NAME, BRAND_SLOGAN } from '../../config/brand';

function BrandLogo({
  variant = 'default',
  logoSize = 'md',
  subtitle = BRAND_SLOGAN,
  showSubtitle = true,
  collapsed = false,
  layout = 'horizontal',
  className = '',
  nameClassName = 'text-base font-bold leading-none',
  subtitleClassName = 'text-[10px] uppercase tracking-wider mt-0.5',
}) {
  if (collapsed) {
    return <Logo variant={variant} size={logoSize} className={className} />;
  }

  const isVertical = layout === 'vertical';

  return (
    <div
      className={`flex ${isVertical ? 'flex-col items-center text-center gap-3' : 'items-center gap-2.5'} ${className}`}
    >
      <Logo variant={variant} size={logoSize} className="shrink-0" />
      <div className="min-w-0">
        <p className={nameClassName}>{BRAND_NAME}</p>
        {showSubtitle && subtitle && (
          <p className={subtitleClassName}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export default BrandLogo;
