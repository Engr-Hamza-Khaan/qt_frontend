import { Wrench, RefreshCw, MessageCircle, Phone } from 'lucide-react';
import { BRAND_NAME } from '../config/brand';
import {
  CONTACT_EMAIL,
  PHONE_SECONDARY,
  WHATSAPP_DISPLAY,
  getWhatsAppUrl,
} from '../store/config/contact';

export default function MaintenancePage({ checking, secondsLeft, onRetry }) {
  return (
    <div className="min-h-screen bg-navy-950 text-white flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-neon-blue/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-neon-purple/20 blur-3xl" />

      <div className="relative w-full max-w-lg text-center animate-slide-up">
        <div className="mx-auto mb-8 w-24 h-24 rounded-3xl bg-store-surface border border-store-border shadow-navy-glow flex items-center justify-center animate-float">
          <Wrench className="w-11 h-11 text-neon-blue" />
        </div>

        <p className="font-bebas tracking-[0.3em] text-neon-cyan text-lg mb-2">{BRAND_NAME}</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">We&apos;ll be right back</h1>
        <p className="text-store-muted text-base sm:text-lg leading-relaxed mb-8">
          Our servers are temporarily unavailable. We&apos;re working on it and the store will
          come back automatically as soon as it&apos;s ready.
        </p>

        <button
          type="button"
          onClick={onRetry}
          disabled={checking}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-store-accent hover:bg-store-accent-hover disabled:opacity-70 font-semibold transition-all active:scale-[0.98]"
        >
          <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
          {checking ? 'Checking...' : 'Try again'}
        </button>
        {!checking && secondsLeft > 0 && (
          <p className="mt-3 text-sm text-store-muted">Retrying automatically in {secondsLeft}s</p>
        )}

        <div className="mt-10 pt-8 border-t border-store-border">
          <p className="text-sm text-store-muted mb-4">Need help urgently? Reach us directly:</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-store-border hover:bg-white/10 text-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              WhatsApp {WHATSAPP_DISPLAY}
            </a>
            <a
              href={`tel:${PHONE_SECONDARY}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-store-border hover:bg-white/10 text-sm transition-colors"
            >
              <Phone className="w-4 h-4 text-neon-blue" />
              {PHONE_SECONDARY}
            </a>
          </div>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-block mt-4 text-sm text-store-muted hover:text-white transition-colors"
          >
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </div>
  );
}
