import React from 'react';
import { Link } from 'react-router-dom';
import { Plug, Wrench, Play } from 'lucide-react';

export default function NoControllerLanding({ onStartDemo }) {
  return (
    <div className="space-y-6">
      {/* No Controller Card */}
      <div className="store-glass-panel py-16 px-6 sm:px-12 text-center flex flex-col items-center justify-center">
        {/* Plug Icon */}
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 text-gray-500">
          <Plug className="w-8 h-8" />
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-white mb-2">
          No Controller Detected
        </h2>

        <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
          Plug in your controller or pair it via Bluetooth, then press any button. Some browsers require a button press before the gamepad appears.
        </p>

        {/* Interactive Preview Trigger */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onStartDemo}
            className="flex items-center gap-2 px-5 py-2 rounded-full border border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-xs font-semibold transition-all shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Preview & Test Controller Layouts</span>
          </button>
        </div>
      </div>

      {/* Repair CTA Card */}
      <div className="p-5 sm:p-6 rounded-2xl border border-purple-500/30 bg-[#120a2e]/60 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              Found a problem with your controller?
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Drift, stuck buttons, or broken triggers — we can fix it!
            </p>
          </div>
        </div>

        <Link
          to="/repair"
          className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] text-center whitespace-nowrap"
        >
          REQUEST REPAIR
        </Link>
      </div>
    </div>
  );
}
