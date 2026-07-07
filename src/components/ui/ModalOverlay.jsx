import { useEffect } from 'react';
import { createPortal } from 'react-dom';

function ModalOverlay({ open, children, align = 'center' }) {
  useEffect(() => {
    if (!open) return undefined;

    const main = document.querySelector('main');
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousMainOverflow = main?.style.overflow ?? '';

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    if (main) main.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      if (main) main.style.overflow = previousMainOverflow;
    };
  }, [open]);

  if (!open) return null;

  const alignClass =
    align === 'bottom-mobile'
      ? 'items-end sm:items-center'
      : 'items-center';

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex ${alignClass} justify-center w-screen h-[100dvh] min-h-[100dvh] p-0 sm:p-4`}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      <div className="relative z-10 flex w-full max-h-[100dvh] sm:max-h-[90vh] justify-center pointer-events-none px-0 sm:px-4">
        <div className="pointer-events-auto max-h-[inherit] w-fit max-w-full">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ModalOverlay;
