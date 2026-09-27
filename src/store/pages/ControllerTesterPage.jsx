import React, { useState, useEffect } from 'react';
import { useGamepad } from '../../hooks/useGamepad';
import ControllerHeader from '../components/controller-tester/ControllerHeader';
import ControllerTabs from '../components/controller-tester/ControllerTabs';
import PlayStationLayout from '../components/controller-tester/PlayStationLayout';
import XboxLayout from '../components/controller-tester/XboxLayout';
import CalibrationView from '../components/controller-tester/CalibrationView';
import NoControllerLanding from '../components/controller-tester/NoControllerLanding';

export default function ControllerTesterPage() {
  const {
    gamepads,
    activeGamepad,
    hasConnectedController,
    triggerHaptic,
    calibrateCenter,
    calibrateRange,
    saveCalibrationPermanently,
    isSimulated,
    setIsSimulated,
    setSimulatedBrand,
    setSimulatedButton,
    setSimulatedAxis
  } = useGamepad();

  // Active view: 'tester' or 'calibration'
  const [currentView, setCurrentView] = useState('tester');

  // Active selected brand tab: 'playstation' or 'xbox'
  const [selectedBrand, setSelectedBrand] = useState('playstation');

  // Preview mode for users testing without hardware
  const [isPreviewActive, setIsPreviewActive] = useState(false);

  // Auto-sync brand when a physical controller connects
  useEffect(() => {
    if (activeGamepad?.details?.brand) {
      setSelectedBrand(activeGamepad.details.brand);
    }
  }, [activeGamepad]);

  // Handle switching tabs
  const handleSelectTab = (brand) => {
    setSelectedBrand(brand);
    setIsPreviewActive(true);
    setIsSimulated(true);
    setSimulatedBrand(brand);
  };

  // Keyboard shortcut listener for simulator testing
  useEffect(() => {
    if (!isPreviewActive && !hasConnectedController) return;

    const handleKeyDown = (e) => {
      // WASD for Left Stick
      if (e.key === 'w' || e.key === 'W') setSimulatedAxis(1, -0.85);
      if (e.key === 's' || e.key === 'S') setSimulatedAxis(1, 0.85);
      if (e.key === 'a' || e.key === 'A') setSimulatedAxis(0, -0.85);
      if (e.key === 'd' || e.key === 'D') setSimulatedAxis(0, 0.85);

      // Arrow keys for Right Stick
      if (e.key === 'ArrowUp') setSimulatedAxis(3, -0.85);
      if (e.key === 'ArrowDown') setSimulatedAxis(3, 0.85);
      if (e.key === 'ArrowLeft') setSimulatedAxis(2, -0.85);
      if (e.key === 'ArrowRight') setSimulatedAxis(2, 0.85);

      // Buttons
      if (e.key === '1') setSimulatedButton(0, true, 1);
      if (e.key === '2') setSimulatedButton(1, true, 1);
      if (e.key === '3') setSimulatedButton(2, true, 1);
      if (e.key === '4') setSimulatedButton(3, true, 1);
      if (e.key === 'q' || e.key === 'Q') setSimulatedButton(6, true, 1);
      if (e.key === 'e' || e.key === 'E') setSimulatedButton(7, true, 1);
    };

    const handleKeyUp = (e) => {
      if (['w', 's', 'W', 'S'].includes(e.key)) setSimulatedAxis(1, -0.176);
      if (['a', 'd', 'A', 'D'].includes(e.key)) setSimulatedAxis(0, -0.647);
      if (['ArrowUp', 'ArrowDown'].includes(e.key)) setSimulatedAxis(3, -0.176);
      if (['ArrowLeft', 'ArrowRight'].includes(e.key)) setSimulatedAxis(2, -0.647);

      if (e.key === '1') setSimulatedButton(0, false, 0);
      if (e.key === '2') setSimulatedButton(1, false, 0);
      if (e.key === '3') setSimulatedButton(2, false, 0);
      if (e.key === '4') setSimulatedButton(3, false, 0);
      if (e.key === 'q' || e.key === 'Q') setSimulatedButton(6, false, 0);
      if (e.key === 'e' || e.key === 'E') setSimulatedButton(7, false, 0);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPreviewActive, hasConnectedController, setSimulatedAxis, setSimulatedButton]);

  // Determine dynamic live input label:
  // "Jab (Ps5 Dualsense) Controller Connect Ho Tou Text Ps5 Ana Chayei Waise Hi Jab (Ps4 Dualshock) Ho Tab Ps4 And Jab Xbox Ho Tab (Xbox Controller)"
  const getLiveInputLabel = () => {
    if (activeGamepad?.details?.modelType === 'ps5') {
      return 'LIVE INPUT: PS5 DualSense Controller';
    }
    if (activeGamepad?.details?.modelType === 'ps4') {
      return 'LIVE INPUT: PS4 DualShock Controller';
    }
    if (activeGamepad?.details?.modelType === 'xbox' || selectedBrand === 'xbox') {
      return 'LIVE INPUT: Xbox Controller';
    }
    if (selectedBrand === 'playstation') {
      return 'LIVE INPUT: PS5 DualSense Controller';
    }
    return 'LIVE INPUT';
  };

  const showActiveControllerUI = hasConnectedController || isPreviewActive;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Top Header */}
      <ControllerHeader />

      {/* Calibration Page View */}
      {currentView === 'calibration' ? (
        <CalibrationView
          gamepad={activeGamepad}
          brand={selectedBrand}
          onBack={() => setCurrentView('tester')}
          onCalibrateCenter={calibrateCenter}
          onCalibrateRange={calibrateRange}
          onTriggerHaptic={triggerHaptic}
          onSavePermanent={saveCalibrationPermanently}
          onSimulateAxis={setSimulatedAxis}
        />
      ) : (
        <>
          {/* Brand Tabs Switcher (PlayStation / Xbox) */}
          <ControllerTabs
            activeTab={selectedBrand}
            onSelectTab={handleSelectTab}
          />

          {/* If No Controller Detected and not previewing: Show Landing Page */}
          {!showActiveControllerUI ? (
            <NoControllerLanding
              onStartDemo={() => {
                setIsPreviewActive(true);
                setIsSimulated(true);
                setSimulatedBrand(selectedBrand);
              }}
            />
          ) : (
            /* Main Live Input Glass Panel */
            <div className="store-glass-panel p-6 sm:p-8">
              {selectedBrand === 'xbox' ? (
                <XboxLayout
                  gamepad={activeGamepad}
                  liveInputLabel={getLiveInputLabel()}
                  onCalibrateClick={() => setCurrentView('calibration')}
                  onSimulateButton={setSimulatedButton}
                  onSimulateAxis={setSimulatedAxis}
                />
              ) : (
                <PlayStationLayout
                  gamepad={activeGamepad}
                  liveInputLabel={getLiveInputLabel()}
                  onCalibrateClick={() => setCurrentView('calibration')}
                  onSimulateButton={setSimulatedButton}
                  onSimulateAxis={setSimulatedAxis}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
