import React from 'react';

export function PlayStationLogo({ className = "w-5 h-5", color = "currentColor" }) {
  return (
    <svg viewBox="0 0 50 40" fill={color} className={className}>
      <path d="M43.27 28.1c-1.3-.47-2.67-.74-4.04-.81l-.39 1.48c2.25.43 4.25 1.13 4.25 2.58 0 1.94-3.51 3.03-8.86 3.03-5.36 0-9.43-1.09-9.43-3.03 0-1.28 1.45-2.22 3.8-2.64l-.5-1.57c-3.52.54-5.83 1.97-5.83 4.21 0 3.75 6.01 5.48 11.96 5.48 5.94 0 11.97-1.73 11.97-5.48 0-1.89-1.23-2.78-2.93-3.25zM22.09 3.04v26.04c2.51.52 5.09.84 7.68.96V14.62c0-2.3 1.25-3.06 3.16-2.58 1.9.48 2.29 1.98 2.29 4.27v14.17c3.16.08 6.27-.14 9.17-.63V14.28c0-5.11-2.97-8.15-8.22-9.46-4.52-1.12-10.45-.63-14.08 1.22zM8.33 34.61c-1.88-.47-3.26-1.39-3.26-2.48 0-1.5 2.54-2.29 5.86-2.61l.54 1.57c-1.92.2-3.87.53-3.87 1.04 0 .42.75.84 2.11 1.09l-.49 1.5c-3.15-.32-6.19-.88-8.91-1.66l.5-1.59c1.92.51 4.14.88 6.45 1.12-.42-1.68-.66-3.66-.66-5.81V13.88l5.88 1.87v11.13c0 2.29.35 4.38.97 6.18l-5.12 1.55z" />
    </svg>
  );
}

export function XboxLogo({ className = "w-5 h-5", color = "currentColor" }) {
  return (
    <svg viewBox="0 0 100 100" fill={color} className={className}>
      <path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 10c13.7 0 25.8 6.7 33.3 17-6.2 5.7-16.1 13.9-24.8 20.3-4.4-7.5-9.3-15.6-13.6-22.7 1.7-.3 3.4-.6 5.1-.6zm-10 14.6c4.3 7 9.1 15 13.5 22.3-8.8 6.5-18.7 14.7-24.9 20.4C21.1 60 16.7 50.5 16.7 40.2c0-5.8 1.4-11.2 3.8-16 5.8 3.7 12.8 8.6 19.5 10.4zm20 0c6.7-1.8 13.7-6.7 19.5-10.4 2.4 4.8 3.8 10.2 3.8 16 0 10.3-4.4 19.8-11.9 27.1-6.2-5.7-16.1-13.9-24.9-20.4 4.4-7.3 9.2-15.3 13.5-22.3zM25 80.8C18.6 74.4 14.3 65.5 13.3 55.7c6.1-5.1 15.6-12.7 23.9-18.8 6.5 10.5 13.8 22.1 19.9 31.8-18.3 4.8-29.3 9.6-32.1 12.1zm50 0c-2.8-2.5-13.8-7.3-32.1-12.1 6.1-9.7 13.4-21.3 19.9-31.8 8.3 6.1 17.8 13.7 23.9 18.8-1 9.8-5.3 18.7-11.7 25.1z" />
    </svg>
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
