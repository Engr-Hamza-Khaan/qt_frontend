import React from 'react';

export function PlayStationLogo({ className = "w-5 h-5" }) {
  return (
    <img
      src="/Icons/Console Outline.png"
      alt="PlayStation"
      className={`${className} object-contain`}
    />
  );
}

export function XboxLogo({ className = "w-5 h-5" }) {
  return (
    <img
      src="/Icons/xbox-outline.png"
      alt="Xbox"
      className={`${className} object-contain brightness-0 invert`}
    />
  );
}

export function TriangleIcon({ className = "w-4 h-4", color = "#22c55e" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 4L3 20h18L12 4z" />
    </svg>
  );
}

export function CircleSymbol({ className = "w-4 h-4", color = "#ef4444" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" className={className}>
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

export function CrossSymbol({ className = "w-4 h-4", color = "#3b82f6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" className={className}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export function SquareSymbol({ className = "w-4 h-4", color = "#ec4899" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  );
}

export function ViewWindowsIcon({ className = "w-4 h-4", color = "currentColor" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="5" width="12" height="12" rx="1.5" />
      <rect x="9" y="8" width="12" height="12" rx="1.5" />
    </svg>
  );
}

export function MenuHamburgerIcon({ className = "w-4 h-4", color = "currentColor" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" className={className}>
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}
