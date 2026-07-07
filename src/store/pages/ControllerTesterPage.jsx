import { Link } from 'react-router-dom';
import { Joystick, Plug, AlertCircle, Wrench } from 'lucide-react';
import { useGamepad } from '../../hooks/useGamepad';
import ControllerLayout from '../components/controller-tester/ControllerLayout';
import ButtonGrid from '../components/controller-tester/ButtonGrid';
import AxisReadout from '../components/controller-tester/AxisReadout';

function ControllerTesterPage() {
  const { gamepads, activeGamepad, activeIndex, setActiveIndex, isSupported } = useGamepad();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-3 mb-2">
        <Joystick className="w-8 h-8 text-neon-purple" />
        <h1 className="store-page-title">Controller Tester</h1>
      </div>
      <p className="store-muted mb-8">
        Connect your gamepad via USB or Bluetooth and press any button to start testing.
        Works with Xbox, PlayStation, and most PC controllers.
      </p>

      {!isSupported && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex gap-3 text-sm text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>Your browser does not support the Gamepad API. Try Chrome, Edge, or Firefox.</p>
        </div>
      )}

      {gamepads.length === 0 ? (
        <div className="store-glass-panel p-10 text-center">
          <Plug className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">No Controller Detected</h2>
          <p className="store-muted text-sm max-w-md mx-auto">
            Plug in your controller or pair it via Bluetooth, then press any button.
            Some browsers require a button press before the gamepad appears.
          </p>
        </div>
      ) : (
        <>
          {/* Device selector */}
          {gamepads.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {gamepads.map((gp) => (
                <button
                  key={gp.index}
                  type="button"
                  onClick={() => setActiveIndex(gp.index)}
                  className={`px-4 py-2 rounded-lg text-sm border transition ${
                    gp.index === activeIndex
                      ? 'bg-neon-purple/20 border-neon-purple/50 text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  Player {gp.index + 1}
                </button>
              ))}
            </div>
          )}

          {/* Device info */}
          <div className="store-glass-panel p-4 mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="text-gray-500">Device: </span>
              <span className="text-white font-medium">{activeGamepad?.id ?? 'Unknown'}</span>
            </div>
            <div>
              <span className="text-gray-500">Mapping: </span>
              <span className={`font-medium ${activeGamepad?.mapping === 'standard' ? 'text-green-400' : 'text-yellow-400'}`}>
                {activeGamepad?.mapping || 'default'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Buttons: </span>
              <span className="text-white">{activeGamepad?.buttons.length ?? 0}</span>
            </div>
            <div>
              <span className="text-gray-500">Axes: </span>
              <span className="text-white">{activeGamepad?.axes.length ?? 0}</span>
            </div>
          </div>

          {/* Visual layout */}
          <div className="store-glass-panel p-6 sm:p-8 mb-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">Live Input</h2>
            <ControllerLayout gamepad={activeGamepad} />
          </div>

          {/* All buttons grid */}
          <div className="store-glass-panel p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">All Buttons</h2>
            <ButtonGrid gamepad={activeGamepad} />
          </div>

          {/* Axis readout */}
          <div className="store-glass-panel p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Analog Axes</h2>
            <AxisReadout gamepad={activeGamepad} />
          </div>
        </>
      )}

      {/* Repair CTA */}
      <div className="mt-8 p-5 rounded-xl border border-neon-purple/20 bg-neon-purple/5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Wrench className="w-6 h-6 text-neon-purple shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-white font-medium">Found a problem with your controller?</p>
          <p className="text-xs text-gray-400 mt-0.5">Drift, stuck buttons, or broken triggers — we can fix it.</p>
        </div>
        <Link to="/repair" className="store-btn-primary whitespace-nowrap px-5 py-2.5 text-sm">
          Request Repair
        </Link>
      </div>
    </div>
  );
}

export default ControllerTesterPage;
