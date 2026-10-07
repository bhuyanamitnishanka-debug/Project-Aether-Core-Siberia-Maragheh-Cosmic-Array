/**
 * Project Aether-Core: Microtransaction & Shop Event Handler
 * Manages item acquisitions, token balances, and local database storage sync.
 * Directly fulfills Section 1 specifications (AetherMarketplaceManager).
 */

export interface UserProfileData {
  user_id: string;
  high_score_metrics: {
    current_tokens_held: number;
    missions_completed?: number;
    highest_coherence_pct?: number;
  };
  character_customization: {
    active_skin: string;
    unlocked_skins: string[];
  };
}

export interface MarketplaceSkinItem {
  id: string;
  name: string;
  subtitle: string;
  cost: number;
  description: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'COSMIC';
  badgeColor: string;
  visualGlow: string;
  previewIcon: string;
  lore: string;
}

export const MARKETPLACE_SKINS: MarketplaceSkinItem[] = [
  {
    id: 'VANILLA_CUNEIFORM',
    name: 'Vanilla Cuneiform Armor',
    subtitle: 'Arshama Standard Catalyst Regalia',
    cost: 0,
    description: 'Etched obsidian plates and pristine cuneiform conduits that light up upon channeling Atar flame.',
    rarity: 'COMMON',
    badgeColor: 'border-slate-500 text-slate-300 bg-slate-800/40',
    visualGlow: 'from-amber-500/20 to-orange-500/20',
    previewIcon: '🛡️',
    lore: 'Forged 2,500 years ago beneath the Zagros peaks, inscribed with ancient formulas for cosmic balance (Asha).'
  },
  {
    id: 'CHERENKOV_BLUE_CRYSTAL',
    name: 'Cherenkov Cryo Shroud',
    subtitle: 'Baikal Sub-Zero 2.2 PeV Quantum Mantle',
    cost: 800,
    description: 'Deep-ice luminescence radiating blinding Superman-blue Cherenkov photons from Siberian permafrost.',
    rarity: 'RARE',
    badgeColor: 'border-cyan-500 text-cyan-300 bg-cyan-950/40',
    visualGlow: 'from-cyan-500/30 to-blue-600/30',
    previewIcon: '❄️',
    lore: 'Harvested from the deepest 2,500-meter borehole of Lake Baikal after absorbing high-energy Blazar neutrinos.'
  },
  {
    id: 'ZOROASTRIAN_SOLAR_GOLD',
    name: 'Zoroastrian Solar Gold',
    subtitle: 'Maragheh Sacred Atar Fire Emblazonment',
    cost: 1200,
    description: 'Radiant golden Faravahar chest emblem wreathed in sacred solar plasma that vaporizes dark background noise.',
    rarity: 'EPIC',
    badgeColor: 'border-amber-500 text-amber-300 bg-amber-950/40',
    visualGlow: 'from-amber-400/30 to-yellow-500/30',
    previewIcon: '🔥',
    lore: 'Sanctified at the high-altitude altars of Takht-e Soleyman, sustaining perpetual harmonic zero-grid resonance.'
  },
  {
    id: 'TUSI_COUPLE_CYBERNETIC',
    name: 'Tusi-Couple Cybernetic Weave',
    subtitle: 'Al-Khwarizmi Base-60 Coordinate Matrix',
    cost: 1800,
    description: 'Holographic circles rotating inside circles across the pauldrons, projecting dynamic sexagesimal calculations.',
    rarity: 'LEGENDARY',
    badgeColor: 'border-purple-500 text-purple-300 bg-purple-950/40',
    visualGlow: 'from-purple-500/30 to-indigo-600/30',
    previewIcon: '⚙️',
    lore: 'Inspired by Nasir al-Din al-Tusi’s non-Ptolemaic planetary motion theorems computed at Maragheh Observatory.'
  },
  {
    id: 'VOID_ANTIMATTER_REAPER',
    name: 'Void Antimatter Reaper',
    subtitle: 'Blazar TXS 0506+056 Cosmic Horizon',
    cost: 2500,
    description: 'Dark matter singularity filaments absorbing optical glare and converting ambient gamma-rays into raw telemetry.',
    rarity: 'COSMIC',
    badgeColor: 'border-rose-500 text-rose-300 bg-rose-950/40',
    visualGlow: 'from-rose-500/30 to-red-700/30',
    previewIcon: '🌌',
    lore: 'The ultimate shielding worn by catalysts when venturing beyond the Van Allen belts into deep interstellar space.'
  }
];

export class AetherMarketplaceManager {
  public readonly storageKey: string = 'AetherCore_User_Profile';
  private userProfile: UserProfileData;
  private listeners: Array<(profile: UserProfileData) => void> = [];

  constructor() {
    this.userProfile = this.loadCurrentProfile();
  }

  /**
   * Extracts active profile structures from browser cache storage.
   */
  public loadCurrentProfile(): UserProfileData {
    if (typeof window === 'undefined') {
      return this.getDefaultProfile();
    }
    const cachedData = localStorage.getItem(this.storageKey);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (parsed?.high_score_metrics && parsed?.character_customization) {
          return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse cached profile', e);
      }
    }
    // Fail-safe fallback default state
    const defaultState = this.getDefaultProfile();
    this.saveProfile(defaultState);
    return defaultState;
  }

  private getDefaultProfile(): UserProfileData {
    return {
      user_id: 'usr_guest',
      high_score_metrics: {
        current_tokens_held: 1500,
        missions_completed: 4,
        highest_coherence_pct: 99.4,
      },
      character_customization: {
        active_skin: 'VANILLA_CUNEIFORM',
        unlocked_skins: ['VANILLA_CUNEIFORM'],
      },
    };
  }

  public getProfile(): UserProfileData {
    return this.userProfile;
  }

  public subscribe(listener: (profile: UserProfileData) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.userProfile));
  }

  private saveProfile(profile: UserProfileData) {
    this.userProfile = profile;
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(profile));
    }
    this.notify();
  }

  /**
   * Award tokens earned from simulations, mission balance challenges, or stream congruence
   */
  public addTokens(amount: number) {
    const updated = {
      ...this.userProfile,
      high_score_metrics: {
        ...this.userProfile.high_score_metrics,
        current_tokens_held: (this.userProfile.high_score_metrics.current_tokens_held || 0) + amount,
      },
    };
    this.saveProfile(updated);
  }

  /**
   * Evaluates financial balances and processes custom item unlocks.
   */
  public executeSkinPurchase(skinId: string, cost: number): { success: boolean; message: string } {
    let currentTokens = this.userProfile.high_score_metrics.current_tokens_held || 0;
    let unlockedSkins = [...(this.userProfile.character_customization.unlocked_skins || [])];

    // 1. Validation Check: Verify if item is already owned
    if (unlockedSkins.includes(skinId)) {
      this.equipSkin(skinId);
      return { success: true, message: `Skin '${skinId}' equipped.` };
    }

    // 2. Financial Check: Verify if user holds sufficient tokens
    if (currentTokens >= cost) {
      currentTokens -= cost;
      unlockedSkins.push(skinId);

      const updatedProfile: UserProfileData = {
        ...this.userProfile,
        high_score_metrics: {
          ...this.userProfile.high_score_metrics,
          current_tokens_held: currentTokens,
        },
        character_customization: {
          ...this.userProfile.character_customization,
          active_skin: skinId,
          unlocked_skins: unlockedSkins,
        },
      };

      this.saveProfile(updatedProfile);
      return { success: true, message: `Successfully unlocked and equipped ${skinId}!` };
    } else {
      return {
        success: false,
        message: `Insufficient Aether Tokens! Need ${cost} tokens (Held: ${currentTokens}). Complete missions or balance the array to earn more!`,
      };
    }
  }

  /**
   * Changes active cosmetic visual attributes inside user data states.
   */
  public equipSkin(skinId: string) {
    const updatedProfile: UserProfileData = {
      ...this.userProfile,
      character_customization: {
        ...this.userProfile.character_customization,
        active_skin: skinId,
      },
    };
    this.saveProfile(updatedProfile);
  }
}

// Global singleton instance
export const aetherShop = new AetherMarketplaceManager();
