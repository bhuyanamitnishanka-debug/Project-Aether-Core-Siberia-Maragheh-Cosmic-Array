import React, { useState } from 'react';
import { BLUEPRINT_SECTIONS } from '../../data/blueprintData';
import { Cpu, Copy, Check, Terminal, Layers, Activity, BookOpen, Compass } from 'lucide-react';

export const EngineeringCodex: React.FC = () => {
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const copyStudioPrompt = () => {
    const promptText = `SYSTEM BLUEPRINT: PROJECT AETHER-CORE
TRANS-CONTINENTAL NEUTRINO-ASTRONOMICAL ARRAY (LAKE BAIKAL × MARAGHEH OBSERVATORY)

1. ASBADS TO BAGHDAD BATTERY MATRIX:
- Vertical-axis timber sails (Nashtifan archetype) driving direct-drive low-RPM axial PMAs (0-140V AC).
- 50,000 subterranean terracotta Baghdad Battery jars (1,250 parallel branches × 40 cells in series).
- Anode: Fe (iron rod, 99.8%); Cathode: Cu (electrolytic copper sleeve); Electrolyte: 12% acetic acid (CH3COOH).
- Step-up: 40 × 1.2V = 48.0V DC noiseless instrument bus. Chemical capacitor filter fc = 0.0042 Hz.

2. BASE-60 (SEXAGESIMAL) COMPUTATIONAL ENGINE:
- Positional arithmetic bypassing binary floating-point roundoff errors.
- 6-Token packet: [Token 0: Al-Muqabala (59)] + [Token 1: Epoch] + [Token 2: Tusi Azimuth Phi] + [Token 3: Tusi Zenith Theta] + [Token 4: Energy 10^15 eV] + [Token 5: Al-Jabr Checksum].
- Sum of all tokens = 0 mod 60. Tusi Couple linear motion: x(t) = 2r * cos(theta).

3. DARK ASTROLABE (CAMERA OBSCURA):
- Ibn al-Haytham pinhole camera mounted on Nasir al-Din al-Tusi stone mural quadrant.
- 22.4 µm volcanic obsidian aperture plate casting starlight onto 77K liquid-N2 scientific CMOS.

4. EARTH-SHIELD GEOMETRY:
- 6,371 km planetary crust rock column filters out atmospheric background muons by 10^12.`;

    navigator.clipboard.writeText(promptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 3000);
  };

  const filteredSections =
    selectedCategory === 'ALL'
      ? BLUEPRINT_SECTIONS
      : BLUEPRINT_SECTIONS.filter((s) => s.category === selectedCategory);

  return (
    <div className="space-y-8">
      {/* Blueprint Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-['Cinzel'] font-bold text-lg text-slate-100">
                TECHNICAL BLUEPRINT & ENGINEERING CODEX
              </span>
              <span className="font-mono text-xs text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded">
                DEEP-SPEC ARCHITECTURE
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-2xl leading-relaxed">
              Rigorous physical calculations, chemical equilibria, circuit topologies, and mathematical proofs for Project Aether-Core.
            </p>
          </div>

          <button
            onClick={copyStudioPrompt}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-purple-500/40 text-purple-300 font-mono text-xs rounded transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap self-start sm:self-auto"
            title="Copy System Prompt formatted for Google AI Studio"
          >
            {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-400" />}
            <span>{copiedPrompt ? 'System Specs Copied!' : 'Copy AI Studio Blueprint'}</span>
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800 text-xs font-mono">
          {['ALL', 'POWER_SYSTEMS', 'COMPUTATIONAL_ENGINE', 'OPTICAL_ARRAY', 'EARTH_SHIELD_TOPOLOGY'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Blueprint Sections */}
      <div className="space-y-6">
        {filteredSections.map((section) => (
          <article
            key={section.id}
            className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6 shadow-xl"
          >
            {/* Header */}
            <div className="border-b border-slate-800 pb-4">
              <div className="text-[11px] font-mono text-purple-400 uppercase tracking-widest mb-1">
                MODULE: {section.category.replace(/_/g, ' ')}
              </div>
              <h2 className="font-['Cinzel'] font-bold text-xl sm:text-2xl text-slate-100 mb-2">
                {section.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                {section.summary}
              </p>
            </div>

            {/* Specifications Matrix */}
            <div>
              <h3 className="font-['Cinzel'] font-bold text-sm text-slate-200 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>ENGINEERING SPECIFICATIONS</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                {section.specifications.map((spec, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between"
                  >
                    <span className="text-slate-400 text-[11px]">{spec.label}</span>
                    <span className="text-cyan-300 font-bold mt-0.5">{spec.value}</span>
                    {spec.note && <span className="text-slate-400 text-[10px] italic mt-0.5">{spec.note}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Circuit Topology Schematic if present */}
            {section.circuitTopology && (
              <div>
                <h3 className="font-['Cinzel'] font-bold text-sm text-slate-200 mb-2 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span>TOPOLOGY & CIRCUIT WIRING SCHEMATIC</span>
                </h3>
                <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-amber-300 overflow-x-auto leading-relaxed">
                  {section.circuitTopology}
                </pre>
              </div>
            )}

            {/* Mathematical Proofs and Formulas */}
            {section.mathematicalFormulas.length > 0 && (
              <div>
                <h3 className="font-['Cinzel'] font-bold text-sm text-slate-200 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>MATHEMATICAL DERIVATIONS & FORMULAS</span>
                </h3>
                <div className="space-y-3">
                  {section.mathematicalFormulas.map((form, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded bg-slate-950/70 border border-slate-800/80 space-y-1.5"
                    >
                      <div className="text-xs font-['Cinzel'] font-bold text-slate-200">
                        {form.name}
                      </div>
                      <div className="font-mono text-sm text-emerald-300 bg-slate-900/90 p-2 rounded border border-slate-800 overflow-x-auto">
                        {form.formula}
                      </div>
                      <p className="text-xs text-slate-400 font-sans leading-relaxed">
                        {form.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Historical Precedent */}
            <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-lg text-xs font-sans text-purple-200">
              <strong className="font-['Cinzel'] text-purple-300 mr-1.5">HISTORICAL PRECEDENT:</strong>
              {section.historicalPrecedent}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
