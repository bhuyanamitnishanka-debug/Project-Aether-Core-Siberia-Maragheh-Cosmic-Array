import React from 'react';
import { ComicPanelData } from '../../types';
import { Volume2, Radio, Zap, Globe2, Compass } from 'lucide-react';
import { sound } from '../../utils/audioEngine';

interface ComicPanelProps {
  panel: ComicPanelData;
  onSoundTrigger?: (sfx: string) => void;
}

export const ComicPanel: React.FC<ComicPanelProps> = ({ panel }) => {
  const handlePlayVoice = (text: string, lang: 'Russian' | 'Persian' | 'Old Persian' | undefined) => {
    let langCode: 'ru-RU' | 'fa-IR' | 'en-US' = 'en-US';
    if (lang === 'Russian') langCode = 'ru-RU';
    if (lang === 'Persian' || lang === 'Old Persian') langCode = 'fa-IR';
    sound.speakText(text, langCode);
  };

  const renderSceneArtwork = () => {
    switch (panel.artStyle) {
      case 'polar-ice':
        return (
          <div className="relative w-full h-56 sm:h-72 overflow-hidden bg-gradient-to-b from-[#051124] via-[#092244] to-[#040a17]">
            {/* Emerald Aurora Borealis */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-400 via-teal-600 to-transparent blur-xl pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-emerald-500/10 to-transparent" />
            
            {/* Stars & Ice Grid */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="iceCrack" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
                </linearGradient>
                <radialGradient id="domGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
                </radialGradient>
              </defs>
              {/* Ice surface line */}
              <line x1="0" y1="90" x2="1000" y2="90" stroke="#7dd3fc" strokeWidth="2.5" />
              {/* Drilling rig silhouette */}
              <polygon points="120,90 145,20 170,90" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
              <line x1="145" y1="20" x2="145" y2="90" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
              {/* Deep water DOM strings */}
              <line x1="145" y1="90" x2="145" y2="280" stroke="#0284c7" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="260" y1="90" x2="260" y2="280" stroke="#0284c7" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="380" y1="90" x2="380" y2="280" stroke="#0284c7" strokeWidth="1" strokeDasharray="3 3" />
              {/* DOM Modules */}
              {[120, 160, 200, 240].map((y, idx) => (
                <g key={idx}>
                  <circle cx="145" cy={y} r="8" fill="url(#domGlow)" stroke="#38bdf8" strokeWidth="1.5" />
                  <circle cx="145" cy={y} r="2.5" fill="#ffffff" />
                  <circle cx="260" cy={y + 15} r="8" fill="url(#domGlow)" stroke="#38bdf8" strokeWidth="1.5" />
                  <circle cx="380" cy={y - 10} r="8" fill="url(#domGlow)" stroke="#38bdf8" strokeWidth="1.5" />
                </g>
              ))}
              {/* Superman Blue Cherenkov shockwave */}
              {panel.soundEffect?.text.includes('КРАК') && (
                <g>
                  <circle cx="260" cy="175" r="45" fill="none" stroke="#38bdf8" strokeWidth="3" opacity="0.8" />
                  <circle cx="260" cy="175" r="85" fill="none" stroke="#60a5fa" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
                  <polygon points="260,175 220,110 300,110" fill="#38bdf8" fillOpacity="0.25" stroke="#93c5fd" strokeWidth="2" />
                  <line x1="260" y1="260" x2="260" y2="175" stroke="#ffffff" strokeWidth="3" />
                </g>
              )}
            </svg>

            {/* Frost overlay */}
            <div className="absolute top-2 right-3 font-mono text-[10px] text-cyan-300 bg-slate-950/80 px-2 py-0.5 rounded border border-cyan-800">
              DEPTH: 2,480m · TEMP: –38.4°C
            </div>
          </div>
        );

      case 'cosmic-fire':
        return (
          <div className="relative w-full h-56 sm:h-72 overflow-hidden bg-gradient-to-br from-[#120822] via-[#240c38] to-[#0d0417]">
            {/* Golden & Blue Energy Conjunction */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-blue-600/20 to-transparent blur-2xl" />
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="faravaharGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
                </radialGradient>
              </defs>
              {/* Geometric celestial rings */}
              <circle cx="50%" cy="50%" r="90" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.4" />
              <circle cx="50%" cy="50%" r="130" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 8" opacity="0.3" />
              {/* Faravahar Wing Stylization */}
              <path d="M 120 140 Q 250 80 380 140 Q 250 160 120 140 Z" fill="none" stroke="#f59e0b" strokeWidth="2.5" opacity="0.8" />
              <path d="M 160 135 L 140 100 M 200 130 L 190 90 M 300 130 L 310 90 M 340 135 L 360 100" stroke="#fbbf24" strokeWidth="2" />
              <circle cx="250" cy="140" r="22" fill="url(#faravaharGlow)" stroke="#f59e0b" strokeWidth="2" />
              {/* Tusi couple coordinate rays */}
              <line x1="250" y1="140" x2="80" y2="240" stroke="#38bdf8" strokeWidth="2.5" />
              <line x1="250" y1="140" x2="420" y2="240" stroke="#fbbf24" strokeWidth="2.5" />
              <circle cx="80" cy="240" r="6" fill="#38bdf8" />
              <circle cx="420" cy="240" r="6" fill="#f59e0b" />
            </svg>
            <div className="absolute top-2 right-3 font-mono text-[10px] text-amber-300 bg-slate-950/80 px-2 py-0.5 rounded border border-amber-800">
              ATAR FIRE · TUSI CONJUNCTION
            </div>
          </div>
        );

      case 'desert-citadel':
        return (
          <div className="relative w-full h-56 sm:h-72 overflow-hidden bg-gradient-to-b from-[#2d1208] via-[#451e0f] to-[#1a0a04]">
            {/* Desert sunset dusk */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-amber-500/25 via-red-900/30 to-transparent" />
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              {/* Maragheh hill contours */}
              <path d="M 0 220 Q 180 150 350 200 T 700 230 L 700 300 L 0 300 Z" fill="#260f08" stroke="#78350f" strokeWidth="2" />
              {/* Vertical Asbads Windmills */}
              {[120, 240, 360, 480].map((x, idx) => (
                <g key={idx}>
                  {/* Mud brick base tower */}
                  <rect x={x - 22} y="150" width="44" height="60" fill="#3d180a" stroke="#b45309" strokeWidth="1.5" />
                  {/* Vertical rotor spindle */}
                  <line x1={x} y1="90" x2={x} y2="150" stroke="#f59e0b" strokeWidth="3" />
                  {/* Vertical wooden vanes */}
                  <rect x={x - 16} y="95" width="12" height="48" fill="#78350f" stroke="#fbbf24" strokeWidth="1" />
                  <rect x={x + 4} y="95" width="12" height="48" fill="#92400e" stroke="#fbbf24" strokeWidth="1" />
                  {/* Kinetic wind whirl lines */}
                  <path d={`M ${x - 30} 110 Q ${x} 80 ${x + 30} 110`} fill="none" stroke="#fcd34d" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                </g>
              ))}
              {/* Underground copper cable conduit running into ground */}
              <path d="M 240 210 Q 250 260 280 290" fill="none" stroke="#f97316" strokeWidth="3" strokeDasharray="4 2" />
            </svg>
            <div className="absolute top-2 right-3 font-mono text-[10px] text-amber-400 bg-slate-950/80 px-2 py-0.5 rounded border border-amber-900">
              MARAGHEH CITADEL · ELEVATION: 1,680m
            </div>
          </div>
        );

      case 'subterranean-battery':
        return (
          <div className="relative w-full h-56 sm:h-72 overflow-hidden bg-gradient-to-b from-[#0a0f1d] via-[#06121f] to-[#02060d]">
            {/* Underground vault ambient glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-emerald-500/15 via-teal-900/20 to-transparent" />
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              {/* Stone catacomb arches */}
              <path d="M 40 280 Q 150 40 260 280" fill="none" stroke="#1e293b" strokeWidth="3" />
              <path d="M 260 280 Q 370 40 480 280" fill="none" stroke="#1e293b" strokeWidth="3" />
              {/* Terracotta Baghdad Battery jars array */}
              {[
                { x: 90, y: 190 }, { x: 140, y: 190 }, { x: 190, y: 190 }, { x: 240, y: 190 },
                { x: 115, y: 235 }, { x: 165, y: 235 }, { x: 215, y: 235 }, { x: 265, y: 235 },
                { x: 310, y: 190 }, { x: 360, y: 190 }, { x: 410, y: 190 },
                { x: 335, y: 235 }, { x: 385, y: 235 }, { x: 435, y: 235 }
              ].map((pos, idx) => (
                <g key={idx}>
                  {/* Terracotta jar body */}
                  <ellipse cx={pos.x} cy={pos.y + 12} rx="14" ry="18" fill="#78350f" stroke="#b45309" strokeWidth="1.5" />
                  {/* Copper sleeve */}
                  <rect x={pos.x - 7} y={pos.y} width="14" height="20" fill="#ea580c" opacity="0.8" />
                  {/* Iron rod anode */}
                  <line x1={pos.x} y1={pos.y - 6} x2={pos.x} y2={pos.y + 16} stroke="#e2e8f0" strokeWidth="2.5" />
                  {/* Soft galvanic glow */}
                  <circle cx={pos.x} cy={pos.y - 2} r="4" fill="#34d399" opacity="0.8" />
                  {/* Series interconnect wire */}
                  <line x1={pos.x} y1={pos.y - 6} x2={pos.x + 25} y2={pos.y + 12} stroke="#38bdf8" strokeWidth="1" opacity="0.6" />
                </g>
              ))}
              {/* Heavy copper busbar */}
              <line x1="50" y1="270" x2="480" y2="270" stroke="#f97316" strokeWidth="4" />
              <line x1="50" y1="278" x2="480" y2="278" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 3" />
            </svg>
            <div className="absolute top-2 right-3 font-mono text-[10px] text-emerald-300 bg-slate-950/80 px-2 py-0.5 rounded border border-emerald-800">
              GALVANIC MATRIX: 50,000 CELLS · 48.0V DC
            </div>
          </div>
        );

      case 'astrolabe-optics':
        return (
          <div className="relative w-full h-56 sm:h-72 overflow-hidden bg-gradient-to-b from-[#0e071e] via-[#160a2b] to-[#070310]">
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              {/* Tusi Mural Quadrant Arc */}
              <path d="M 60 260 A 240 240 0 0 1 300 20" fill="none" stroke="#b45309" strokeWidth="6" />
              {/* Degrees markings */}
              {[0, 15, 30, 45, 60, 75, 90].map((deg, idx) => {
                const rad = (deg * Math.PI) / 180;
                const x1 = 60 + 240 * Math.sin(rad);
                const y1 = 260 - 240 * Math.cos(rad);
                const x2 = 60 + 225 * Math.sin(rad);
                const y2 = 260 - 225 * Math.cos(rad);
                return (
                  <line key={idx} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fde047" strokeWidth="2" />
                );
              })}
              {/* Obsidian Camera Obscura Chamber */}
              <rect x="230" y="80" width="160" height="120" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
              {/* Micron Obsidian Pinhole Aperture */}
              <circle cx="230" cy="140" r="5" fill="#000000" stroke="#f59e0b" strokeWidth="2" />
              {/* Starlight Ray */}
              <line x1="80" y1="40" x2="230" y2="140" stroke="#fef08a" strokeWidth="2" />
              {/* Cryo CMOS Sensor at 77K */}
              <rect x="370" y="110" width="12" height="60" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
              {/* Airy Disk projection on sensor */}
              <line x1="230" y1="140" x2="370" y2="135" stroke="#fef08a" strokeWidth="1.5" strokeDasharray="3 2" />
              <line x1="230" y1="140" x2="370" y2="145" stroke="#fef08a" strokeWidth="1.5" strokeDasharray="3 2" />
              <ellipse cx="370" cy="140" rx="3" ry="10" fill="#38bdf8" opacity="0.7" />
            </svg>
            <div className="absolute top-2 right-3 font-mono text-[10px] text-cyan-300 bg-slate-950/80 px-2 py-0.5 rounded border border-cyan-800">
              OBSIDIAN PINHOLE: 22.4µm · CMOS: 77.2 K
            </div>
          </div>
        );

      case 'mineral-vein':
        return (
          <div className="relative w-full h-56 sm:h-72 overflow-hidden bg-gradient-to-r from-[#030914] via-[#120718] to-[#1f0d04]">
            {/* Split Tectonic Matrix */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="silverVein" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.3" />
                </linearGradient>
                <linearGradient id="goldBrine" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#d97706" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#78350f" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              {/* Divider Line */}
              <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
              
              {/* Left Side: Siberian Altay Mountains + Silver Quantum Veins */}
              <polygon points="20,180 80,60 140,140 190,80 240,240 0,240" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
              <path d="M 40 220 Q 90 160 110 190 T 180 120 T 230 180" fill="none" stroke="url(#silverVein)" strokeWidth="4" />
              <circle cx="110" cy="190" r="5" fill="#e2e8f0" />
              <circle cx="180" cy="120" r="6" fill="#38bdf8" />
              
              {/* Right Side: Dasht-e Kavir Salt Flats + Primordial Gold Brine */}
              <polygon points="260,240 320,160 400,200 480,140 540,240" fill="#2d1208" stroke="#f59e0b" strokeWidth="1" />
              <path d="M 280 230 Q 340 180 390 220 T 460 170 T 520 210" fill="none" stroke="url(#goldBrine)" strokeWidth="4" />
              <circle cx="390" cy="220" r="5" fill="#fde047" />
              <circle cx="460" cy="170" r="6" fill="#f59e0b" />
            </svg>
            <div className="absolute top-2 left-3 font-mono text-[10px] text-cyan-300 bg-slate-950/80 px-2 py-0.5 rounded border border-cyan-800">
              ALTAY: SILVER QUANTUM VEIN
            </div>
            <div className="absolute top-2 right-3 font-mono text-[10px] text-amber-300 bg-slate-950/80 px-2 py-0.5 rounded border border-amber-800">
              KAVIR: PRIMORDIAL BRINE MATRIX
            </div>
          </div>
        );

      case 'outpost-drilling':
        return (
          <div className="relative w-full h-56 sm:h-72 overflow-hidden bg-gradient-to-b from-[#0a101d] via-[#140c1c] to-[#1c0a06]">
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              {/* Heavy Thermal Claws / Lasers */}
              <line x1="80" y1="20" x2="160" y2="150" stroke="#f97316" strokeWidth="5" />
              <line x1="160" y1="150" x2="160" y2="240" stroke="#ef4444" strokeWidth="4" strokeDasharray="4 2" />
              <circle cx="160" cy="150" r="12" fill="#ea580c" opacity="0.8" />
              {/* Terracotta Vats array */}
              {[260, 340, 420].map((x, idx) => (
                <g key={idx}>
                  <rect x={x - 22} y="140" width="44" height="70" rx="6" fill="#78350f" stroke="#b45309" strokeWidth="2" />
                  <line x1={x - 22} y1="165" x2={x + 22} y2="165" stroke="#f59e0b" strokeWidth="1.5" />
                  <path d={`M ${x - 30} 120 Q ${x} 90 ${x + 30} 120`} fill="none" stroke="#f97316" strokeWidth="2" />
                </g>
              ))}
              {/* White plasma loop across conduits */}
              <path d="M 160 210 Q 280 180 480 200" fill="none" stroke="#ffffff" strokeWidth="3" />
              <path d="M 160 210 Q 280 180 480 200" fill="none" stroke="#38bdf8" strokeWidth="6" opacity="0.4" />
            </svg>
            <div className="absolute top-2 right-3 font-mono text-[10px] text-amber-300 bg-slate-950/80 px-2 py-0.5 rounded border border-amber-800">
              THERMAL EXTRACTION CLAWS · BRINE PIPELINE
            </div>
          </div>
        );

      case 'planetary-mesh':
        return (
          <div className="relative w-full h-56 sm:h-72 overflow-hidden bg-gradient-to-b from-[#02050f] via-[#051124] to-[#010308]">
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              {/* Earth Globe Sphere */}
              <circle cx="50%" cy="50%" r="85" fill="#0b1b36" stroke="#38bdf8" strokeWidth="2" />
              {/* Continental silhouettes */}
              <path d="M 230 110 Q 260 90 280 120 Q 250 150 220 130 Z" fill="#1e3a5f" />
              <path d="M 250 140 Q 290 150 280 180 Q 240 190 250 140 Z" fill="#1e3a5f" />
              
              {/* Global Macro-scale Tusi Couple Mesh Rings */}
              <circle cx="50%" cy="50%" r="105" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.7" />
              <circle cx="50%" cy="50%" r="130" fill="none" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="4 6" opacity="0.6" />
              <circle cx="50%" cy="50%" r="155" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="8 6" opacity="0.5" />
              
              {/* Trans-Universal Cosmic Beam from Baikal through Maragheh into Deep Cosmos */}
              <line x1="240" y1="210" x2="260" y2="120" stroke="#38bdf8" strokeWidth="3" />
              <line x1="260" y1="120" x2="440" y2="20" stroke="#ffffff" strokeWidth="4" />
              <line x1="260" y1="120" x2="440" y2="20" stroke="#fbbf24" strokeWidth="8" opacity="0.4" />
              <circle cx="260" cy="120" r="8" fill="#ffffff" stroke="#f59e0b" strokeWidth="2" />
            </svg>
            <div className="absolute top-2 right-3 font-mono text-[10px] text-amber-400 bg-slate-950/80 px-2 py-0.5 rounded border border-amber-800">
              GLOBAL MACRO-TUSI MESH · PLANETARY PULSE
            </div>
          </div>
        );

      case 'abyssal-ocean':
        return (
          <div className="relative w-full h-56 sm:h-72 overflow-hidden bg-gradient-to-b from-[#020914] via-[#011429] to-[#01060f]">
            {/* 11,000m Oceanic Abyss */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              {/* Deep sea trench seabed floor */}
              <path d="M 0 240 Q 180 200 360 260 T 720 220 L 720 360 L 0 360 Z" fill="#030b17" stroke="#0284c7" strokeWidth="2" />
              {/* Mariana Research Outpost Dome */}
              <ellipse cx="260" cy="220" rx="45" ry="25" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
              <line x1="260" y1="195" x2="260" y2="160" stroke="#38bdf8" strokeWidth="2" />
              <circle cx="260" cy="160" r="4" fill="#38bdf8" />
              {/* Deep Water Cherenkov flash in seawater */}
              <circle cx="380" cy="140" r="50" fill="none" stroke="#38bdf8" strokeWidth="3" opacity="0.7" />
              <polygon points="380,140 330,80 430,80" fill="#38bdf8" fillOpacity="0.2" stroke="#60a5fa" strokeWidth="2" />
              {/* Bioluminescent thermal vent plumes */}
              <path d="M 120 250 Q 130 180 140 120" stroke="#06b6d4" strokeWidth="3" fill="none" opacity="0.6" strokeDasharray="4 2" />
              <path d="M 490 240 Q 510 170 520 110" stroke="#3b82f6" strokeWidth="3" fill="none" opacity="0.6" strokeDasharray="4 2" />
            </svg>
            <div className="absolute top-2 right-3 font-mono text-[10px] text-cyan-300 bg-slate-950/80 px-2 py-0.5 rounded border border-cyan-800">
              MARIANA TRENCH NODE · DEPTH: 11,000m · 110 MPa
            </div>
          </div>
        );

      case 'ancient-crypt':
        return (
          <div className="relative w-full h-56 sm:h-72 overflow-hidden bg-gradient-to-b from-[#180a04] via-[#240e06] to-[#0d0502]">
            {/* Sasanian Chahar-Taq Crypt */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              {/* Obsidian Stone Hall Pillars */}
              <rect x="60" y="40" width="30" height="240" fill="#1c0f09" stroke="#78350f" strokeWidth="2" />
              <rect x="450" y="40" width="30" height="240" fill="#1c0f09" stroke="#78350f" strokeWidth="2" />
              <path d="M 60 80 Q 270 30 480 80" fill="none" stroke="#b45309" strokeWidth="3" />
              {/* Stone Chahar-Taq Fire Altar */}
              <polygon points="210,240 330,240 310,160 230,160" fill="#2d150b" stroke="#f59e0b" strokeWidth="2" />
              {/* Ancient Copper Bands linked into ground */}
              <line x1="230" y1="180" x2="160" y2="260" stroke="#f97316" strokeWidth="4" />
              <line x1="310" y1="180" x2="380" y2="260" stroke="#f97316" strokeWidth="4" />
              {/* Blazing Eternal Atar Flame */}
              <path d="M 270 160 Q 250 110 270 80 Q 290 110 270 160 Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
              <circle cx="270" cy="115" r="12" fill="#ffffff" opacity="0.9" />
              {/* Radiant Faravahar geometric aura */}
              <circle cx="270" cy="115" r="45" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
            </svg>
            <div className="absolute top-2 right-3 font-mono text-[10px] text-amber-400 bg-slate-950/80 px-2 py-0.5 rounded border border-amber-800">
              TAKHT-E SOLEYMAN CRYPT · SASANIAN CHAHAR-TAQ
            </div>
          </div>
        );

      case 'interstellar-fire':
        return (
          <div className="relative w-full h-56 sm:h-72 overflow-hidden bg-gradient-to-br from-[#060312] via-[#150729] to-[#04010a]">
            {/* Deep Space Orion Sector */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              {/* Distant stars */}
              {[[50, 40], [120, 80], [210, 30], [380, 50], [480, 90], [550, 40], [90, 180], [450, 200]].map(([x, y], idx) => (
                <circle key={idx} cx={x} cy={y} r="1.5" fill="#ffffff" />
              ))}
              {/* Cosmic Macro Tusi Couple Altar in Deep Space */}
              <circle cx="340" cy="140" r="75" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 4" />
              <circle cx="340" cy="140" r="37.5" fill="none" stroke="#38bdf8" strokeWidth="2" />
              <line x1="265" y1="140" x2="415" y2="140" stroke="#ffffff" strokeWidth="2.5" />
              {/* Pure Atar White Plasma Cosmic Beam */}
              <line x1="80" y1="260" x2="340" y2="140" stroke="#38bdf8" strokeWidth="4" />
              <line x1="340" y1="140" x2="560" y2="40" stroke="#ffffff" strokeWidth="5" />
              <line x1="340" y1="140" x2="560" y2="40" stroke="#fbbf24" strokeWidth="10" opacity="0.4" />
              {/* Faravahar Golden Halo */}
              <circle cx="340" cy="140" r="16" fill="#ffffff" stroke="#f59e0b" strokeWidth="3" />
            </svg>
            <div className="absolute top-2 right-3 font-mono text-[10px] text-yellow-300 bg-slate-950/80 px-2 py-0.5 rounded border border-yellow-800">
              ORION INTERSTELLAR ALTAR · ENDLESS LIGHT (ASHA)
            </div>
          </div>
        );
    }
  };

  return (
    <article className="relative bg-[#0d131f] border-2 sm:border-[3px] border-slate-700/80 rounded-lg overflow-hidden shadow-2xl transition-all duration-300 hover:border-slate-500/80 group">
      {/* Top Banner: Panel Number & Location Ribbon */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-950/90 border-b border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="font-['Cinzel'] font-bold text-amber-400">
            PANEL {panel.panelNumber}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300 flex items-center gap-1">
            <Globe2 className="w-3 h-3 text-cyan-400" />
            {panel.location}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (panel.soundEffect) {
                if (panel.soundEffect.text.includes('КРАК')) sound.playCherenkovShockwave();
                else if (panel.soundEffect.text.includes('غُرررررش')) sound.playAsbadRotorSpin();
                else if (panel.soundEffect.text.includes('زززز')) sound.playGalvanicHum();
                else sound.playFiberDataBurst();
              }
            }}
            className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Radio className="w-3 h-3" />
            <span>SFX Trigger</span>
          </button>
        </div>
      </div>

      {/* Visual Canvas Scene */}
      <div className="relative">
        {renderSceneArtwork()}

        {/* Comic Sound Effect Stamp Overlay */}
        {panel.soundEffect && (
          <div
            onClick={() => {
              if (panel.soundEffect?.text.includes('КРАК')) sound.playCherenkovShockwave();
              else sound.playActionStrike();
            }}
            className="absolute top-4 left-4 z-20 cursor-pointer transform -rotate-6 hover:scale-110 transition-transform"
            title="Click for Sound Effect"
          >
            <div className="bg-slate-950/90 border-2 border-amber-400 px-3 py-1 rounded shadow-lg">
              <span className={`font-['Bangers'] text-2xl sm:text-3xl tracking-widest ${panel.soundEffect.color} drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]`}>
                {panel.soundEffect.text}
              </span>
              {panel.soundEffect.subtext && (
                <div className="text-[10px] font-mono text-slate-300 uppercase tracking-wider text-center">
                  {panel.soundEffect.subtext}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Narrative Caption Box (Classic comic yellow rectangular box) */}
        {panel.caption && (
          <div className="absolute bottom-2 inset-x-2 sm:inset-x-4 z-20">
            <div className="bg-amber-300/95 text-slate-950 border border-amber-400 px-3 py-1.5 rounded-sm shadow-md font-sans text-xs sm:text-sm font-semibold tracking-wide">
              <span className="font-['Cinzel'] font-black mr-1 text-[11px] uppercase tracking-wider text-amber-900">
                CHRONICLE:
              </span>
              {panel.caption}
            </div>
          </div>
        )}
      </div>

      {/* Comic Dialogue Strip & Character Exchanges */}
      <div className="p-4 bg-slate-900/90 border-t border-slate-800 space-y-3">
        {panel.dialogue.map((dlg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border transition-all ${
              dlg.character === 'VOLKOV'
                ? 'bg-blue-950/30 border-cyan-800/60'
                : dlg.character === 'ARYANA'
                ? 'bg-amber-950/30 border-amber-800/60'
                : dlg.character === 'ARSHAMA'
                ? 'bg-yellow-950/30 border-yellow-700/60'
                : 'bg-slate-950/40 border-slate-800'
            }`}
          >
            {/* Header: Character name, language tag, voice playback button */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={`font-['Cinzel'] text-xs font-bold tracking-wider ${
                    dlg.character === 'VOLKOV'
                      ? 'text-cyan-400'
                      : dlg.character === 'ARYANA'
                      ? 'text-amber-400'
                      : 'text-yellow-400'
                  }`}
                >
                  {dlg.character === 'VOLKOV' ? 'DR. DMITRY VOLKOV' : dlg.character === 'ARYANA' ? 'DR. ARYANA SEPEHRI' : 'ARSHAMA (GUARDIAN)'}
                </span>
                {dlg.nativeLanguage && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                    {dlg.nativeLanguage}
                  </span>
                )}
              </div>
              <button
                onClick={() => handlePlayVoice(dlg.nativeText || dlg.englishText, dlg.nativeLanguage)}
                className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-slate-800"
                title="Listen to Voice Translation"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Voice</span>
              </button>
            </div>

            {/* Native language callout if provided (Cyrillic or Persian script) */}
            {dlg.nativeText && (
              <p
                className={`text-sm mb-1.5 font-medium ${
                  dlg.nativeLanguage === 'Persian' || dlg.nativeLanguage === 'Old Persian'
                    ? 'font-serif text-right text-amber-200/90 text-base leading-relaxed'
                    : 'font-mono text-cyan-200/90'
                }`}
                dir={dlg.nativeLanguage === 'Persian' || dlg.nativeLanguage === 'Old Persian' ? 'rtl' : 'ltr'}
              >
                "{dlg.nativeText}"
              </p>
            )}

            {/* English Comic Translation */}
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
              <span className="text-slate-400 text-xs italic mr-1">[{dlg.tone}]</span>
              {dlg.englishText}
            </p>
          </div>
        ))}

        {/* Technical Callout HUD box */}
        {panel.technicalCallout && (
          <div className="mt-3 p-2.5 rounded bg-slate-950/70 border border-slate-800 text-xs font-mono">
            <div className="flex items-center justify-between text-cyan-400 font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <Compass className="w-3 h-3 text-cyan-400" />
                {panel.technicalCallout.title}
              </span>
              {panel.technicalCallout.metric && (
                <span className="text-amber-400 text-[11px]">{panel.technicalCallout.metric}</span>
              )}
            </div>
            {panel.technicalCallout.russian && (
              <div className="text-[11px] text-slate-400 mb-0.5">
                RU: {panel.technicalCallout.russian}
              </div>
            )}
            {panel.technicalCallout.persian && (
              <div className="text-[11px] text-slate-400 mb-0.5" dir="rtl">
                FA: {panel.technicalCallout.persian}
              </div>
            )}
            <div className="text-[11px] text-slate-400">
              {panel.technicalCallout.details}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
