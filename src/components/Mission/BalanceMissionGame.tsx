import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Trophy,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  Wind,
  Zap,
  Compass,
  CheckCircle2,
  Flame,
  Layers,
  Save,
  Download,
  Terminal,
} from 'lucide-react';
import { sound } from '../../utils/audioEngine';
import { AetherSaveState } from '../../types';

export const BalanceMissionGame: React.FC = () => {
  // Mode toggle: Conjunction Challenge vs. Act II Outpost Engine Console
  const [activeMode, setActiveMode] = useState<'MISSION' | 'OUTPOST_CONSOLE'>('OUTPOST_CONSOLE');

  // -------------------------------------------------------------
  // Act II Outpost Game Engine Loop (matching AetherCoreGameEngine specs)
  // -------------------------------------------------------------
  const [sailPitchRatio, setSailPitchRatio] = useState<number>(0.65); // 0.0 to 1.0
  const [engagedBatteryRows, setEngagedBatteryRows] = useState<number>(28); // 1 to 40
  const [shieldStability, setShieldStability] = useState<number>(84.0); // %
  const [asbadRpm, setAsbadRpm] = useState<number>(6200);
  const [batteryVoltageDc, setBatteryVoltageDc] = useState<number>(48.2);
  const [neutrinoFluxPev, setNeutrinoFluxPev] = useState<number>(45.0);
  const [atarFlareActive, setAtarFlareActive] = useState<boolean>(false);
  const [tusiAligned, setTusiAligned] = useState<boolean>(true);
  const [saveStateJson, setSaveStateJson] = useState<string>('');
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);

  // -------------------------------------------------------------
  // Mode 1: Conjunction Challenge State
  // -------------------------------------------------------------
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [windDamping, setWindDamping] = useState<number>(35);
  const [acidFlow, setAcidFlow] = useState<number>(8);
  const [tusiOffset, setTusiOffset] = useState<number>(14);
  const [quadrantAngle, setQuadrantAngle] = useState<number>(25.0);

  const isWindBalanced = windDamping >= 48 && windDamping <= 68;
  const isBatteryBalanced = acidFlow >= 11 && acidFlow <= 13;
  const isTusiBalanced = tusiOffset === 0 || tusiOffset === 60;
  const isAstrolabeBalanced = Math.abs(quadrantAngle - 38.2) <= 1.0;
  const allBalanced = isWindBalanced && isBatteryBalanced && isTusiBalanced && isAstrolabeBalanced;

  // Real-time Engine Simulation Loop (AetherCoreGameEngine @ 30Hz)
  useEffect(() => {
    const timer = setInterval(() => {
      const nowSec = Date.now() / 1000;

      // Wind fluctuation in knots: 25 ± 5
      const windSpeedKnots = 25.0 + Math.sin(nowSec * 1.5) * 4.5;
      const rpm = Math.floor(windSpeedKnots * sailPitchRatio * 200.0);
      setAsbadRpm(rpm);

      // Raw voltage filtered through square root of active battery rows
      const rawVoltage = rpm / 30.0;
      const smoothingFactor = Math.sqrt(engagedBatteryRows);
      const v = Number(((rawVoltage / smoothingFactor) + 12.0).toFixed(2));
      setBatteryVoltageDc(v);

      // Dynamic cosmic flux load: 40 + 15 * sin(t * 0.5)
      const flux = Number((40.0 + 15.0 * Math.sin(nowSec * 0.5)).toFixed(1));
      setNeutrinoFluxPev(flux);

      // Check voltage error against 48.0V DC instrument grade baseline
      const voltageError = Math.abs(v - 48.0);

      // Modulo-60 verification
      const token0 = 59;
      const token1 = Math.floor(nowSec) % 60;
      const token2 = Math.floor(rpm) % 60;
      const token3 = Math.floor(v) % 60;
      const token4 = Math.floor(flux) % 60;
      const partial = token0 + token1 + token2 + token3 + token4;
      const checksum = (60 - (partial % 60)) % 60;
      const packetBalanced = (partial + checksum) % 60 === 0 && tusiAligned;

      setShieldStability((prev) => {
        let delta = 0;
        if (voltageError > 4.5 || !packetBalanced) {
          delta = -((voltageError * 0.15) + (packetBalanced ? 0 : 0.4));
        } else {
          delta = 0.35;
        }
        return Math.max(0, Math.min(100, Number((prev + delta).toFixed(1))));
      });
    }, 100);

    return () => clearInterval(timer);
  }, [sailPitchRatio, engagedBatteryRows, tusiAligned]);

  // Mission timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0 && !hasWon) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, hasWon]);

  useEffect(() => {
    if (isPlaying && allBalanced && !hasWon) {
      setHasWon(true);
      setIsPlaying(false);
      sound.playCherenkovShockwave();
    }
  }, [isPlaying, allBalanced, hasWon]);

  const startMission = () => {
    setIsPlaying(true);
    setHasWon(false);
    setTimeLeft(45);
    setWindDamping(30);
    setAcidFlow(7);
    setTusiOffset(18);
    setQuadrantAngle(20.0);
    sound.playFiberDataBurst();
  };

  // Actions from Act II Python engine
  const handleAtarFlare = () => {
    setAtarFlareActive(true);
    sound.playCherenkovShockwave();
    setShieldStability((prev) => Math.min(100, prev + 20));
    setTimeout(() => setAtarFlareActive(false), 1200);
  };

  const handleAlignTusi = () => {
    setTusiAligned(true);
    sound.playFiberDataBurst();
  };

  const generateSaveState = () => {
    const state: AetherSaveState = {
      save_state_meta: {
        profile_id: 'AC-99823-Z',
        timestamp_epoch_sec: Math.floor(Date.now() / 1000),
        current_chapter: 6,
        current_act: 'ACT_III_CONVERGENCE',
        game_completed: hasWon || shieldStability > 95,
      },
      player_progression: {
        unlocked_outposts: [
          'SIBERIAN_BAIKAL_CORE',
          'ALTAY_MOUNTAIN_EXCAVATION',
          'MARAGHEH_HYBRID_CITADEL',
          'DASHT_E_KAVIR_BRINE_MATRIX',
        ],
        unlocked_tech_tree: [
          'TUSI_COUPLE_TRANSFORM',
          'BASE_60_COMPILER',
          'ENHANCED_HOT_WATER_DRILLING',
          'GALVANIC_BAGHDAD_CAPACITATION',
          'OBSIDIAN_CAMERA_OBSCURA',
        ],
      },
      resource_inventory: {
        siberian_nodes: {
          quantum_crystals_tons: 142.85,
          permafrost_ice_stability_pct: 100.0,
          available_dom_sensors: 480,
        },
        iranian_nodes: {
          primordial_lithium_brine_liters: 750000.0,
          terracotta_battery_jars_active: 50000,
          organic_acetic_acid_gallons: 12500.0,
        },
      },
      active_engine_metrics: {
        slider_settings: {
          asbad_sail_pitch_ratio: sailPitchRatio,
          engaged_battery_rows: engagedBatteryRows,
        },
        live_outputs: {
          asbad_turbine_rpm: asbadRpm,
          baghdad_matrix_voltage_dc: batteryVoltageDc,
          neutrino_flux_load_peV: neutrinoFluxPev,
          shield_integrity_pct: shieldStability,
        },
        algebraic_verification: {
          last_verified_header: 59,
          al_jabr_checksum_state: 0,
          system_modulo_equilibrium: tusiAligned,
        },
      },
    };

    setSaveStateJson(JSON.stringify(state, null, 2));
    setShowSaveModal(true);
  };

  const downloadSaveState = () => {
    const blob = new Blob([saveStateJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aether_core_save_state_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 sm:p-8 space-y-6 shadow-2xl">
      {/* Top Console Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-['Cinzel'] font-bold text-lg text-slate-100">
              MISSION CONTROL & OUTPOST OPERATIONS
            </span>
            <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
              ACT II & III ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Real-time control architecture: Asbads torque, Baghdad battery smoothing, Atar flare channel, and mining outposts.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveMode('OUTPOST_CONSOLE')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all cursor-pointer ${
              activeMode === 'OUTPOST_CONSOLE'
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Outpost Engine Console
          </button>
          <button
            onClick={() => setActiveMode('MISSION')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all cursor-pointer ${
              activeMode === 'MISSION'
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Conjunction Challenge (Timed)
          </button>
          <button
            onClick={generateSaveState}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border border-slate-700 cursor-pointer"
            title="Save Game State (save_state.json)"
          >
            <Save className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* MODE 1: OUTPOST ENGINE CONSOLE (User Python/JS specs)                */}
      {/* --------------------------------------------------------------------- */}
      {activeMode === 'OUTPOST_CONSOLE' && (
        <div className="space-y-6">
          {/* Header Telemetry Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            <div>
              <div className="text-[10px] font-mono text-slate-400">SYSTEM STATUS</div>
              <div className="text-sm font-mono font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{shieldStability > 0 ? 'RUNNING - ACTIVE' : 'CRITICAL FAILED'}</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono text-slate-400">SHIELD INTEGRITY</div>
              <div
                className={`text-lg font-mono font-bold tabular-nums ${
                  shieldStability > 60 ? 'text-cyan-400' : shieldStability > 30 ? 'text-amber-400' : 'text-rose-400'
                }`}
              >
                {shieldStability.toFixed(1)}%
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full transition-all duration-300 ${
                    shieldStability > 60 ? 'bg-cyan-400' : shieldStability > 30 ? 'bg-amber-400' : 'bg-rose-500'
                  }`}
                  style={{ width: `${shieldStability}%` }}
                />
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono text-slate-400">BATTERY VOLTAGE</div>
              <div className="text-lg font-mono font-bold text-amber-300 tabular-nums">
                {batteryVoltageDc.toFixed(2)} <span className="text-xs text-slate-400 font-normal">V DC</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">Target: 48.00 V DC</div>
            </div>

            <div>
              <div className="text-[10px] font-mono text-slate-400">NEUTRINO LOAD</div>
              <div className="text-lg font-mono font-bold text-purple-300 tabular-nums">
                {neutrinoFluxPev.toFixed(1)} <span className="text-xs text-slate-400 font-normal">PeV</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">Baikal Stream: Active</div>
            </div>
          </div>

          {/* Outposts Visual Map Matrix */}
          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-gradient-to-br from-[#07132b] via-[#050a14] to-[#12071a] p-6">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-4">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Compass className="w-3.5 h-3.5" />
                <span>PLANETARY OUTPOST ANOMALIES (ALTAY × KAVIR × MARAGHEH)</span>
              </span>
              <span className="text-amber-400">TUSI MATRIX: 59 : 22 : 14 : 45 : 10 : 00</span>
            </div>

            {/* Geological outposts grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-950/70 border border-cyan-500/30">
                <span className="text-[10px] font-mono text-cyan-400 block">SIBERIAN NODE 01</span>
                <h4 className="font-['Cinzel'] font-bold text-sm text-slate-100">Lake Baikal Core</h4>
                <div className="text-[11px] font-mono text-slate-400 mt-2 space-y-0.5">
                  <div>DOM Strings: 86 active</div>
                  <div>Ice Stability: 100.0%</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/70 border border-blue-500/30">
                <span className="text-[10px] font-mono text-blue-400 block">SIBERIAN NODE 02</span>
                <h4 className="font-['Cinzel'] font-bold text-sm text-slate-100">Altay Crag Mine</h4>
                <div className="text-[11px] font-mono text-slate-400 mt-2 space-y-0.5">
                  <div>Quantum Ore: 142.85 Tons</div>
                  <div>Laser Claws: Armed</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/70 border border-amber-500/30">
                <span className="text-[10px] font-mono text-amber-400 block">IRANIAN NODE 01</span>
                <h4 className="font-['Cinzel'] font-bold text-sm text-slate-100">Maragheh Citadel</h4>
                <div className="text-[11px] font-mono text-slate-400 mt-2 space-y-0.5">
                  <div>Asbads RPM: {asbadRpm}</div>
                  <div>Dark Astrolabe: Coincident</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/70 border border-yellow-500/30">
                <span className="text-[10px] font-mono text-yellow-400 block">IRANIAN NODE 02</span>
                <h4 className="font-['Cinzel'] font-bold text-sm text-slate-100">Dasht-e Kavir Salt Vats</h4>
                <div className="text-[11px] font-mono text-slate-400 mt-2 space-y-0.5">
                  <div>Lithium Brine: 750,000 L</div>
                  <div>Absorption: 2x Boost</div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Sliders & Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Slider 1: Asbad Sail Pitch */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-amber-400" />
                  ASBAD SAIL PITCH (TURBINE TORQUE)
                </span>
                <span className="text-amber-400 font-bold tabular-nums">
                  {(sailPitchRatio * 100).toFixed(0)}% · {asbadRpm} RPM
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(sailPitchRatio * 100)}
                onChange={(e) => setSailPitchRatio(parseFloat(e.target.value) / 100)}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>MIN (Closed)</span>
                <span>NOMINAL (65%)</span>
                <span>MAX (Fully Open)</span>
              </div>
            </div>

            {/* Slider 2: Battery Rows */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  BAGHDAD BATTERY MATRIX ROW CAPACITY
                </span>
                <span className="text-cyan-400 font-bold tabular-nums">
                  {engagedBatteryRows} Rows · {batteryVoltageDc} V DC
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="40"
                value={engagedBatteryRows}
                onChange={(e) => setEngagedBatteryRows(parseInt(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>1 Row (Raw Spikes)</span>
                <span>28 Rows (48V Sweet Spot)</span>
                <span>40 Rows (High Damp)</span>
              </div>
            </div>
          </div>

          {/* Interactive Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleAtarFlare}
              className={`px-5 py-2.5 rounded font-['Cinzel'] font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer border ${
                atarFlareActive
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.8)]'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 border-amber-400 shadow-md'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>{atarFlareActive ? 'Atar Flare Deployed (+20% Shield)' : 'Channel Atar Flare'}</span>
            </button>

            <button
              onClick={handleAlignTusi}
              className="px-5 py-2.5 rounded font-['Cinzel'] font-bold text-xs uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Align Tusi Engine (Σ ≡ 0 mod 60)</span>
            </button>

            <button
              onClick={generateSaveState}
              className="px-4 py-2.5 rounded font-mono text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Save State</span>
            </button>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODE 2: TIMED CONJUNCTION CHALLENGE (Mode 1)                         */}
      {/* --------------------------------------------------------------------- */}
      {activeMode === 'MISSION' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-['Cinzel'] font-bold text-lg text-slate-100">
                  SECTOR CONJUNCTION CHALLENGE
                </span>
                <span className="font-mono text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                  TIMED TRIAL
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-sans leading-relaxed">
                Balance all 4 ancient and modern subsystems simultaneously to lock onto Blazar TXS 0506+056 before the coherence window closes!
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="font-mono text-center px-4 py-2 bg-slate-950 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400">COHERENCE WINDOW</div>
                <div className={`text-xl font-bold ${timeLeft <= 10 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`}>
                  00:{timeLeft.toString().padStart(2, '0')}
                </div>
              </div>

              {!isPlaying && !hasWon && (
                <button
                  onClick={startMission}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-['Cinzel'] font-bold text-xs uppercase tracking-wider rounded shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Initiate Conjunction</span>
                </button>
              )}

              {(isPlaying || hasWon || timeLeft === 0) && (
                <button
                  onClick={startMission}
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Victory Banner */}
          {hasWon && (
            <div className="p-6 bg-gradient-to-r from-emerald-950/80 via-teal-950/80 to-slate-950/90 border-2 border-emerald-400 rounded-xl space-y-3">
              <div className="flex items-center gap-2.5 text-emerald-400">
                <Trophy className="w-6 h-6" />
                <h3 className="font-['Cinzel'] font-bold text-lg sm:text-xl text-emerald-300">
                  CONJUNCTION LOCKED: ARSHAMA AWAKENS!
                </h3>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-sans">
                Outstanding engineering! The 50,000 Baghdad battery cells stabilized the instrument bus, the Tusi-Couple resolved the Cherenkov vector, and the Dark Astrolabe captured the optical counterpart of Blazar TXS 0506+056!
              </p>
              <div className="font-mono text-xs text-amber-300 italic pt-1">
                "از نور پاکِ مَزدا... جهان در توازن است — The cosmos is in perfect equilibrium."
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className={`p-4 rounded-xl border transition-all ${
              isWindBalanced ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-slate-200 flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-amber-400" />
                  1. Asbads Rotor Damping:
                </span>
                <span className={`text-xs font-mono font-bold ${isWindBalanced ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {windDamping}% {isWindBalanced ? '✓ OPTIMAL' : '(Target: 50–65%)'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={windDamping}
                disabled={!isPlaying}
                onChange={(e) => setWindDamping(parseInt(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer disabled:opacity-40"
              />
            </div>

            <div className={`p-4 rounded-xl border transition-all ${
              isBatteryBalanced ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-slate-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  2. Baghdad Battery Acid Flow:
                </span>
                <span className={`text-xs font-mono font-bold ${isBatteryBalanced ? 'text-emerald-400' : 'text-cyan-400'}`}>
                  {acidFlow}% {isBatteryBalanced ? '✓ 48.0V PURE' : '(Target: 11–13%)'}
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="20"
                value={acidFlow}
                disabled={!isPlaying}
                onChange={(e) => setAcidFlow(parseInt(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer disabled:opacity-40"
              />
            </div>

            <div className={`p-4 rounded-xl border transition-all ${
              isTusiBalanced ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" />
                  3. Al-Jabr Modulo Resolver:
                </span>
                <span className={`text-xs font-mono font-bold ${isTusiBalanced ? 'text-emerald-400' : 'text-yellow-400'}`}>
                  Δ = {tusiOffset} {isTusiBalanced ? '✓ Σ ≡ 0 (MOD 60)' : '(Target: 0)'}
                </span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                value={tusiOffset}
                disabled={!isPlaying}
                onChange={(e) => setTusiOffset(parseInt(e.target.value))}
                className="w-full accent-yellow-400 cursor-pointer disabled:opacity-40"
              />
            </div>

            <div className={`p-4 rounded-xl border transition-all ${
              isAstrolabeBalanced ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-slate-200 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-purple-400" />
                  4. Dark Astrolabe Zenith Arc:
                </span>
                <span className={`text-xs font-mono font-bold ${isAstrolabeBalanced ? 'text-emerald-400' : 'text-purple-400'}`}>
                  {quadrantAngle}° {isAstrolabeBalanced ? '✓ LOCKED' : '(Target: 38.2°)'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="0.2"
                value={quadrantAngle}
                disabled={!isPlaying}
                onChange={(e) => setQuadrantAngle(parseFloat(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer disabled:opacity-40"
              />
            </div>
          </div>
        </div>
      )}

      {/* JSON Save State Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-2xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-['Cinzel'] font-bold text-sm text-cyan-300 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>SAVE_STATE.JSON SCHEMA (ACT III PRESERVATION)</span>
              </span>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <pre className="p-4 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 max-h-80 overflow-y-auto leading-relaxed">
              {saveStateJson}
            </pre>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={downloadSaveState}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold rounded flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download save_state.json</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
