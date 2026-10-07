import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../../utils/audioEngine';
import { Play, Pause, RotateCcw, Volume2, Sparkles, Film, Clock, ChevronRight } from 'lucide-react';

interface StoryboardPhase {
  phase: number;
  timeRange: string;
  title: string;
  subtitle: string;
  durationSec: number;
  startSec: number;
  endSec: number;
  visual: string;
  audioSoundDesign: string;
  narratorVoiceover: string;
  textOnScreen: string;
  sceneTheme: 'cosmic-ice' | 'split-worlds' | 'arshama-crypt' | 'convergence-matrix';
}

const TRAILER_PHASES: StoryboardPhase[] = [
  {
    phase: 1,
    timeRange: '0:00 - 0:10',
    title: 'Phase 1: The Cosmic Call',
    subtitle: 'Blinding Cherenkov Flash Across the Northern Sky',
    durationSec: 10,
    startSec: 0,
    endSec: 10,
    visual:
      'Opening shot of a pitch-black starry sky. The screen violently shakes as a glowing beam of Cherenkov Neon Blue Light pierces from deep space right through the planet Earth.',
    audioSoundDesign:
      'A massive cosmic sonic boom echoing outward, followed by high-frequency subatomic chirp.',
    narratorVoiceover:
      '"The universe has spoken. But its deepest secrets do not travel via visible light... they ride on ghost particles."',
    textOnScreen: 'THE INVISIBLE UNIVERSE AWAKES.',
    sceneTheme: 'cosmic-ice',
  },
  {
    phase: 2,
    timeRange: '0:10 - 0:25',
    title: 'Phase 2: The Two Worlds',
    subtitle: 'Siberian Cryo-Drills & Ancient Iranian Windmills',
    durationSec: 15,
    startSec: 10,
    endSec: 25,
    visual:
      'Split screen acceleration: Left shows heavy automated thermal drills melting through 2.5 kilometers of ice in Lake Baikal with spherical quantum sensors flashing blue. Right shows colossal wooden clay windmills (Asbads) spinning at high speeds, driving humming current into endless subterranean rows of glowing clay Baghdad batteries in Maragheh.',
    audioSoundDesign:
      'The mechanized whirring of heavy drills transforming into the organic roaring sound of desert gale winds.',
    narratorVoiceover:
      '"To bridge the cosmic grid, modern quantum science must fuse with the timeless, noiseless purity of ancient elemental engineering."',
    textOnScreen: 'ELEMENTAL ENGINEERING · ZERO-GRID RECONSTRUCTION',
    sceneTheme: 'split-worlds',
  },
  {
    phase: 3,
    timeRange: '0:25 - 0:45',
    title: 'Phase 3: Enter Arshama',
    subtitle: 'The Zoroastrian Catalyst Awakes in the Obsidian Crypt',
    durationSec: 20,
    startSec: 25,
    endSec: 45,
    visual:
      'The camera plunges deep underground. Arshama (The Zoroastrian Catalyst Superhero) materializes in the center of an ancient obsidian fire altar crypt. Cuneiform characters covering his charcoal armor ignite into radiant gold. A massive Faravahar emblem explodes with energy as he strikes his cosmic staff into the floor. Rapid cuts of gameplay: wind turbine torque balancing, galvanic battery bank engagement, and vaporizing anti-matter shadows.',
    audioSoundDesign:
      'A chorus of ancient Persian chanting rises, blending seamlessly with heavy cyberpunk synth drops.',
    narratorVoiceover:
      '"Balance the elements. Decipher the cosmic math. Secure the eternal flame across the stars."',
    textOnScreen: 'CHANNEL THE ATAR FLAME.',
    sceneTheme: 'arshama-crypt',
  },
  {
    phase: 4,
    timeRange: '0:45 - 0:60',
    title: 'Phase 4: The Convergence Climax',
    subtitle: 'Trans-Central Asian Matrix Locks Onto Orion',
    durationSec: 15,
    startSec: 45,
    endSec: 60,
    visual:
      'The Earth is shown from space, wrapped inside a flawless glowing grid of geometric base-60 mathematical lines. The planetary matrix fires a brilliant beam out of the atmosphere, locking onto an ancient star coordinates map. Transitions to the title screen artwork.',
    audioSoundDesign:
      'A final dramatic orchestral crescendo hit, fading out into the clean, low hum of a stable electric pipeline bus.',
    narratorVoiceover:
      '"PROJECT AETHER-CORE. Experience the Zero-Grid Interactive Graphic Novel and Cosmic Array Simulator."',
    textOnScreen: 'PROJECT AETHER-CORE · AVAILABLE NOW',
    sceneTheme: 'convergence-matrix',
  },
];

export const TrailerStoryboard: React.FC = () => {
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSeconds, setPlaybackSeconds] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  const activePhase = TRAILER_PHASES[activePhaseIndex];

  // Storyboard playback loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setPlaybackSeconds((prev) => {
          const next = prev + 1;
          if (next >= 60) {
            setIsPlaying(false);
            return 0;
          }
          // Check phase transition
          const currentPhase = TRAILER_PHASES.findIndex(
            (p) => next >= p.startSec && next < p.endSec
          );
          if (currentPhase !== -1 && currentPhase !== activePhaseIndex) {
            setActivePhaseIndex(currentPhase);
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, activePhaseIndex]);

  const handlePlayToggle = () => {
    const next = !isPlaying;
    setIsPlaying(next);
    if (next) {
      sound.playFiberDataBurst();
      sound.speakText(activePhase.narratorVoiceover.replace(/"/g, ''));
    }
  };

  const handleSelectPhase = (index: number) => {
    setActivePhaseIndex(index);
    setPlaybackSeconds(TRAILER_PHASES[index].startSec);
    sound.playActionStrike();
    sound.speakText(TRAILER_PHASES[index].narratorVoiceover.replace(/"/g, ''));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setActivePhaseIndex(0);
    setPlaybackSeconds(0);
  };

  const handleReadVoiceover = () => {
    sound.speakText(activePhase.narratorVoiceover.replace(/"/g, ''));
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 sm:p-7 space-y-6 shadow-2xl">
      {/* Header and Storyboard Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Film className="w-5 h-5 text-cyan-400" />
            <h2 className="font-['Cinzel'] font-bold text-xl sm:text-2xl text-slate-100">
              PROMOTIONAL TRAILER STORYBOARD SCRIPT
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-3xl">
            Official 60-Second High-Stakes Cinematic Storyboard and Audio Voiceover Sequence.
            Score: Deep orchestral strings layered with futuristic synth sub-bass.
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
          <button
            onClick={handlePlayToggle}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isPlaying
                ? 'bg-amber-500 text-slate-950'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play Storyboard'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            title="Reset to 0:00"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="font-mono text-xs text-amber-300 px-2 tabular-nums font-bold">
            0:{playbackSeconds.toString().padStart(2, '0')} / 1:00
          </div>
        </div>
      </div>

      {/* 4-Phase Progress Timeline */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {TRAILER_PHASES.map((phase, idx) => (
          <button
            key={phase.phase}
            onClick={() => handleSelectPhase(idx)}
            className={`p-3 rounded-lg border text-left font-mono transition-all cursor-pointer ${
              activePhaseIndex === idx
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md ring-1 ring-cyan-500/40'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="font-bold text-amber-400">PHASE {phase.phase}</span>
              <span className="text-slate-400">{phase.timeRange}</span>
            </div>
            <div className="text-xs font-bold text-slate-200 truncate">
              {phase.title.split(': ')[1]}
            </div>
          </button>
        ))}
      </div>

      {/* Main Cinematic Showcase Frame */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#050a16] p-6 sm:p-8 space-y-6 shadow-inner">
        {/* On-Screen Text Graphic Banner */}
        <div className="text-center space-y-2 py-4">
          <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
            ● ON-SCREEN TEXT DISPLAY
          </span>
          <h1 className="font-['Cinzel'] font-black text-2xl sm:text-4xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-amber-300 to-rose-400 filter drop-shadow-[0_2px_10px_rgba(6,182,212,0.4)]">
            {activePhase.textOnScreen}
          </h1>
          <p className="font-mono text-xs text-slate-400">
            {activePhase.title} · {activePhase.subtitle}
          </p>
        </div>

        {/* Script Details Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {/* Visual Directions */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="text-cyan-400 font-bold flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Film className="w-3.5 h-3.5 text-cyan-400" />
              <span>VISUAL CINEMATOGRAPHY DIRECTIONS</span>
            </div>
            <p className="text-slate-300 font-sans leading-relaxed text-xs">
              {activePhase.visual}
            </p>
          </div>

          {/* Sound Design */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="text-purple-400 font-bold flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Volume2 className="w-3.5 h-3.5 text-purple-400" />
              <span>AUDIO SOUND DESIGN & SYNTH SCORE</span>
            </div>
            <p className="text-slate-300 font-sans leading-relaxed text-xs">
              {activePhase.audioSoundDesign}
            </p>
          </div>
        </div>

        {/* Narrator Voiceover Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-950 to-cyan-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-bold">
              NARRATOR VOICEOVER (DEEP, DRAMATIC TONE)
            </div>
            <blockquote className="text-sm font-['Cinzel'] font-bold text-amber-200 italic">
              {activePhase.narratorVoiceover}
            </blockquote>
          </div>

          <button
            onClick={handleReadVoiceover}
            className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 self-start sm:self-center"
            title="Read aloud using procedural speech synthesis"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Speak Line</span>
          </button>
        </div>
      </div>
    </div>
  );
};
