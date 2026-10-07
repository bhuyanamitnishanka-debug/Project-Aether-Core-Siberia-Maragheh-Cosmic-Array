import React, { useState, useEffect, useRef } from 'react';
import { AstrolabeState } from '../../types';
import { Eye, Target, Sparkles, Thermometer, ShieldCheck, Compass } from 'lucide-react';
import { sound } from '../../utils/audioEngine';

interface DarkAstrolabeProps {
  neutrinoZenith?: number;
}

export const DarkAstrolabeTelescope: React.FC<DarkAstrolabeProps> = ({ neutrinoZenith = 38.2 }) => {
  const [state, setState] = useState<AstrolabeState>({
    obsidianPinholeMicrons: 22.4,
    cmosTempKelvin: 77.2,
    quadrantAngleDeg: 38.0,
    opticalTarget: 'Blazar TXS 0506+056',
    neutrinoVectorOffsetArcsec: 0.04,
    alignmentScorePercent: 99.4,
    isCoincidenceLocked: true,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Optical targets catalog
  const TARGETS = [
    { name: 'Blazar TXS 0506+056', angle: 38.2, constellation: 'Orion / 4 Gly', energyPeV: 1.45 },
    { name: 'Cygnus X-1 (Microquasar)', angle: 52.4, constellation: 'Cygnus / 7.2 kly', energyPeV: 0.85 },
    { name: 'Crab Nebula (Pulsar Wind)', angle: 22.0, constellation: 'Taurus / 6.5 kly', energyPeV: 0.42 },
    { name: 'Sagittarius A* (SMBH)', angle: 78.5, constellation: 'Galactic Center', energyPeV: 3.10 },
  ];

  const handleSelectTarget = (targetName: string) => {
    const t = TARGETS.find((item) => item.name === targetName);
    if (!t) return;
    setState((prev) => ({
      ...prev,
      opticalTarget: targetName,
      quadrantAngleDeg: t.angle,
      isCoincidenceLocked: Math.abs(t.angle - neutrinoZenith) < 1.0,
      neutrinoVectorOffsetArcsec: Number((Math.abs(t.angle - neutrinoZenith) * 0.1).toFixed(2)),
      alignmentScorePercent: Math.max(20, Number((100 - Math.abs(t.angle - neutrinoZenith) * 12).toFixed(1))),
    }));
    sound.playFiberDataBurst();
  };

  const handleAdjustAngle = (angle: number) => {
    const delta = Math.abs(angle - neutrinoZenith);
    const locked = delta < 0.8;
    setState((prev) => ({
      ...prev,
      quadrantAngleDeg: angle,
      isCoincidenceLocked: locked,
      neutrinoVectorOffsetArcsec: Number((delta * 0.05).toFixed(3)),
      alignmentScorePercent: Math.max(10, Number((100 - delta * 15).toFixed(1))),
    }));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;
    let t = 0;

    const render = () => {
      if (!running) return;
      t += 0.04;
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      // Dark space / CMOS sensor backdrop
      ctx.fillStyle = '#040711';
      ctx.fillRect(0, 0, width, height);

      // Pixel matrix grid
      ctx.strokeStyle = '#0d192e';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 16) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Celestial Crosshairs
      ctx.strokeStyle = '#1e3a5f';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.stroke();

      // Optical Star Spot (Diffraction Airy Disk through Obsidian Pinhole)
      const pinholeRadius = state.obsidianPinholeMicrons * 0.7;
      const starGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, pinholeRadius * 2);
      starGrad.addColorStop(0, '#fef08a');
      starGrad.addColorStop(0.25, '#fbbf24');
      starGrad.addColorStop(0.6, 'rgba(245, 158, 11, 0.4)');
      starGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

      ctx.fillStyle = starGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, pinholeRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Incoming Siberian Neutrino Arrival Vector
      const offsetPixels = (state.quadrantAngleDeg - neutrinoZenith) * 35;
      const neutrinoX = cx + offsetPixels;
      const neutrinoY = cy + Math.sin(t) * 2;

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(neutrinoX, neutrinoY, 18, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.arc(neutrinoX, neutrinoY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Coincidence Lock Reticle Ring
      if (state.isCoincidenceLocked) {
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 32 + Math.sin(t * 3) * 3, 0, Math.PI * 2);
        ctx.stroke();

        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillStyle = '#34d399';
        ctx.fillText('MULTI-MESSENGER COINCIDENCE LOCKED (5.2σ)', cx - 120, cy - 42);
      } else {
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(`VECTOR OFFSET: ${state.neutrinoVectorOffsetArcsec}″`, cx - 75, cy - 42);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [state, neutrinoZenith]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 sm:p-7 space-y-6">
      {/* Title & Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-['Cinzel'] font-bold text-base text-slate-100">
              "DARK ASTROLABE" OBSIDIAN CAMERA OBSCURA
            </span>
            <span className="font-mono text-[10px] text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded">
              77K LIQUID-N₂ COOLED
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Al-Haytham lensless diffraction-limited starlight camera mounted on Nasir al-Din al-Tusi's Maragheh mural quadrant.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {state.isCoincidenceLocked ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>COINCIDENCE LOCKED</span>
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold">
              ALIGNING RETICLE...
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4 bg-slate-950/70 p-4 rounded-lg border border-slate-800/80">
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5">
              Select Optical Celestial Target:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TARGETS.map((t) => (
                <button
                  key={t.name}
                  onClick={() => handleSelectTarget(t.name)}
                  className={`p-2 rounded text-left text-xs font-mono border transition-all cursor-pointer ${
                    state.opticalTarget === t.name
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold truncate">{t.name.split(' ')[0]}</div>
                  <div className="text-[10px] text-slate-400">{t.angle}° Zenith</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                Mural Quadrant Zenith Arc
              </span>
              <span className="text-amber-400 font-bold tabular-nums">
                {state.quadrantAngleDeg}°
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="0.1"
              value={state.quadrantAngleDeg}
              onChange={(e) => handleAdjustAngle(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-300">Obsidian Pinhole Diameter</span>
              <span className="text-cyan-400 font-bold tabular-nums">
                {state.obsidianPinholeMicrons} µm
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="80"
              step="0.5"
              value={state.obsidianPinholeMicrons}
              onChange={(e) =>
                setState((prev) => ({ ...prev, obsidianPinholeMicrons: parseFloat(e.target.value) }))
              }
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Cryogenic CMOS Specs */}
          <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">CMOS Detector Temp:</span>
              <span className="text-cyan-400 tabular-nums">77.2 K (Liquid N₂)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Dark Current Readout:</span>
              <span className="text-emerald-400">&lt; 0.0001 e⁻ / px / s</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Quantum Efficiency (QE):</span>
              <span className="text-emerald-400">94.8% at 550nm</span>
            </div>
          </div>
        </div>

        {/* Optical Sensor Screen Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="rounded-lg overflow-hidden border border-slate-800 bg-[#040711] shadow-inner relative">
            <canvas ref={canvasRef} width={620} height={230} className="w-full h-56 block cursor-crosshair" />
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between text-xs font-mono text-slate-300">
            <span className="text-amber-400">
              TARGET: <strong className="text-slate-100">{state.opticalTarget}</strong>
            </span>
            <span className="text-emerald-400">
              COINCIDENCE SCORE: <strong className="text-slate-100">{state.alignmentScorePercent}%</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
