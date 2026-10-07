import React, { useState } from 'react';
import { COMIC_CHAPTERS } from '../../data/comicScript';
import { ComicPanel } from './ComicPanel';
import { CharacterBadge } from './CharacterBadge';
import { Sparkles, Play, Pause, ChevronRight, ChevronLeft, Volume2, ShieldAlert } from 'lucide-react';
import { sound } from '../../utils/audioEngine';

export const ComicViewer: React.FC = () => {
  const [selectedChapterId, setSelectedChapterId] = useState<string>('chapter-1');
  const [isReadingMode, setIsReadingMode] = useState<boolean>(false);
  const [activePanelIndex, setActivePanelIndex] = useState<number>(0);

  const currentChapter = COMIC_CHAPTERS.find((c) => c.id === selectedChapterId) || COMIC_CHAPTERS[0];

  const handleNextPanel = () => {
    if (activePanelIndex < currentChapter.panels.length - 1) {
      setActivePanelIndex((prev) => prev + 1);
      sound.playFiberDataBurst();
    }
  };

  const handlePrevPanel = () => {
    if (activePanelIndex > 0) {
      setActivePanelIndex((prev) => prev - 1);
      sound.playFiberDataBurst();
    }
  };

  return (
    <div className="space-y-8">
      {/* Epic Comic Cover Hero Banner */}
      <section className="relative rounded-xl overflow-hidden border-2 border-slate-700/80 bg-gradient-to-r from-[#0a1628] via-[#1a0f2b] to-[#261008] p-6 sm:p-10 shadow-2xl">
        {/* Halftone dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #38bdf8 1.5px, transparent 1.5px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div className="relative z-10 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="font-['Cinzel'] text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded">
              SILVER-AGE COSMIC CHRONICLES
            </span>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded">
              LAKE BAIKAL × MARAGHEH OBSERVATORY
            </span>
          </div>

          <h1 className="font-['Bangers'] text-4xl sm:text-6xl tracking-wider text-slate-100 uppercase mb-3 drop-shadow-[0_3px_8px_rgba(0,0,0,0.8)]">
            THE GHOSTS OF CHERENKOV
          </h1>

          <p className="font-sans text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed mb-6 font-medium">
            When a 1.45-PeV subatomic phantom particle pierces 2,500 meters of Siberian permafrost ice,
            Dr. Dmitry Volkov fires a Sexagesimal data packet down the ancient Silk Road to Dr. Aryana Sepehri in Iran.
            Powered exclusively by 1,000-year-old Asbads windmills and 50,000 subterranean Baghdad batteries, the cosmos awakens.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setIsReadingMode(!isReadingMode);
                sound.playCherenkovShockwave();
              }}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-['Cinzel'] font-bold text-xs uppercase tracking-wider rounded shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              {isReadingMode ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isReadingMode ? 'Exit Cinema View' : 'Cinematic Panel Mode'}</span>
            </button>

            <button
              onClick={() => {
                sound.playCherenkovShockwave();
              }}
              className="px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 text-cyan-400 font-mono text-xs rounded transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulate Cherenkov Pulse</span>
            </button>
          </div>
        </div>
      </section>

      {/* Character Dossiers */}
      <CharacterBadge />

      {/* Chapter Selection Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {COMIC_CHAPTERS.map((ch) => (
            <button
              key={ch.id}
              onClick={() => {
                setSelectedChapterId(ch.id);
                setActivePanelIndex(0);
                sound.playFiberDataBurst();
              }}
              className={`px-3 py-1.5 rounded text-xs font-semibold tracking-wide transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                selectedChapterId === ch.id
                  ? 'bg-amber-400 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span className="font-mono text-[11px]">CH {ch.chapterNumber}</span>
              <span>{ch.title}</span>
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 font-mono flex items-center gap-2 self-end sm:self-auto">
          <span>{currentChapter.settingSummary}</span>
        </div>
      </div>

      {/* Graphic Novel Reader: Cinematic Single-Panel View vs Grid View */}
      {isReadingMode ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-amber-400">
              PANEL {activePanelIndex + 1} OF {currentChapter.panels.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPanel}
                disabled={activePanelIndex === 0}
                className="p-1.5 rounded bg-slate-900 border border-slate-700 text-slate-300 disabled:opacity-40 hover:text-cyan-400 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextPanel}
                disabled={activePanelIndex === currentChapter.panels.length - 1}
                className="p-1.5 rounded bg-slate-900 border border-slate-700 text-slate-300 disabled:opacity-40 hover:text-cyan-400 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <ComicPanel panel={currentChapter.panels[activePanelIndex]} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentChapter.panels.map((panel) => (
            <ComicPanel key={panel.id} panel={panel} />
          ))}
        </div>
      )}
    </div>
  );
};
