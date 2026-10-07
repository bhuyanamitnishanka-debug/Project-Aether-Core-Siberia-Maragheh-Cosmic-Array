import React from 'react';
import { CHARACTER_PROFILES } from '../../data/comicScript';
import { Snowflake, Compass, Zap, Volume2 } from 'lucide-react';
import { sound } from '../../utils/audioEngine';

export const CharacterBadge: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Snowflake':
        return <Snowflake className="w-4 h-4 text-cyan-400" />;
      case 'Compass':
        return <Compass className="w-4 h-4 text-amber-400" />;
      case 'Zap':
        return <Zap className="w-4 h-4 text-yellow-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
      {CHARACTER_PROFILES.map((char) => (
        <div
          key={char.id}
          className="relative bg-slate-900/90 border border-slate-800 rounded-lg p-4 transition-all hover:border-slate-700 shadow-md flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded bg-gradient-to-br ${char.avatarColor} border border-slate-700`}>
                  {getIcon(char.icon)}
                </div>
                <div>
                  <h4 className="font-['Cinzel'] font-bold text-sm text-slate-100">{char.name}</h4>
                  <p className="text-[11px] text-slate-400 font-mono">{char.nationality}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  sound.speakText(char.quote);
                }}
                className="p-1.5 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 transition-colors cursor-pointer"
                title="Voice Quote"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-300 italic mb-2.5 font-serif border-l-2 border-slate-700 pl-2.5">
              "{char.quote}"
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-mono">{char.role.split(',')[0]}</span>
            <span className="text-cyan-400 font-mono text-[10px]">VERIFIED ID</span>
          </div>
        </div>
      ))}
    </div>
  );
};
