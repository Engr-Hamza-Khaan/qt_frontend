import React from 'react';
import { Gamepad2 } from 'lucide-react';

export default function ControllerHeader() {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2.5">
        <Gamepad2 className="w-6 h-6 text-blue-400" />
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
          Controller Tester
        </h1>
      </div>
      <p className="text-xs sm:text-sm text-gray-400 mt-1">
        Connect your gamepad via USB or Bluetooth and press any button to start testing. Works with Xbox, PlayStation, and most PC controllers.
      </p>
    </div>
  );
}
