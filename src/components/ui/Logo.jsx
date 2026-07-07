import { BRAND_NAME } from '../../config/brand';

const LOGO_SRC = {
  white: '/logo(white).png',
  default: '/logo.png',
};

const SIZES = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-14',
  xl: 'h-20',
};

function Logo({ variant = 'default', size = 'md', className = '' }) {
  return (
    <img
      src={LOGO_SRC[variant]}
      alt={BRAND_NAME}
      className={`${SIZES[size]} w-auto object-contain ${className}`}
    />
  );
}

export default Logo;
