import React, { useState, useEffect, useRef } from 'react';
import { BatteryGridState } from '../../types';
import { Wind, Zap, Activity, ShieldCheck, Gauge, RotateCw } from 'lucide-react';
import { sound } from '../../utils/audioEngine';

export const AsbadsBatteryGrid: React.FC = () => {
  const [state, setState] = useState<BatteryGridState>({
    windSpeedMs: 18.5,
    asbadsRpm: 68.2,
    alternatorVoltageAc: 98.4,
    rectifiedDcRaw: 88.5,
    electrolyteConcPercent: 12.0,
    activeParallelBanks: 1250,
    seriesCellsPerBank: 40,
    totalCells: 50000,
    busVoltageDc: 48.02,
    busCurrentA: 37.5,
    rippleVoltageMv: 0.018,
    filterCutoffHz: 0.0042,
    busStabilityPercent: 99.98,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  // Recalculate physics when controls change
  const updatePhysics = (wind: number, acid: number) => {
    // Rotor RPM derived from wind speed and tip-speed ratio (lambda approx 0.8 for Savonius/Asbad)
    const rpm = Math.min(95, Math.max(0, wind * 3.8));
    // Alternator AC output proportional to RPM
    const acVoltage = (rpm / 90) * 135;
    const rawDc = acVoltage * 0.9;
    // Single cell Nernst potential depending on acid conc: 1.10V at 5% to 1.35V at 20%
    const cellV = 1.05 + (acid / 100) * 1.25;
    const busV = Number((cellV * 40).toFixed(2));
    const ripple = Number((Math.max(0.008, 0.05 / (acid * 0.5))).toFixed(4));
    const current = Number(((state.activeParallelBanks * 0.03) * (acid / 12)).toFixed(1));

    setState((prev) => ({
      ...prev,
      windSpeedMs: wind,
      asbadsRpm: Number(rpm.toFixed(1)),
      alternatorVoltageAc: Number(acVoltage.toFixed(1)),
      rectifiedDcRaw: Number(rawDc.toFixed(1)),
      electrolyteConcPercent: acid,
      busVoltageDc: busV,
      busCurrentA: current,
      rippleVoltageMv: ripple,
      busStabilityPercent: Number((100 - ripple * 2).toFixed(2)),
    }));
  };

  // Oscilloscope Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;
      timeRef.current += 0.05;
      const t = timeRef.current;

      const width = canvas.width;
      const height = canvas.height;

      // Dark oscilloscope screen background
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = '#111e33';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center baseline
      ctx.strokeStyle = '#1e3a5f';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Channel 1 (Amber): Raw Pulsating Alternator DC (chaotic wind ripple)
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const freq = (state.asbadsRpm / 60) * 0.15;
        const windGust = Math.sin(t * 0.4 + x * 0.01) * 8;
        const wave = Math.abs(Math.sin((x * freq) + t * 4)) * 38;
        const y = height / 2 - 20 - wave - windGust;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Channel 2 (Cyan/Emerald): 50,000 Baghdad Battery Pure Flat Bus (Ultra-clean DC)
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        // Microscopic ripple (mV scale magnified 500x)
        const microRipple = Math.sin(x * 0.05 + t * 3) * (state.rippleVoltageMv * 15);
        const y = height / 2 + 35 + microRipple;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Legend overlay
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`CH1: RAW ASBAD PMA DC [${state.rectifiedDcRaw}V PEAK]`, 12, 20);
      ctx.fillStyle = '#06b6d4';
      ctx.fillText(`CH2: 50K BAGHDAD BATTERY FILTERED [${state.busVoltageDc}V DC ±${state.rippleVoltageMv}mV]`, 12, 38);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [state]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 sm:p-7 space-y-6">
      {/* Title & System Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-['Cinzel'] font-bold text-base text-slate-100">
              ASBADS ROTOR & 50,000 BAGHDAD BATTERY MATRIX
            </span>
            <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
              GRID-INDEPENDENT
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Mechanical-to-Galvanic zero-noise power loop driving Maragheh Quantum Obscura Sensors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              updatePhysics(32.5, state.electrolyteConcPercent);
              sound.playAsbadRotorSpin();
            }}
            className="px-3 py-1.5 text-xs font-mono font-medium rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Simulate Desert Gale (32 m/s)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Control Sliders + Oscilloscope Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parameter Sliders (5 cols) */}
        <div className="lg:col-span-5 space-y-5 bg-slate-950/70 p-4 rounded-lg border border-slate-800/80">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-amber-400" />
                Sistan Wind Velocity (m/s)
              </span>
              <span className="text-amber-400 font-bold tabular-nums">{state.windSpeedMs} m/s</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="0.5"
              value={state.windSpeedMs}
              onChange={(e) => updatePhysics(parseFloat(e.target.value), state.electrolyteConcPercent)}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>0 m/s (Calm)</span>
              <span>18 m/s (Nominal)</span>
              <span>40 m/s (Severe Tempest)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Acetic Acid Concentration (%)
              </span>
              <span className="text-emerald-400 font-bold tabular-nums">
                {state.electrolyteConcPercent}% CH₃COOH
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="20"
              step="0.5"
              value={state.electrolyteConcPercent}
              onChange={(e) => updatePhysics(state.windSpeedMs, parseFloat(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>5% (Dilute Vinegar)</span>
              <span>12% (Standard Matrix)</span>
              <span>20% (High Acid Redox)</span>
            </div>
          </div>

          {/* Matrix Topology Specs */}
          <div className="pt-3 border-t border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Total Baghdad Battery Cells:</span>
              <span className="text-cyan-400 tabular-nums">50,000 Jars</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Series Configuration:</span>
              <span className="text-slate-200">40 Cells / String (48.0V)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Parallel Strings:</span>
              <span className="text-slate-200">1,250 Strings (37.5A)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Chemical Low-Pass Cutoff (fc):</span>
              <span className="text-emerald-400 tabular-nums">0.0042 Hz</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Ripple Attenuation:</span>
              <span className="text-emerald-400 tabular-nums">–142 dBm</span>
            </div>
          </div>
        </div>

        {/* Right Column: Oscilloscope Screen (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="rounded-lg overflow-hidden border border-slate-800 bg-[#060a12] shadow-inner">
            <canvas ref={canvasRef} width={580} height={220} className="w-full h-56 block" />
          </div>

          {/* Real-time Telemetry Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">ASBAD ROTOR</div>
              <div className="text-base font-bold text-amber-400 tabular-nums">
                {state.asbadsRpm} <span className="text-xs text-slate-400 font-normal">RPM</span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">RAW ALTERNATOR</div>
              <div className="text-base font-bold text-amber-300 tabular-nums">
                {state.alternatorVoltageAc} <span className="text-xs text-slate-400 font-normal">Vp-p</span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">FILTERED DC BUS</div>
              <div className="text-base font-bold text-cyan-400 tabular-nums">
                {state.busVoltageDc} <span className="text-xs text-slate-400 font-normal">V DC</span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">BUS RIPPLE</div>
              <div className="text-base font-bold text-emerald-400 tabular-nums">
                ±{state.rippleVoltageMv} <span className="text-xs text-slate-400 font-normal">mV</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
