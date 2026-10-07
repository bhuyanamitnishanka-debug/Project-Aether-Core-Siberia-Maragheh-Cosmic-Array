import React, { useState } from 'react';
import { Header } from './components/Header';
import { ComicViewer } from './components/GraphicNovel/ComicViewer';
import { AsbadsBatteryGrid } from './components/Simulator/AsbadsBatteryGrid';
import { BaikalCherenkovArray } from './components/Simulator/BaikalCherenkovArray';
import { SexagesimalPacketEngine } from './components/Simulator/SexagesimalPacketEngine';
import { SexagesimalD3StreamVisualizer } from './components/Simulator/SexagesimalD3StreamVisualizer';
import { DarkAstrolabeTelescope } from './components/Simulator/DarkAstrolabeTelescope';
import { BalanceMissionGame } from './components/Mission/BalanceMissionGame';
import { EngineeringCodex } from './components/Blueprint/EngineeringCodex';
import { Compass, Sparkles, BookOpen, Activity, Cpu, Radio, Gauge } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'comic' | 'simulator' | 'mission' | 'blueprint'>('comic');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [simulatorSubView, setSimulatorSubView] = useState<'ALL' | 'D3_STREAM' | 'POWER_GRID' | 'BAIKAL_CORE'>('ALL');

  // Live simulation coupling parameters between Siberian borehole and Maragheh
  const [liveEnergyPeV, setLiveEnergyPeV] = useState<number>(1.45);
  const [liveZenithDeg, setLiveZenithDeg] = useState<number>(38.2);
  const [liveAzimuthDeg, setLiveAzimuthDeg] = useState<number>(142.5);

  const handleNeutrinoTriggered = (energy: number, zenith: number, azimuth: number) => {
    setLiveEnergyPeV(energy);
    setLiveZenithDeg(zenith);
    setLiveAzimuthDeg(azimuth);
  };

  return (
    <div className="min-h-screen bg-[#080b12] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'comic' && <ComicViewer />}

        {activeTab === 'simulator' && (
          <div className="space-y-8">
            {/* Simulator Intro Sub-Header */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-['Cinzel'] font-bold text-xl sm:text-2xl text-slate-100 mb-1">
                  TRANS-CONTINENTAL ARRAY SIMULATOR
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-3xl leading-relaxed">
                  Coupled interactive simulation of the Lake Baikal neutrino Cherenkov array, the 5,210-km Trans-Central Asian Base-60 fiber pipeline, the Asbads-to-Baghdad Battery power grid, and the Maragheh Dark Astrolabe.
                </p>
              </div>

              {/* Sub-view filter controls */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-lg border border-slate-800 text-xs font-mono">
                <button
                  onClick={() => setSimulatorSubView('ALL')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    simulatorSubView === 'ALL'
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All Subsystems
                </button>
                <button
                  onClick={() => setSimulatorSubView('D3_STREAM')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                    simulatorSubView === 'D3_STREAM'
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Activity className="w-3 h-3 text-cyan-400" />
                  <span>D3 Stream Monitor</span>
                </button>
                <button
                  onClick={() => setSimulatorSubView('POWER_GRID')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    simulatorSubView === 'POWER_GRID'
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Power Grid
                </button>
                <button
                  onClick={() => setSimulatorSubView('BAIKAL_CORE')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    simulatorSubView === 'BAIKAL_CORE'
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Baikal Core
                </button>
              </div>
            </div>

            {/* D3-based Real-time Fluctuation Stream Component (Highlighted) */}
            {(simulatorSubView === 'ALL' || simulatorSubView === 'D3_STREAM') && (
              <SexagesimalD3StreamVisualizer />
            )}

            {/* Subsystem 1: Asbads Windmills & 50,000 Baghdad Battery Matrix */}
            {(simulatorSubView === 'ALL' || simulatorSubView === 'POWER_GRID') && (
              <AsbadsBatteryGrid />
            )}

            {/* Subsystem 2: Siberian Baikal Deep-Ice Cherenkov Array */}
            {(simulatorSubView === 'ALL' || simulatorSubView === 'BAIKAL_CORE') && (
              <BaikalCherenkovArray onNeutrinoTriggered={handleNeutrinoTriggered} />
            )}

            {/* Subsystem 3: Base-60 Sexagesimal Packet Engine & Tusi-Couple */}
            {simulatorSubView === 'ALL' && (
              <SexagesimalPacketEngine
                inputEnergyPeV={liveEnergyPeV}
                inputZenithDeg={liveZenithDeg}
                inputAzimuthDeg={liveAzimuthDeg}
              />
            )}

            {/* Subsystem 4: Maragheh Dark Astrolabe Camera Obscura */}
            {simulatorSubView === 'ALL' && (
              <DarkAstrolabeTelescope neutrinoZenith={liveZenithDeg} />
            )}
          </div>
        )}

        {activeTab === 'mission' && <BalanceMissionGame />}

        {activeTab === 'blueprint' && <EngineeringCodex />}
      </main>

      {/* Editorial Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#060910] px-4 sm:px-8 py-6 text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-['Cinzel'] font-bold text-slate-300">
              PROJECT AETHER-CORE
            </span>
            <span>·</span>
            <span>Lake Baikal GVD × Maragheh Observatory</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Al-Khwarizmi (780–850 AD)</span>
            <span>·</span>
            <span>Nasir al-Din al-Tusi (1201–1274 AD)</span>
            <span>·</span>
            <span>Ibn al-Haytham (965–1040 AD)</span>
          </div>

          <div className="text-[11px] text-slate-400">
            Zero-Grid Galvanic Quantum Computing
          </div>
        </div>
      </footer>
    </div>
  );
}
