import React from 'react';

export default function ControllerTabs({ activeTab, onSelectTab }) {
  return (
    <div className="flex justify-center mb-6">
      <div className="inline-flex items-center p-1 rounded-full bg-[#0a1024]/90 border border-white/10 shadow-lg backdrop-blur-md">
        {/* PlayStation Tab */}
        <button
          type="button"
          onClick={() => onSelectTab('playstation')}
          className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 select-none ${
            activeTab === 'playstation'
              ? 'bg-[#00439c] text-white shadow-[0_0_15px_rgba(0,112,209,0.5)] border border-blue-400/40'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
          }`}
        >
          <img
            src="/Icons/Console Outline.png"
            alt="Playstation"
            className="w-4 h-4 object-contain"
          />
          <span>Playstation</span>
        </button>

        {/* Xbox Tab */}
        <button
          type="button"
          onClick={() => onSelectTab('xbox')}
          className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 select-none ${
            activeTab === 'xbox'
              ? 'bg-[#107c10] text-white shadow-[0_0_15px_rgba(16,124,16,0.6)] border border-emerald-400/40'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
          }`}
        >
          <img
            src="/Icons/xbox-outline.png"
            alt="Xbox"
            className="w-4 h-4 object-contain brightness-0 invert"
          />
          <span>Xbox</span>
        </button>
      </div>
    </div>
  );
}
