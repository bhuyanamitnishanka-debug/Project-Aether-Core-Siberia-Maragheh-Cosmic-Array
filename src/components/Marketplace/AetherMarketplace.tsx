import React, { useState, useEffect } from 'react';
import { aetherShop, MARKETPLACE_SKINS, UserProfileData, MarketplaceSkinItem } from '../../utils/shop_handler';
import { sound } from '../../utils/audioEngine';
import { Coins, ShieldCheck, Sparkles, Check, Lock, Award, Flame, Zap, ArrowRight } from 'lucide-react';

interface AetherMarketplaceProps {
  onEquipSkin?: (skinId: string) => void;
}

export const AetherMarketplace: React.FC<AetherMarketplaceProps> = ({ onEquipSkin }) => {
  const [profile, setProfile] = useState<UserProfileData>(aetherShop.getProfile());
  const [selectedSkin, setSelectedSkin] = useState<MarketplaceSkinItem>(MARKETPLACE_SKINS[0]);
  const [notification, setNotification] = useState<{ text: string; isError?: boolean } | null>(null);

  useEffect(() => {
    const unsubscribe = aetherShop.subscribe((updated) => {
      setProfile(updated);
    });
    return unsubscribe;
  }, []);

  const handleBuyOrEquip = (skin: MarketplaceSkinItem) => {
    const isOwned = profile.character_customization.unlocked_skins.includes(skin.id);
    const isActive = profile.character_customization.active_skin === skin.id;

    if (isActive) return;

    if (isOwned) {
      aetherShop.equipSkin(skin.id);
      sound.playFiberDataBurst();
      setNotification({ text: `✨ Equipped: ${skin.name}` });
      if (onEquipSkin) onEquipSkin(skin.id);
    } else {
      const result = aetherShop.executeSkinPurchase(skin.id, skin.cost);
      if (result.success) {
        sound.playActionStrike();
        setNotification({ text: `✓ ${result.message}` });
        if (onEquipSkin) onEquipSkin(skin.id);
      } else {
        sound.playCherenkovShockwave();
        setNotification({ text: `❌ ${result.message}`, isError: true });
      }
    }

    setTimeout(() => setNotification(null), 4000);
  };

  const handleClaimDailyAether = () => {
    aetherShop.addTokens(450);
    sound.playFiberDataBurst();
    setNotification({ text: '⚡ Claimed +450 Aether Tokens from Array Solar Surge!' });
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 sm:p-7 space-y-6 shadow-2xl">
      {/* Header and Token Balance Display */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-['Cinzel'] font-bold text-xl sm:text-2xl text-slate-100">
              AETHER VAULT & COSMETIC REGALIA
            </h2>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400">
              MARKETPLACE v2.4
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-2xl">
            Acquire and customize Catalyst armor skins for <strong className="text-amber-300">Arshama</strong>.
            Synchronized directly with local user state matrix (`AetherCore_User_Profile`).
          </p>
        </div>

        {/* Token Balance Counter */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-4 py-2 rounded-xl border border-amber-500/30 flex items-center gap-3 shadow-inner">
            <Coins className="w-5 h-5 text-amber-400 animate-pulse" />
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                AETHER TOKENS HELD
              </div>
              <div
                id="token-balance-count"
                className="font-['Cinzel'] font-bold text-xl text-amber-300 tabular-nums"
              >
                {profile.high_score_metrics.current_tokens_held.toLocaleString()}
              </div>
            </div>
          </div>

          <button
            onClick={handleClaimDailyAether}
            className="px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
            title="Claim daily solar array energy bonus"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>+450 Bonus</span>
          </button>
        </div>
      </div>

      {/* Floating Notification */}
      {notification && (
        <div
          className={`p-3 rounded-lg text-xs font-mono flex items-center justify-between transition-all ${
            notification.isError
              ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300'
              : 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
          }`}
        >
          <span>{notification.text}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-200 cursor-pointer ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Skin Catalog + Preview Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Skins List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>CATALYST REGALIA ARCHIVES ({MARKETPLACE_SKINS.length} SKINS)</span>
          </div>

          <div className="space-y-2.5">
            {MARKETPLACE_SKINS.map((skin) => {
              const isOwned = profile.character_customization.unlocked_skins.includes(skin.id);
              const isEquipped = profile.character_customization.active_skin === skin.id;
              const isSelected = selectedSkin.id === skin.id;

              return (
                <div
                  key={skin.id}
                  onClick={() => setSelectedSkin(skin)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-slate-800/80 border-cyan-400/80 shadow-lg ring-1 ring-cyan-500/30'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                      {skin.previewIcon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-['Cinzel'] font-bold text-sm text-slate-100">
                          {skin.name}
                        </span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${skin.badgeColor}`}>
                          {skin.rarity}
                        </span>
                        {isEquipped && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            EQUIPPED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 font-sans">
                        {skin.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="flex items-center justify-end gap-2 shrink-0">
                    {isEquipped ? (
                      <button
                        disabled
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1 cursor-default"
                      >
                        <Check className="w-3 h-3" />
                        <span>Active</span>
                      </button>
                    ) : isOwned ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyOrEquip(skin);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3 h-3 text-cyan-400" />
                        <span>Equip</span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyOrEquip(skin);
                        }}
                        className="buy-skin-btn px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono transition-all cursor-pointer flex items-center gap-1"
                        data-skin-id={skin.id}
                        data-cost={skin.cost}
                      >
                        <Coins className="w-3 h-3 text-slate-950" />
                        <span>{skin.cost} Tokens</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Skin Detail Showcase */}
        <div className="lg:col-span-5 bg-slate-950/80 rounded-xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                ACTIVE SHOWCASE INSPECTOR
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${selectedSkin.badgeColor}`}>
                {selectedSkin.rarity} TIER
              </span>
            </div>

            {/* Visual Halo Centerpiece */}
            <div className={`p-6 rounded-2xl bg-gradient-to-br ${selectedSkin.visualGlow} border border-slate-800 text-center relative overflow-hidden`}>
              <div className="text-5xl my-3 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                {selectedSkin.previewIcon}
              </div>
              <h3 className="font-['Cinzel'] font-bold text-lg text-slate-100">
                {selectedSkin.name}
              </h3>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                {selectedSkin.subtitle}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-sans leading-relaxed">
                {selectedSkin.description}
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1 font-mono text-[11px]">
                <div className="text-amber-400 font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>HISTORICAL & QUANTUM LORE:</span>
                </div>
                <p className="text-slate-400 font-sans text-xs">
                  {selectedSkin.lore}
                </p>
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="pt-2 border-t border-slate-800">
            {profile.character_customization.active_skin === selectedSkin.id ? (
              <div className="w-full py-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-center font-mono text-xs font-bold flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>CURRENTLY ACTIVE ON ARSHAMA</span>
              </div>
            ) : profile.character_customization.unlocked_skins.includes(selectedSkin.id) ? (
              <button
                onClick={() => handleBuyOrEquip(selectedSkin)}
                className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>EQUIP THIS REGALIA</span>
              </button>
            ) : (
              <button
                onClick={() => handleBuyOrEquip(selectedSkin)}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10"
              >
                <Coins className="w-4 h-4" />
                <span>UNLOCK FOR {selectedSkin.cost} AETHER TOKENS</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
