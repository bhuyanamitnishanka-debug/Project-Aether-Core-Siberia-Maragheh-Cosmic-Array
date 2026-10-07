import React from 'react';
import { Volume2, VolumeX, Sparkles, BookOpen, Activity, Compass, Cpu } from 'lucide-react';
import { sound } from '../utils/audioEngine';

interface HeaderProps {
  activeTab: 'comic' | 'simulator' | 'mission' | 'blueprint';
  setActiveTab: (tab: 'comic' | 'simulator' | 'mission' | 'blueprint') => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isMuted,
  setIsMuted,
}) => {
  const toggleAudio = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMute(next);
    if (!next) {
      sound.playFiberDataBurst();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#080b12]/95 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Zone 1: Single text element wordmark (Display face: Syne/Cinzel) */}
        <button
          onClick={() => setActiveTab('comic')}
          className="text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded"
        >
          <span className="font-['Cinzel'] text-lg sm:text-xl font-bold tracking-wider text-slate-100 group-hover:text-cyan-400 transition-colors">
            PROJECT AETHER-CORE
          </span>
        </button>

        {/* Zone 2: 4 nav links with clean single-line labels */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('comic')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold tracking-wide rounded-md transition-all whitespace-nowrap ${
              activeTab === 'comic'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Graphic Novel</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold tracking-wide rounded-md transition-all whitespace-nowrap ${
              activeTab === 'simulator'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Array Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('mission')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold tracking-wide rounded-md transition-all whitespace-nowrap ${
              activeTab === 'mission'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Mission Challenge</span>
          </button>

          <button
            onClick={() => setActiveTab('blueprint')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold tracking-wide rounded-md transition-all whitespace-nowrap ${
              activeTab === 'blueprint'
                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-sm shadow-purple-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Technical Blueprint</span>
          </button>
        </nav>

        {/* Zone 3: Primary action + Audio controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleAudio}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-medium rounded-md border border-slate-700 bg-slate-900/80 text-slate-300 hover:text-cyan-400 hover:border-slate-600 transition-colors cursor-pointer"
            title="Toggle procedural audio soundscapes & speech"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline text-[11px]">Audio Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline text-[11px] text-cyan-400">Audio Active</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('mission');
              sound.playCherenkovShockwave();
            }}
            className="px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 rounded-md shadow-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Engage Array</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="flex md:hidden items-center justify-between gap-1 pt-2.5 mt-2 border-t border-slate-800/60 overflow-x-auto text-[11px]">
        <button
          onClick={() => setActiveTab('comic')}
          className={`px-2.5 py-1 rounded font-medium ${activeTab === 'comic' ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400'}`}
        >
          Graphic Novel
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-2.5 py-1 rounded font-medium ${activeTab === 'simulator' ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-400'}`}
        >
          Simulator
        </button>
        <button
          onClick={() => setActiveTab('mission')}
          className={`px-2.5 py-1 rounded font-medium ${activeTab === 'mission' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400'}`}
        >
          Mission
        </button>
        <button
          onClick={() => setActiveTab('blueprint')}
          className={`px-2.5 py-1 rounded font-medium ${activeTab === 'blueprint' ? 'text-purple-400 bg-purple-500/10' : 'text-slate-400'}`}
        >
          Blueprint
        </button>
      </div>
    </header>
  );
};
