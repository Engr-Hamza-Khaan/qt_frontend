import { BRAND_NAME } from '../../config/brand';
import qtLogo from '../../assets/QT Logo.png';

const LOGO_SRC = {
  white: qtLogo,
  default: qtLogo,
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
