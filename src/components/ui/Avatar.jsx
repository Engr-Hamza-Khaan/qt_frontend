import { getInitials } from '../../utils/formatters';

function Avatar({ name, size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div
      className={`avatar-brand ${sizes[size]} rounded-full flex items-center justify-center font-bold text-white shrink-0 ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}

export default Avatar;
