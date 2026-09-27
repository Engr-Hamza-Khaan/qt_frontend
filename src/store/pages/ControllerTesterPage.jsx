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
    saveCalibrationPermanently
  } = useGamepad();

  // Active view: 'tester' or 'calibration'
  const [currentView, setCurrentView] = useState('tester');

  // Active selected brand tab: 'playstation' or 'xbox'
  const [selectedBrand, setSelectedBrand] = useState('playstation');

  // Preview mode toggle if user wants to inspect layout without hardware plugged in
  const [isPreviewActive, setIsPreviewActive] = useState(false);

  // Auto-sync brand ONLY when a physical controller connects or changes device ID
  useEffect(() => {
    if (activeGamepad?.details?.brand) {
      setSelectedBrand(activeGamepad.details.brand);
    }
  }, [activeGamepad?.details?.brand, activeGamepad?.id]);

  // Handle switching tabs
  const handleSelectTab = (brand) => {
    setSelectedBrand(brand);
    setIsPreviewActive(true);
  };

  // Determine dynamic live input label matching exact specifications:
  // "Jab (Ps5 Dualsense) Controller Connect Ho Tou Text Ps5 Ana Chayei Waise Hi Jab (Ps4 Dualshock) Ho Tab Ps4 And Jab Xbox Ho Tab (Xbox Controller)"
  const getLiveInputLabel = () => {
    if (activeGamepad?.details?.modelType === 'ps5') {
      return 'LIVE INPUT: PS5 Dualsense Controller';
    }
    if (activeGamepad?.details?.modelType === 'ps4') {
      return 'LIVE INPUT: PS4 Dualshock Controller';
    }
    if (activeGamepad?.details?.modelType === 'xbox' || selectedBrand === 'xbox') {
      return 'LIVE INPUT: Xbox Controller';
    }
    if (selectedBrand === 'playstation') {
      return 'LIVE INPUT: PS5 Dualsense Controller';
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
        />
      ) : !showActiveControllerUI ? (
        /* If No Controller Detected: Show Landing Page (no tabs) */
        <NoControllerLanding />
      ) : (
        <>
          {/* Brand Tabs Switcher (PlayStation / Xbox) - Only visible when controller is detected */}
          <ControllerTabs
            activeTab={selectedBrand}
            onSelectTab={handleSelectTab}
          />

          {/* Main Live Input Glass Panel */}
          <div className="store-glass-panel p-6 sm:p-8">
            {selectedBrand === 'xbox' ? (
              <XboxLayout
                gamepad={activeGamepad}
                liveInputLabel={getLiveInputLabel()}
                onCalibrateClick={() => setCurrentView('calibration')}
              />
            ) : (
              <PlayStationLayout
                gamepad={activeGamepad}
                liveInputLabel={getLiveInputLabel()}
                onCalibrateClick={() => setCurrentView('calibration')}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
