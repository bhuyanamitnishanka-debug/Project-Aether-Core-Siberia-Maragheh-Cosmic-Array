export interface ComicPanelData {
  id: string;
  panelNumber: number;
  location:
    | 'Baikal, Siberia'
    | 'Maragheh, Iran'
    | 'Central Asian Corridor'
    | 'Deep Earth / Cosmic Space'
    | 'Nexus Chamber, Maragheh'
    | 'Siberian Altay Ridge'
    | 'Dasht-e Kavir Desert'
    | 'Planetary Orbit / Global Mesh'
    | 'Oceanic Node: Mariana Trench'
    | 'Takht-e Soleyman Crypt'
    | 'Interstellar Horizon: Orion Sector';
  caption?: string;
  visualDescription: string;
  soundEffect?: {
    text: string;
    subtext?: string;
    color: string;
  };
  dialogue: {
    character: 'VOLKOV' | 'ARYANA' | 'ARSHAMA' | 'NARRATOR';
    nativeText?: string;
    nativeLanguage?: 'Russian' | 'Persian' | 'Old Persian';
    englishText: string;
    tone: string;
  }[];
  technicalCallout?: {
    title: string;
    russian?: string;
    persian?: string;
    details: string;
    metric?: string;
  };
  artStyle:
    | 'polar-ice'
    | 'desert-citadel'
    | 'cosmic-fire'
    | 'subterranean-battery'
    | 'astrolabe-optics'
    | 'mineral-vein'
    | 'planetary-mesh'
    | 'outpost-drilling'
    | 'abyssal-ocean'
    | 'ancient-crypt'
    | 'interstellar-fire';
}

export interface ComicChapter {
  id: string;
  title: string;
  subtitle: string;
  chapterNumber: number;
  settingSummary: string;
  panels: ComicPanelData[];
}

export interface SexagesimalPacket {
  header: number;       // Token 0: Al-Muqabala Header (Fixed at 59)
  epochTime: number;    // Token 1: Fractional Epoch Time (0-59)
  azimuth: number;      // Token 2: Tusi-Vector Azimuth Phi (0-59)
  elevation: number;    // Token 3: Tusi-Vector Elevation Theta (0-59)
  energyThreshold: number; // Token 4: Particle Energy Payload (0-59)
  checksum: number;     // Token 5: Al-Jabr Balancing Checksum (0-59)
  timestamp: string;
  energyEv: number;
  rawSum: number;
  isBalanced: boolean;
  tusiX: number;
  tusiY: number;
}

export interface StreamPacketPoint {
  id: number;
  timestamp: number;
  token0: number; // Header (target 59)
  token1: number; // Epoch Time
  token2: number; // Azimuth
  token3: number; // Elevation
  token4: number; // Energy
  token5: number; // Checksum
  rawSum: number;
  isCongruent: boolean;
  transmissionQuality: number; // 0 - 100%
  fiberJitterUs: number; // microseconds
  fiberLossDbm: number; // dBm
  snrDb: number; // Signal to Noise ratio in dB
  tusiThetaRad: number;
  tusiDisplacement: number;
}

export interface FiberRoutingNode {
  id: string;
  name: string;
  region: string;
  type: 'ORIGIN' | 'REPEATER' | 'AMPLIFIER' | 'MINING_BYPASS' | 'CRYPT_RELAY' | 'DESTINATION';
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  latitude: number;
  longitude: number;
  distanceKm: number;
  repeaterGainDb: number;
  noiseFigureDb: number;
  temperatureK: number;
  isActive: boolean;
  algebraicFlowCoeff: number; // alpha_k: 0.1 to 1.0 (Al-Khwarizmi Conductance)
  tangentAngleDeg: number;    // theta_k: Tangent heading angle
  curvatureIndex: number;     // kappa_k: Bending tension
  alJabrWeight: number;       // Balance restoration weight
}

export interface BatteryGridState {
  windSpeedMs: number;          // 0 to 40 m/s
  asbadsRpm: number;            // 0 to 90 RPM
  alternatorVoltageAc: number;  // 0 to 140 V AC pulsed
  rectifiedDcRaw: number;       // Raw pulsating DC before filter
  electrolyteConcPercent: number; // 5% to 20% acetic acid
  activeParallelBanks: number;  // Up to 1,250 banks
  seriesCellsPerBank: number;   // 40 jars per bank
  totalCells: number;           // 50,000 cells
  busVoltageDc: number;         // Target 48.0V
  busCurrentA: number;          // 0 to 45A
  rippleVoltageMv: number;      // Ripple amplitude
  filterCutoffHz: number;
  busStabilityPercent: number;
}

export interface AstrolabeState {
  obsidianPinholeMicrons: number; // 15 to 120 microns
  cmosTempKelvin: number;        // Target 77K
  quadrantAngleDeg: number;       // 0 to 90 degrees
  opticalTarget: string;
  neutrinoVectorOffsetArcsec: number;
  alignmentScorePercent: number;
  isCoincidenceLocked: boolean;
}

export interface AetherSaveState {
  save_state_meta: {
    profile_id: string;
    timestamp_epoch_sec: number;
    current_chapter: number;
    current_act: string;
    game_completed: boolean;
  };
  player_progression: {
    unlocked_outposts: string[];
    unlocked_tech_tree: string[];
  };
  resource_inventory: {
    siberian_nodes: {
      quantum_crystals_tons: number;
      permafrost_ice_stability_pct: number;
      available_dom_sensors: number;
    };
    iranian_nodes: {
      primordial_lithium_brine_liters: number;
      terracotta_battery_jars_active: number;
      organic_acetic_acid_gallons: number;
    };
  };
  active_engine_metrics: {
    slider_settings: {
      asbad_sail_pitch_ratio: number;
      engaged_battery_rows: number;
    };
    live_outputs: {
      asbad_turbine_rpm: number;
      baghdad_matrix_voltage_dc: number;
      neutrino_flux_load_peV: number;
      shield_integrity_pct: number;
    };
    algebraic_verification: {
      last_verified_header: number;
      al_jabr_checksum_state: number;
      system_modulo_equilibrium: boolean;
    };
  };
}
