import React, { useState, useEffect, useRef } from 'react';
import { Snowflake, Zap, Radio, Sparkles, Compass } from 'lucide-react';
import { sound } from '../../utils/audioEngine';

interface BaikalCherenkovProps {
  onNeutrinoTriggered?: (energyPeV: number, zenithDeg: number, azimuthDeg: number) => void;
}

export const BaikalCherenkovArray: React.FC<BaikalCherenkovProps> = ({ onNeutrinoTriggered }) => {
  const [energyPeV, setEnergyPeV] = useState<number>(1.45);
  const [zenithDeg, setZenithDeg] = useState<number>(38.2);
  const [azimuthDeg, setAzimuthDeg] = useState<number>(142.5);
  const [isDetonating, setIsDetonating] = useState<boolean>(false);
  const [detectedPhotons, setDetectedPhotons] = useState<number>(4820);
  const [lastEventId, setLastEventId] = useState<string>('BK-2026-X86');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const shockwaveRadiusRef = useRef<number>(0);

  const triggerNeutrino = () => {
    setIsDetonating(true);
    shockwaveRadiusRef.current = 10;
    sound.playCherenkovShockwave();

    const newPhotons = Math.floor(energyPeV * 3200 + Math.random() * 400);
    setDetectedPhotons(newPhotons);
    const id = `BK-${Date.now().toString().slice(-4)}-PEV`;
    setLastEventId(id);

    if (onNeutrinoTriggered) {
      onNeutrinoTriggered(energyPeV, zenithDeg, azimuthDeg);
    }

    setTimeout(() => {
      setIsDetonating(false);
    }, 1500);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;
      const width = canvas.width;
      const height = canvas.height;

      // Deep lake water gradient
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#040d1a');
      grad.addColorStop(0.3, '#031429');
      grad.addColorStop(1, '#020914');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Ice layer on top
      ctx.fillStyle = '#1e3a5f';
      ctx.fillRect(0, 0, width, 25);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 25);
      ctx.lineTo(width, 25);
      ctx.stroke();

      // DOM Strings (Vertical cables)
      const stringPositions = [70, 150, 230, 310, 390, 470, 550];
      ctx.strokeStyle = '#0369a1';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      stringPositions.forEach((xPos) => {
        ctx.beginPath();
        ctx.moveTo(xPos, 25);
        ctx.lineTo(xPos, height - 10);
        ctx.stroke();

        // Photomultiplier DOM modules along string
        for (let y = 50; y < height - 20; y += 38) {
          ctx.beginPath();
          ctx.arc(xPos, y, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#0f172a';
          ctx.fill();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Core scintillator dot
          ctx.beginPath();
          ctx.arc(xPos, y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = '#93c5fd';
          ctx.fill();
        }
      });
      ctx.setLineDash([]);

      // Cherenkov Detonation Cone & Shockwave
      if (shockwaveRadiusRef.current > 0 && shockwaveRadiusRef.current < 280) {
        shockwaveRadiusRef.current += 7;
        const rad = shockwaveRadiusRef.current;
        const originX = 310;
        const originY = 140;

        // Expanding Cherenkov blue cone
        ctx.save();
        ctx.translate(originX, originY);
        const angleRad = ((zenithDeg - 90) * Math.PI) / 180;
        ctx.rotate(angleRad);

        // Conical wavefront
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(rad, -rad * Math.tan(0.36)); // Cherenkov angle ~41.2 deg in water
        ctx.lineTo(rad, rad * Math.tan(0.36));
        ctx.closePath();

        const shockGrad = ctx.createRadialGradient(0, 0, 5, rad, 0, rad);
        shockGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        shockGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.7)');
        shockGrad.addColorStop(0.7, 'rgba(37, 99, 235, 0.35)');
        shockGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');
        ctx.fillStyle = shockGrad;
        ctx.fill();

        // Relativistic Muon Track Line (Superman Blue Laser)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-rad * 0.8, 0);
        ctx.lineTo(rad * 1.2, 0);
        ctx.stroke();

        ctx.restore();

        // Expanding circular shock rings
        ctx.beginPath();
        ctx.arc(originX, originY, rad * 0.85, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Legend overlay
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('BAIKAL-GVD ICEBORE MATRIX [2,480m DEPTH]', 12, 18);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`CHERENKOV CONE θc = 41.2° · n = 1.333`, 12, height - 12);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [zenithDeg, energyPeV]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 sm:p-7 space-y-6">
      {/* Title & Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-['Cinzel'] font-bold text-base text-slate-100">
              LAKE BAIKAL DEEP-ICE CHERENKOV DETECTOR
            </span>
            <span className="font-mono text-[10px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
              SIBERIAN POLAR NODE
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Capturing subatomic muon neutrino cascades in pristine 2.5-kilometer deep Siberian permafrost.
          </p>
        </div>

        <button
          onClick={triggerNeutrino}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-400 hover:to-cyan-300 text-slate-950 font-['Cinzel'] font-bold text-xs uppercase tracking-wider rounded shadow-lg transition-all flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Trigger Neutrino Flash</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4 bg-slate-950/70 p-4 rounded-lg border border-slate-800/80">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-blue-400" />
                Particle Energy (PeV = 10¹⁵ eV)
              </span>
              <span className="text-cyan-400 font-bold tabular-nums">{energyPeV} PeV</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="10.0"
              step="0.05"
              value={energyPeV}
              onChange={(e) => setEnergyPeV(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>0.1 PeV (Diffuse)</span>
              <span>1.45 PeV (Event X86)</span>
              <span>10.0 PeV (Point Source)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                Zenith Trajectory θ (Earth Core Angle)
              </span>
              <span className="text-amber-400 font-bold tabular-nums">{zenithDeg}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="1"
              value={zenithDeg}
              onChange={(e) => setZenithDeg(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>0° (Vertical Up)</span>
              <span>38.2° (Blazar TXS)</span>
              <span>90° (Horizontal)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-300">Azimuth Angle Φ</span>
              <span className="text-slate-200 font-bold tabular-nums">{azimuthDeg}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={azimuthDeg}
              onChange={(e) => setAzimuthDeg(parseFloat(e.target.value))}
              className="w-full accent-slate-400 cursor-pointer"
            />
          </div>

          {/* Technical Readout */}
          <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Cherenkov Angle (θc):</span>
              <span className="text-cyan-400">41.2° in H₂O</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Photomultiplier Hits:</span>
              <span className="text-emerald-400 tabular-nums">{detectedPhotons.toLocaleString()} Photons</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Event Signature ID:</span>
              <span className="text-amber-400 font-bold">{lastEventId}</span>
            </div>
          </div>
        </div>

        {/* Ice Borehole Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="rounded-lg overflow-hidden border border-slate-800 bg-[#040d1a] shadow-inner relative">
            <canvas ref={canvasRef} width={620} height={230} className="w-full h-56 block" />
            {isDetonating && (
              <div className="absolute inset-0 bg-cyan-400/10 pointer-events-none animate-pulse" />
            )}
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between text-xs font-mono text-slate-300">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Snowflake className="w-3.5 h-3.5" />
              <span>Siberian Permafrost Status: LOCKED</span>
            </span>
            <span className="text-slate-400">
              Water Transmission: <strong className="text-slate-200">λ = 400nm (98.4%)</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
