import React, { useState, useEffect, useRef } from 'react';
import { SexagesimalPacket } from '../../types';
import { createAetherCorePacket, toSexagesimalPositional } from '../../utils/sexagesimal';
import { Cpu, Send, CheckCircle2, AlertTriangle, ArrowRight, Activity, Share2 } from 'lucide-react';
import { sound } from '../../utils/audioEngine';

interface SexagesimalPacketProps {
  inputEnergyPeV?: number;
  inputZenithDeg?: number;
  inputAzimuthDeg?: number;
}

export const SexagesimalPacketEngine: React.FC<SexagesimalPacketProps> = ({
  inputEnergyPeV = 1.45,
  inputZenithDeg = 38.2,
  inputAzimuthDeg = 142.5,
}) => {
  const [packet, setPacket] = useState<SexagesimalPacket>(() =>
    createAetherCorePacket(inputAzimuthDeg, inputZenithDeg, inputEnergyPeV)
  );
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [transitProgress, setTransitProgress] = useState<number>(0);

  const tusiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const angleRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Re-encode packet when input parameters change
  useEffect(() => {
    const newPacket = createAetherCorePacket(inputAzimuthDeg, inputZenithDeg, inputEnergyPeV);
    setPacket(newPacket);
  }, [inputEnergyPeV, inputZenithDeg, inputAzimuthDeg]);

  const firePacketDownSilkRoad = () => {
    setIsTransmitting(true);
    setTransitProgress(0);
    sound.playFiberDataBurst();

    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      setTransitProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setIsTransmitting(false);
        sound.playGalvanicHum();
      }
    }, 40);
  };

  // Tusi Couple Canvas Animation Loop
  useEffect(() => {
    const canvas = tusiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;
      angleRef.current += 0.03;
      const theta = angleRef.current;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const R = 75; // Radius of large fixed circle
      const r = R / 2; // Radius of small rolling circle

      // Background
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, width, height);

      // Large Stationary Circle (Diameter 2R = 150)
      ctx.beginPath();
      ctx.arc(centerX, centerY, R, 0, Math.PI * 2);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Diameter Axis Line (Linear track line: x(t) = 2r*cos(theta))
      ctx.beginPath();
      ctx.moveTo(centerX - R, centerY);
      ctx.lineTo(centerX + R, centerY);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Center of Small Rolling Circle
      const smallCenterX = centerX + r * Math.cos(theta);
      const smallCenterY = centerY + r * Math.sin(theta);

      // Small Rolling Circle
      ctx.beginPath();
      ctx.arc(smallCenterX, smallCenterY, r, 0, Math.PI * 2);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Generating Point on Small Circle
      // x = r*cos(theta) + r*cos(-theta) = 2r*cos(theta)
      // y = r*sin(theta) + r*sin(-theta) = 0
      const pointX = smallCenterX + r * Math.cos(-theta);
      const pointY = smallCenterY + r * Math.sin(-theta);

      // Radial arm inside small circle
      ctx.beginPath();
      ctx.moveTo(smallCenterX, smallCenterY);
      ctx.lineTo(pointX, pointY);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Linear Tracing Dot (Pure rectilinear motion!)
      ctx.beginPath();
      ctx.arc(pointX, pointY, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#06b6d4';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Caption
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`x(t) = 2r · cos(θ) = ${(2 * r * Math.cos(theta)).toFixed(1)} px`, 10, 18);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`TUSI COUPLE RESOLVER [Maragheh 1247 AD]`, 10, height - 10);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 sm:p-7 space-y-6">
      {/* Title & Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-['Cinzel'] font-bold text-base text-slate-100">
              AL-KHWARIZMI SEXAGESIMAL (BASE-60) ENGINE
            </span>
            <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
              NON-BINARY COMPUTATION
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Bypassing floating-point truncation errors using 6-token base-60 geometric coordinate arrays.
          </p>
        </div>

        <button
          onClick={firePacketDownSilkRoad}
          disabled={isTransmitting}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-['Cinzel'] font-bold text-xs uppercase tracking-wider rounded shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isTransmitting ? 'Transiting Silk Road...' : 'Transmit Telemetry Packet'}</span>
        </button>
      </div>

      {/* The 6 Sexagesimal Tokens */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>6-TOKEN POSITIONAL TELEMETRY FRAME (AETHER-CORE-V1)</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>AL-JABR CONGRUENCE: Σ ≡ 0 (MOD 60)</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Token 0 */}
          <div className="p-3 rounded-lg bg-slate-950/80 border border-cyan-500/40 text-center">
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
              TOKEN 0: HEADER
            </div>
            <div className="text-2xl font-['Cinzel'] font-bold text-cyan-300 tabular-nums">
              {packet.header}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">Al-Muqabala Gate</div>
          </div>

          {/* Token 1 */}
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              TOKEN 1: TIME
            </div>
            <div className="text-2xl font-['Cinzel'] font-bold text-amber-300 tabular-nums">
              {packet.epochTime}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">Ghati Epoch</div>
          </div>

          {/* Token 2 */}
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              TOKEN 2: AZIMUTH Φ
            </div>
            <div className="text-2xl font-['Cinzel'] font-bold text-slate-100 tabular-nums">
              {packet.azimuth}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">Tusi Sine Sector</div>
          </div>

          {/* Token 3 */}
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              TOKEN 3: ZENITH Θ
            </div>
            <div className="text-2xl font-['Cinzel'] font-bold text-slate-100 tabular-nums">
              {packet.elevation}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">Earth-Core Arc</div>
          </div>

          {/* Token 4 */}
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              TOKEN 4: ENERGY
            </div>
            <div className="text-2xl font-['Cinzel'] font-bold text-purple-300 tabular-nums">
              {packet.energyThreshold}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">Log₁₀(PeV)</div>
          </div>

          {/* Token 5 */}
          <div className="p-3 rounded-lg bg-slate-950/80 border border-emerald-500/40 text-center">
            <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-1">
              TOKEN 5: CHECKSUM
            </div>
            <div className="text-2xl font-['Cinzel'] font-bold text-emerald-300 tabular-nums">
              {packet.checksum}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">Al-Jabr Balance</div>
          </div>
        </div>
      </div>

      {/* Tusi Couple Generator + Fiber Transit Corridor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Tusi Couple Visual Canvas (5 cols) */}
        <div className="lg:col-span-5 space-y-2">
          <div className="text-xs font-mono text-slate-300 flex items-center justify-between">
            <span>TUSI-COUPLE HARMONIC TRANSFORM</span>
            <span className="text-cyan-400">r = 37.5px · R = 75px</span>
          </div>
          <div className="rounded-lg overflow-hidden border border-slate-800 bg-[#060a14]">
            <canvas ref={tusiCanvasRef} width={420} height={200} className="w-full h-48 block" />
          </div>
        </div>

        {/* Central Asian Fiber Route Progress (7 cols) */}
        <div className="lg:col-span-7 space-y-3 bg-slate-950/70 p-4 rounded-lg border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-cyan-400 font-bold">TRANS-CENTRAL ASIAN OPTICAL CORRIDOR</span>
              <span className="text-amber-400 tabular-nums">5,210 KM · 16.2 MS</span>
            </div>

            {/* Fiber progress track */}
            <div className="relative w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 my-3">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-amber-400 to-emerald-400 transition-all duration-100 shadow-[0_0_12px_rgba(56,189,248,0.8)]"
                style={{ width: `${transitProgress}%` }}
              />
            </div>

            {/* Stations along Route */}
            <div className="grid grid-cols-4 text-center font-mono text-[10px] text-slate-400 mt-2">
              <div className="text-left">
                <span className="block text-cyan-300 font-bold">1. Lake Baikal</span>
                <span>(Siberia)</span>
              </div>
              <div>
                <span className="block text-slate-200">2. Astana</span>
                <span>(Kazakhstan)</span>
              </div>
              <div>
                <span className="block text-amber-300">3. Samarkand</span>
                <span>(Silk Road)</span>
              </div>
              <div className="text-right">
                <span className="block text-emerald-300 font-bold">4. Maragheh</span>
                <span>(Iran Hub)</span>
              </div>
            </div>
          </div>

          {/* Summation Check Box */}
          <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800 text-xs font-mono flex items-center justify-between">
            <span className="text-slate-400">
              Σ Tokens = {packet.header} + {packet.epochTime} + {packet.azimuth} + {packet.elevation} + {packet.energyThreshold} + {packet.checksum} ={' '}
              <strong className="text-slate-100">{packet.rawSum}</strong>
            </span>
            <span className="text-emerald-400 font-bold">
              {packet.rawSum} mod 60 = 0 ✓
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
