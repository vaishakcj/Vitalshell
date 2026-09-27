import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ScreenId,
  TabId,
  SensorVitals,
  BiomechanicalData,
  EnvironmentalData,
  RiskFusionState,
  ConnectivityState,
  AlertItem,
  EmergencyContact,
  SportType,
  SportsSessionState,
} from './types';
import {
  INITIAL_VITALS,
  INITIAL_BIOMECHANICAL,
  INITIAL_ENVIRONMENT,
  INITIAL_CONNECTIVITY,
  INITIAL_ALERTS,
  INITIAL_CONTACTS,
  calculateRiskFusion,
} from './mock/sensorEngine';
import {
  INITIAL_SPORTS_SESSION,
  SPORT_PROFILES,
  calculateSportsOptimizedRiskFusion,
  getHeartRateZone,
} from './utils/sportsEngine';
import { BottomNav } from './components/common/BottomNav';
import { ThemeProvider } from './context/ThemeContext';

// 12 Major App Screens
import { IntroScreen } from './components/screens/IntroScreen';
import { AuthScreen } from './components/screens/AuthScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { PhysiologicalScreen } from './components/screens/PhysiologicalScreen';
import { BiomechanicalScreen } from './components/screens/BiomechanicalScreen';
import { EnvironmentScreen } from './components/screens/EnvironmentScreen';
import { RiskFusionScreen } from './components/screens/RiskFusionScreen';
import { AlertsScreen } from './components/screens/AlertsScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { ConnectivityScreen } from './components/screens/ConnectivityScreen';
import { DiagnosticsScreen } from './components/screens/DiagnosticsScreen';
import { EmergencyContactsScreen } from './components/screens/EmergencyContactsScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { SportsScreen } from './components/screens/SportsScreen';
import {
  isSupabaseConfigured,
  logVitalsToSupabase,
  logAlertToSupabase,
  fetchContactsFromSupabase,
} from './services/supabaseService';
import { useAuth } from './context/AuthContext';
import { bleManager } from './services/bleService';
import { motionSensorService } from './services/motionSensorService';
import { environmentSensorService } from './services/environmentSensorService';
import { deviceBatteryService } from './services/deviceBatteryService';

const TAB_ORDER: Record<string, number> = {
  dashboard: 0,
  environment: 1,
  history: 2,
  alerts: 3,
  settings: 4,
};

const screenVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 32 : -32,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: 'spring', stiffness: 420, damping: 32 },
      opacity: { duration: 0.18, ease: 'easeOut' },
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -32 : 32,
    opacity: 0,
    transition: {
      x: { duration: 0.14, ease: 'easeIn' },
      opacity: { duration: 0.12, ease: 'easeIn' },
    },
  }),
};

export default function App() {
  const { user, loading: authLoading } = useAuth();

  // Navigation
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('intro');
  const [navHistory, setNavHistory] = useState<ScreenId[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [slideDirection, setSlideDirection] = useState<number>(1);

  // Unified Reactive App State
  const [vitals, setVitals] = useState<SensorVitals>(INITIAL_VITALS);
  const [biomech, setBiomech] = useState<BiomechanicalData>(INITIAL_BIOMECHANICAL);
  const [enviro, setEnviro] = useState<EnvironmentalData>(INITIAL_ENVIRONMENT);
  const [riskFusion, setRiskFusion] = useState<RiskFusionState>(() =>
    calculateRiskFusion(INITIAL_VITALS, INITIAL_BIOMECHANICAL, INITIAL_ENVIRONMENT)
  );
  const [connectivity, setConnectivity] = useState<ConnectivityState>(INITIAL_CONNECTIVITY);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [contacts, setContacts] = useState<EmergencyContact[]>(INITIAL_CONTACTS);
  const [sportsSession, setSportsSession] = useState<SportsSessionState>(INITIAL_SPORTS_SESSION);

  // Sync contacts from Supabase on mount if available
  useEffect(() => {
    let isMounted = true;
    if (isSupabaseConfigured) {
      fetchContactsFromSupabase().then((remoteContacts) => {
        if (isMounted && remoteContacts && remoteContacts.length > 0) {
          setContacts(remoteContacts);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, []);

  // Periodic vitals persistence to Supabase (every 15s to conserve quota)
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const interval = setInterval(() => {
      logVitalsToSupabase(vitals);
    }, 15000);
    return () => clearInterval(interval);
  }, [vitals]);

  const [isAudioActive, setIsAudioActive] = useState(false);

  // Real Hardware Battery listener
  useEffect(() => {
    deviceBatteryService.init((bat) => {
      setConnectivity((prev) => ({
        ...prev,
        battery: bat.level,
        batteryCharging: bat.charging,
      }));
    });
  }, []);

  // Web Bluetooth (BLE) Wearable listener
  useEffect(() => {
    const unsubBle = bleManager.subscribe((ble) => {
      setConnectivity((prev) => ({
        ...prev,
        bleConnected: ble.connected,
        bleDeviceName: ble.deviceName || undefined,
        battery: ble.battery !== null ? ble.battery : prev.battery,
      }));

      if (ble.heartRate !== null) {
        setVitals((prev) => {
          const updated: SensorVitals = {
            ...prev,
            heartRate: ble.heartRate!,
            hrv: ble.hrv !== null ? ble.hrv : prev.hrv,
          };
          setRiskFusion(calculateRiskFusion(updated, biomech, enviro));
          return updated;
        });
      }
    });

    return unsubBle;
  }, [biomech, enviro]);

  // Phone Accelerometer & Gyroscope (IMU) listener
  useEffect(() => {
    const unsubMotion = motionSensorService.onMotion((data) => {
      setBiomech((prev) => {
        const updated: BiomechanicalData = {
          ...prev,
          ...data,
          imu: data.imu || prev.imu,
        };
        setRiskFusion(calculateRiskFusion(vitals, updated, enviro));
        return updated;
      });
      setConnectivity((prev) => ({ ...prev, deviceMotionActive: true }));
    });

    const unsubFall = motionSensorService.onFall(() => {
      handleTriggerImpactDrill();
    });

    return () => {
      unsubMotion();
      unsubFall();
    };
  }, [vitals, enviro]);

  // Real Local Climate via GPS
  const handleSyncRealClimate = async () => {
    const res = await environmentSensorService.fetchRealClimate();
    if (res.success && res.data) {
      setEnviro((prev) => {
        const updated: EnvironmentalData = {
          ...prev,
          ...res.data,
        };
        setRiskFusion(calculateRiskFusion(vitals, biomech, updated));
        return updated;
      });
      setConnectivity((prev) => ({ ...prev, ambientWeatherActive: true }));
    }
  };

  // Real Audio Noise Meter (Microphone dB SPL)
  const handleToggleAudioSensor = () => {
    if (isAudioActive) {
      environmentSensorService.stopAudioNoiseMeter();
      setIsAudioActive(false);
      setConnectivity((prev) => ({ ...prev, audioNoiseActive: false }));
    } else {
      environmentSensorService
        .startAudioNoiseMeter((db) => {
          setEnviro((prev) => {
            const updated = { ...prev, noise: db };
            setRiskFusion(calculateRiskFusion(vitals, biomech, updated));
            return updated;
          });
        })
        .then((res) => {
          if (res.success) {
            setIsAudioActive(true);
            setConnectivity((prev) => ({ ...prev, audioNoiseActive: true }));
          }
        });
    }
  };

  // Sports Mode Action Handlers
  const handleToggleSportsMode = useCallback(() => {
    setSportsSession((prev) => {
      const willBeActive = !prev.active;
      if (willBeActive) {
        const profile = SPORT_PROFILES[prev.sportType];
        const initialHr = Math.round((profile.targetHrMin + profile.targetHrMax) / 2);
        const zoneInfo = getHeartRateZone(initialHr);

        const athleticVitals: SensorVitals = {
          ...vitals,
          heartRate: initialHr,
          respiration: 26,
          skinTemp: 37.2,
        };
        const athleticBiomech: BiomechanicalData = {
          ...biomech,
          posture: profile.defaultPosture,
          movement: 'High',
          imu: { x: 0.35, y: 0.62, z: 1.15 },
          fallDetected: false,
        };
        const newRf = calculateSportsOptimizedRiskFusion(athleticVitals, athleticBiomech, enviro, true);

        setVitals(athleticVitals);
        setBiomech(athleticBiomech);
        setRiskFusion(newRf);

        return {
          ...prev,
          active: true,
          paused: false,
          elapsedSeconds: 0,
          caloriesBurned: 0,
          cadence: Math.round((profile.targetCadenceMin + profile.targetCadenceMax) / 2),
          peakHeartRate: initialHr,
          averageHeartRate: initialHr,
          activeZone: zoneInfo.zone,
          zoneName: zoneInfo.name,
        };
      } else {
        const restingVitals: SensorVitals = {
          ...vitals,
          heartRate: 78,
          respiration: 16,
          skinTemp: 36.5,
        };
        const restingBiomech: BiomechanicalData = {
          ...biomech,
          posture: 'Sitting',
          movement: 'Low',
          imu: { x: 0.12, y: 0.04, z: 0.98 },
        };
        const newRf = calculateSportsOptimizedRiskFusion(restingVitals, restingBiomech, enviro, false);

        setVitals(restingVitals);
        setBiomech(restingBiomech);
        setRiskFusion(newRf);

        return {
          ...prev,
          active: false,
          paused: false,
        };
      }
    });
  }, [vitals, biomech, enviro]);

  const handleTogglePlayPauseSports = useCallback(() => {
    setSportsSession((prev) => ({ ...prev, paused: !prev.paused }));
  }, []);

  const handleResetSportsSession = useCallback(() => {
    setSportsSession((prev) => ({
      ...prev,
      elapsedSeconds: 0,
      caloriesBurned: 0,
      peakHeartRate: vitals.heartRate,
      averageHeartRate: vitals.heartRate,
    }));
  }, [vitals.heartRate]);

  const handleChangeSportType = useCallback((sport: SportType) => {
    setSportsSession((prev) => {
      const profile = SPORT_PROFILES[sport];
      const targetHr = Math.round((profile.targetHrMin + profile.targetHrMax) / 2);
      const targetCadence = Math.round((profile.targetCadenceMin + profile.targetCadenceMax) / 2);
      const zoneInfo = getHeartRateZone(targetHr);

      setVitals((v) => ({ ...v, heartRate: targetHr }));
      setBiomech((b) => ({ ...b, posture: profile.defaultPosture }));

      return {
        ...prev,
        sportType: sport,
        cadence: targetCadence,
        peakHeartRate: Math.max(prev.peakHeartRate, targetHr),
        activeZone: zoneInfo.zone,
        zoneName: zoneInfo.name,
      };
    });
  }, []);

  // Navigation handlers
  const navigateTo = useCallback(
    (screen: ScreenId) => {
      setSlideDirection(1);
      setNavHistory((prev) => [...prev, currentScreen]);
      setCurrentScreen(screen);

      // Keep bottom tab in sync if navigating to a primary tab screen
      if (['dashboard', 'environment', 'history', 'alerts', 'settings'].includes(screen)) {
        setActiveTab(screen as TabId);
      }
    },
    [currentScreen]
  );

  const goBack = useCallback(() => {
    setSlideDirection(-1);
    if (navHistory.length > 0) {
      const prevScreen = navHistory[navHistory.length - 1];
      setNavHistory((prev) => prev.slice(0, prev.length - 1));
      setCurrentScreen(prevScreen);
      if (['dashboard', 'environment', 'history', 'alerts', 'settings'].includes(prevScreen)) {
        setActiveTab(prevScreen as TabId);
      }
    } else {
      setCurrentScreen('dashboard');
      setActiveTab('dashboard');
    }
  }, [navHistory]);

  const handleSelectTab = (tab: TabId) => {
    if (tab === activeTab && currentScreen === tab) return;
    const prevIndex = TAB_ORDER[activeTab] ?? 0;
    const nextIndex = TAB_ORDER[tab] ?? 0;
    setSlideDirection(nextIndex >= prevIndex ? 1 : -1);
    setActiveTab(tab);
    setNavHistory((prev) => [...prev, currentScreen]);
    setCurrentScreen(tab as ScreenId);
  };


  // Periodic live physical telemetry drift (Adaptive: 1Hz in Sports Mode, 3.8s in resting mode)
  useEffect(() => {
    const intervalTime = sportsSession.active ? 1000 : 3800;

    const interval = setInterval(() => {
      if (sportsSession.active) {
        if (sportsSession.paused) return;

        const profile = SPORT_PROFILES[sportsSession.sportType];

        setSportsSession((prev) => {
          const nextElapsed = prev.elapsedSeconds + 1;
          const nextCalories = prev.caloriesBurned + profile.calPerSec;

          // If BLE is connected, preserve real BLE heart rate, otherwise athletic drift
          const currentHr = vitals.heartRate;
          const hrDelta = Math.random() > 0.4 ? (Math.random() > 0.5 ? 1 : -1) : 0;
          const newHR = connectivity.bleConnected
            ? currentHr
            : Math.min(
                profile.targetHrMax + 4,
                Math.max(profile.targetHrMin - 4, currentHr + hrDelta)
              );

          const newPeak = Math.max(prev.peakHeartRate, newHR);
          const newAvg = Math.round(
            (prev.averageHeartRate * prev.elapsedSeconds + newHR) / nextElapsed
          );
          const zoneInfo = getHeartRateZone(newHR);

          // Cadence modulation
          const cadenceDelta = Math.random() > 0.6 ? (Math.random() > 0.5 ? 1 : -1) : 0;
          const newCadence = connectivity.deviceMotionActive
            ? biomech.cadence
            : Math.min(
                profile.targetCadenceMax,
                Math.max(profile.targetCadenceMin, prev.cadence + cadenceDelta)
              );

          // Athletic gait IMU motion
          const t = nextElapsed * 1.5;
          const athleticIMU = connectivity.deviceMotionActive
            ? biomech.imu
            : {
                x: Number((0.35 + Math.sin(t) * 0.18).toFixed(2)),
                y: Number((0.62 + Math.cos(t) * 0.22).toFixed(2)),
                z: Number((1.15 + Math.sin(t * 2) * 0.25).toFixed(2)),
              };

          // Update vitals & biomech
          const updatedVitals: SensorVitals = {
            ...vitals,
            heartRate: newHR,
            respiration: Math.min(
              32,
              Math.max(
                24,
                vitals.respiration + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0)
              )
            ),
            skinTemp: Number((37.2 + (Math.random() - 0.5) * 0.1).toFixed(1)),
          };

          const updatedBiomech: BiomechanicalData = {
            ...biomech,
            movement: 'High',
            imu: athleticIMU,
            fallDetected: false,
          };

          const sportsRf = calculateSportsOptimizedRiskFusion(
            updatedVitals,
            updatedBiomech,
            enviro,
            true
          );

          setVitals(updatedVitals);
          setBiomech(updatedBiomech);
          setRiskFusion(sportsRf);

          return {
            ...prev,
            elapsedSeconds: nextElapsed,
            caloriesBurned: nextCalories,
            peakHeartRate: newPeak,
            averageHeartRate: newAvg,
            activeZone: zoneInfo.zone,
            zoneName: zoneInfo.name,
            cadence: newCadence,
          };
        });
      } else {
        // Standard Resting mode live telemetry
        if (!connectivity.bleConnected) {
          setVitals((prev) => {
            const hrDrift = Math.random() > 0.6 ? (Math.random() > 0.5 ? 1 : -1) : 0;
            const newHR = Math.min(82, Math.max(75, prev.heartRate + hrDrift));
            return { ...prev, heartRate: newHR };
          });
        }

        if (!connectivity.deviceMotionActive) {
          setBiomech((prev) => {
            const microX = Number((0.12 + (Math.random() - 0.5) * 0.02).toFixed(2));
            const microY = Number((0.04 + (Math.random() - 0.5) * 0.02).toFixed(2));
            const microZ = Number((0.98 + (Math.random() - 0.5) * 0.01).toFixed(2));
            return {
              ...prev,
              imu: { x: microX, y: microY, z: microZ },
            };
          });
        }
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [
    sportsSession.active,
    sportsSession.paused,
    sportsSession.sportType,
    connectivity.bleConnected,
    connectivity.deviceMotionActive,
    vitals,
    biomech,
    enviro,
  ]);

  // Physical Impact & Fall Safety Drill Trigger
  const handleTriggerImpactDrill = () => {
    const newB: BiomechanicalData = {
      ...biomech,
      fallDetected: true,
      posture: 'Lying Down',
      movement: 'Low',
      imu: { x: 0.92, y: 0.14, z: 0.2 },
    };
    const newV: SensorVitals = {
      ...vitals,
      heartRate: 114,
    };
    const newRf = calculateRiskFusion(newV, newB, enviro);

    setBiomech(newB);
    setVitals(newV);
    setRiskFusion(newRf);

    // Add alert entry
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
    const newAlert: AlertItem = {
      id: `alt-${Date.now()}`,
      title: 'Fall Incident Logged',
      source: 'Hardware IMU',
      time: timeStr,
      severity: 'critical',
      description: 'Deceleration impact threshold exceeded. Motion telemetry tracking active.',
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const handleClearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const handleDismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleRestoreAlerts = useCallback(() => {
    setAlerts(INITIAL_ALERTS);
  }, []);

  // Determine whether bottom nav should show
  const showBottomNav = [
    'dashboard',
    'environment',
    'history',
    'alerts',
    'settings',
  ].includes(currentScreen);

  const unresolvedAlertsCount = alerts.filter(
    (a) => a.severity === 'critical' || a.severity === 'elevated'
  ).length;

  return (
    <div className="h-[100dvh] w-full bg-slate-100 dark:bg-[#050811] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-start font-sans antialiased transition-colors duration-200 overflow-hidden">
      {/* Responsive App Container: fills screen on mobile, gracefully constrained on tablet & desktop */}
      <div className="w-full max-w-xl sm:max-w-2xl h-full flex flex-col bg-slate-50 dark:bg-[#070b14] shadow-sm sm:shadow-2xl sm:border-x border-slate-200 dark:border-[#14223d]/60 relative overflow-hidden">
          {/* Main Screen Content with Directional Slide-in Transitions */}
          <main
            className={`flex-1 flex flex-col w-full overflow-x-hidden relative ${
              currentScreen === 'dashboard'
                ? 'overflow-hidden pb-14 sm:pb-16'
                : 'overflow-y-auto pb-18 sm:pb-20'
            }`}
          >
            <AnimatePresence mode="wait" custom={slideDirection} initial={false}>
              <motion.div
                key={currentScreen}
                custom={slideDirection}
                variants={screenVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex-1 flex flex-col w-full h-full"
              >
                {currentScreen === 'intro' && (
                  <div className="h-[100dvh] flex flex-col">
                    <IntroScreen
                      onComplete={() => {
                        setSlideDirection(1);
                        if (!user) {
                          setCurrentScreen('auth');
                        } else {
                          setCurrentScreen('dashboard');
                        }
                      }}
                    />
                  </div>
                )}

                {currentScreen === 'auth' && (
                  <div className="h-[100dvh] flex flex-col">
                    <AuthScreen
                      onSuccess={() => {
                        setSlideDirection(1);
                        setCurrentScreen('dashboard');
                      }}
                    />
                  </div>
                )}

                {currentScreen === 'dashboard' && (
                  <DashboardScreen
                    vitals={vitals}
                    riskFusion={riskFusion}
                    connectivity={connectivity}
                    onNavigate={navigateTo}
                    sportsSession={sportsSession}
                    onToggleSportsMode={handleToggleSportsMode}
                    onTogglePlayPauseSports={handleTogglePlayPauseSports}
                    onResetSportsSession={handleResetSportsSession}
                    onChangeSportType={handleChangeSportType}
                  />
                )}

                {currentScreen === 'physiological' && (
                  <PhysiologicalScreen
                    vitals={vitals}
                    onBack={goBack}
                    sportsSession={sportsSession}
                  />
                )}

                {currentScreen === 'biomechanical' && (
                  <BiomechanicalScreen
                    biomech={biomech}
                    onBack={goBack}
                    onPerformImpactDrill={handleTriggerImpactDrill}
                    sportsSession={sportsSession}
                  />
                )}

                {currentScreen === 'environment' && (
                  <EnvironmentScreen enviro={enviro} onBack={goBack} />
                )}

                {currentScreen === 'risk-fusion' && (
                  <RiskFusionScreen
                    vitals={vitals}
                    biomech={biomech}
                    enviro={enviro}
                    riskFusion={riskFusion}
                    onUpdateState={(v, b, e, rf) => {
                      setVitals(v);
                      setBiomech(b);
                      setEnviro(e);
                      setRiskFusion(rf);
                    }}
                    onBack={goBack}
                  />
                )}

                {currentScreen === 'alerts' && (
                  <AlertsScreen
                    alerts={alerts}
                    showBack={navHistory.length > 0 && !showBottomNav}
                    onBack={goBack}
                    onClearAlerts={handleClearAlerts}
                    onDismissAlert={handleDismissAlert}
                    onRestoreAlerts={handleRestoreAlerts}
                  />
                )}

                {currentScreen === 'history' && (
                  <HistoryScreen
                    showBack={navHistory.length > 0 && !showBottomNav}
                    onBack={goBack}
                    currentVitals={vitals}
                    currentBiomech={biomech}
                  />
                )}

                {currentScreen === 'connectivity' && (
                  <ConnectivityScreen
                    connectivity={connectivity}
                    onUpdateConnectivity={(updated) =>
                      setConnectivity((prev) => ({ ...prev, ...updated }))
                    }
                    onBack={goBack}
                    onSyncRealClimate={handleSyncRealClimate}
                    onToggleAudioSensor={handleToggleAudioSensor}
                    isAudioActive={isAudioActive}
                  />
                )}

                {currentScreen === 'diagnostics' && (
                  <DiagnosticsScreen onBack={goBack} />
                )}

                {currentScreen === 'emergency' && (
                  <EmergencyContactsScreen
                    contacts={contacts}
                    onUpdateContacts={setContacts}
                    onBack={goBack}
                  />
                )}

                {currentScreen === 'settings' && (
                  <SettingsScreen
                    onNavigate={navigateTo}
                    onReplayIntro={() => {
                      setSlideDirection(-1);
                      setCurrentScreen('intro');
                    }}
                    vitals={vitals}
                    biomech={biomech}
                    enviro={enviro}
                    sportsSession={sportsSession}
                    onToggleSportsMode={handleToggleSportsMode}
                    onChangeSportType={handleChangeSportType}
                  />
                )}

                {currentScreen === 'sports' && (
                  <SportsScreen
                    sportsSession={sportsSession}
                    vitals={vitals}
                    biomech={biomech}
                    onBack={goBack}
                    onTogglePlayPause={handleTogglePlayPauseSports}
                    onResetSession={handleResetSportsSession}
                    onChangeSportType={handleChangeSportType}
                    onToggleSportsMode={handleToggleSportsMode}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Persistent Bottom Navigation on primary screens */}
          {showBottomNav && (
            <div className="fixed bottom-0 left-0 right-0 z-40 w-full max-w-xl sm:max-w-2xl mx-auto shadow-lg">
              <BottomNav
                activeTab={activeTab}
                onSelectTab={handleSelectTab}
                unresolvedAlertsCount={unresolvedAlertsCount}
              />
            </div>
          )}
        </div>
      </div>
  );
}
