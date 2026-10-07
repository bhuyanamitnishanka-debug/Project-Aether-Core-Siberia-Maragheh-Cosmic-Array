export interface BlueprintSection {
  id: string;
  title: string;
  category: 'POWER_SYSTEMS' | 'COMPUTATIONAL_ENGINE' | 'OPTICAL_ARRAY' | 'EARTH_SHIELD_TOPOLOGY';
  summary: string;
  specifications: { label: string; value: string; note?: string }[];
  technicalDescription: string[];
  mathematicalFormulas: {
    name: string;
    formula: string;
    explanation: string;
  }[];
  circuitTopology?: string;
  historicalPrecedent: string;
}

export const BLUEPRINT_SECTIONS: BlueprintSection[] = [
  {
    id: 'asbads-baghdad-battery',
    title: '1. The Asbads Windmill to Baghdad Battery Matrix Interface',
    category: 'POWER_SYSTEMS',
    summary: 'Zero-grid mechanical-to-galvanic power system combining 1,000-year-old vertical-axis Persian sails with an underground 50,000-jar chemical capacitor matrix.',
    specifications: [
      { label: 'Wind Harvester Type', value: 'Nashtifan-Style Vertical-Axis Asbads', note: 'Unidirectional clay-and-timber sails' },
      { label: 'Turbine Rotor Geometry', value: '8 to 12 vertical wooden vanes, 6.5m height, 3.2m radius' },
      { label: 'Alternator Type', value: 'Direct-Drive Axial-Flux Multi-Pole PMA', note: 'Neodymium permanent magnets, low-RPM' },
      { label: 'Alternator Operating Range', value: '15 – 90 RPM (Output: 0 – 140V Pulsed AC)' },
      { label: 'Rectification Stage', value: 'Heavy Copper Synchronous Mechanical/Solid-State Rectifier', note: 'AC to Pulsating Raw DC' },
      { label: 'Battery Array Scale', value: '50,000 Subterranean Terracotta Jars', note: 'Vibration-isolated bedrock vaults' },
      { label: 'Single Cell Anode (–)', value: 'High-purity Iron Rod (Fe, 99.8%)', note: 'Diameter 12mm, Length 220mm' },
      { label: 'Single Cell Cathode (+)', value: 'Electrolytic Copper Sleeve (Cu, 99.9%)', note: 'Inner diameter 35mm, sheet thickness 1.2mm' },
      { label: 'Electrolyte Solution', value: '12% Volumetric Acetic/Citric Acid (CH₃COOH)', note: 'Localized fermented pomegranate/vinegar derivative' },
      { label: 'Single Cell Voltage & Current', value: '1.20 V DC nominal @ 30 mA per cell' },
      { label: 'Wiring Configuration', value: '40 Series Cells × 1,250 Parallel Strings' },
      { label: 'Main DC Bus Voltage', value: '48.0 V DC (Ultra-Flat Instrument Grade)' },
      { label: 'Continuous Bus Current Capacity', value: '37.5 A (1.80 kW Continuous Reserve)' },
      { label: 'Ripple Voltage Amplitude', value: '< 0.02 mV RMS (–142 dBm Noise Floor)' }
    ],
    technicalDescription: [
      'The Asbads vertical windmills convert the relentless 120-Day Winds of Sistan and East Azerbaijan into continuous low-RPM rotational torque without requiring yaw steering mechanisms.',
      'To prevent electromagnetic switching hash caused by modern switched-mode power supplies, the raw wind electricity is stepped down and fed into an expansive subterranean chemical capacitor bank composed of 50,000 terracotta Baghdad Battery cells.',
      'Each cell operates on the galvanic redox couple Fe + 2H⁺ → Fe²⁺ + H₂ (E° = 0.44V) and Cu²⁺ + 2e⁻ → Cu (E° = 0.34V), delivering a nominal 1.2V DC under load.',
      'Wiring 40 cells in a series branch steps the voltage up to 48.0V DC. Connecting 1,250 of these branches in parallel creates an enormous effective electrochemical capacitance (C_eff > 120,000 Farads), creating a molecular-scale low-pass filter that swallows all wind-induced ripple harmonics.'
    ],
    mathematicalFormulas: [
      {
        name: 'Galvanic Cell Nernst Equilibrium Potential',
        formula: 'E_{cell} = E°_{cell} - \\frac{RT}{zF} \\ln \\left(\\frac{[Fe^{2+}]}{[H^+]^2}\\right) \\approx 1.20\\text{ V}',
        explanation: 'Governs the baseline electromotive force of the iron-copper galvanic couple in 12% acetic acid electrolyte at 20°C.'
      },
      {
        name: 'Chemical Matrix Low-Pass Cutoff Frequency',
        formula: 'f_c = \\frac{1}{2\\pi \\cdot R_{int} \\cdot C_{dl}} \\approx 0.0042\\text{ Hz}',
        explanation: 'Because the molecular electrical double-layer capacitance (C_dl) across 50,000 porous terracotta jars exceeds 120 kF, the cutoff frequency is below 0.01 Hz, eliminating all alternator ripple frequencies.'
      },
      {
        name: 'Total Matrix Voltage and Current Scaling',
        formula: 'V_{bus} = N_s \\cdot V_{cell} = 40 \\times 1.2\\text{V} = 48.0\\text{V}; \\quad I_{bus} = N_p \\cdot I_{cell} = 1250 \\times 30\\text{mA} = 37.5\\text{A}',
        explanation: 'Step-up and current amplification topology across the 40 × 1,250 series-parallel network.'
      }
    ],
    circuitTopology: `[ ASBADS TIMBER ROTOR ] ──> [ AXIAL PMA ALTERNATOR (0-140V AC) ]
                                      │
                                      ▼
                        [ SYNCHRONOUS COPPER RECTIFIER ]
                                      │
                                      ▼ (Raw Pulsed DC)
  ┌───────────────────────────────────┴───────────────────────────────────┐
  ▼                                   ▼                                   ▼
[STRING 1: 40 JARS]                 [STRING 2: 40 JARS]                 [STRING 1250: 40 JARS]
 Jar 1 (+) ── 1.2V                   Jar 1 (+) ── 1.2V                   Jar 1 (+) ── 1.2V
    │                                   │                                   │
 Jar 2     ── 1.2V                   Jar 2     ── 1.2V                   Jar 2     ── 1.2V
    │                                   │                                   │
   ...                                 ...                                 ...
    │                                   │                                   │
 Jar 40(-) ── 1.2V                   Jar 40(-) ── 1.2V                   Jar 40(-) ── 1.2V
  └─────────────────┬─────────────────┴─────────────────┬─────────────────┘
                    │                                   │
                    ▼ (Heavy Copper Busbars)            ▼
       [ POSITIVE BUS (+48.0V DC) ]         [ NEGATIVE BUS (GROUND) ]
                    │
                    ▼
     [ MARAGHEH QUANTUM SENSOR SUITE: ULTRA-LOW-NOISE POWER ]`,
    historicalPrecedent: 'The Asbads of Nashtifan have operated continuously since the Sasanian era (~7th century AD). The Baghdad Battery (Khujut Rabu) artifacts date from the Parthian/Sasanian period (~250 BC – 224 AD).'
  },
  {
    id: 'sexagesimal-computational-engine',
    title: '2. Ancient Persian Computational Engine & Telemetry Packet',
    category: 'COMPUTATIONAL_ENGINE',
    summary: 'A non-binary base-60 mathematical architecture derived from Al-Khwarizmi, Al-Biruni, and Jamshid al-Kashi for fractional geometric coordinate transformations.',
    specifications: [
      { label: 'Number System', value: 'Sexagesimal (Base-60 Positional Arithmetic)' },
      { label: 'Token State Domain', value: 'S_k ∈ {0, 1, 2, ..., 59} (60 Discrete States)' },
      { label: 'Packet Structure', value: 'Fixed 6-Token Sexagesimal Frame (Total 360-state space)' },
      { label: 'Token 0 (Synch)', value: 'Al-Muqabala Header: Fixed State 59 (Opening Gate)' },
      { label: 'Token 1 (Timestamp)', value: 'Fractional Epoch: 1/60th Day divisions (Ghati equivalence)' },
      { label: 'Token 2 (Vector Φ)', value: 'Tusi-Couple Azimuth: [0°, 360°) mapped to [0, 60)' },
      { label: 'Token 3 (Vector Θ)', value: 'Tusi-Couple Elevation: [0°, 90°) mapped to [0, 60)' },
      { label: 'Token 4 (Energy Payload)', value: 'Logarithmic Neutrino Energy (10¹⁴ – 10¹⁸ eV)' },
      { label: 'Token 5 (Checksum)', value: 'Al-Jabr Balancing Token (Σ Tokens ≡ 0 mod 60)' },
      { label: 'Transit Medium', value: 'Cryo-Insulated Optical Fiber Conduit (Lake Baikal → Maragheh)' },
      { label: 'One-Way Transit Latency', value: '16.2 ms across 5,200 km' }
    ],
    technicalDescription: [
      'Modern binary computation introduces truncation errors when converting fractional spherical coordinates into floating-point numbers. By retaining native sexagesimal representation, minutes and seconds of celestial arc map directly into integer tokens.',
      'The Cherenkov conical shockwave coordinates are transformed using the geometric properties of the Tusi Couple—a device where a small circle rolls inside another twice its diameter, transforming rotational angular momentum into pure linear harmonic coordinates.',
      'Every packet transmitted from the Siberian permafrost node is balanced using the ancient algebraic principle of Al-Jabr (restoration). The sum of all six positional tokens must equal zero modulo 60.'
    ],
    mathematicalFormulas: [
      {
        name: 'The Tusi Couple Linear Transform',
        formula: 'x(t) = 2r \\cos(\\theta); \\quad y(t) = 0',
        explanation: 'Converts angular Cherenkov photon arrivals on the spherical optical modules directly into linear radial offsets without requiring transcendental trigonometric lookups.'
      },
      {
        name: 'Sexagesimal Angle Decomposition',
        formula: '\\theta = S_{\\text{deg}} + \\frac{S_{\\text{min}}}{60} + \\frac{S_{\\text{sec}}}{3600}',
        explanation: 'Native base-60 fractional mapping used by Jamshid al-Kashi in the Zij-i Khaqani.'
      },
      {
        name: 'Al-Jabr Algebraic Checksum Balance',
        formula: '\\sum_{i=0}^{5} Token_i \\equiv 0 \\pmod{60} \\implies Token_5 = \\left(60 - \\sum_{i=0}^{4} Token_i \\pmod{60}\\right) \\pmod{60}',
        explanation: 'Guarantees transmission integrity over the 5,200 km trans-Central Asian fiber line.'
      }
    ],
    historicalPrecedent: 'Nasir al-Din al-Tusi formulated the Tusi Couple in 1247 AD at the Maragheh Observatory in his treatise Tadhkira fi ilm al-hay’a.'
  },
  {
    id: 'dark-astrolabe-optics',
    title: '3. The "Dark Astrolabe" Advanced Optical Array',
    category: 'OPTICAL_ARRAY',
    summary: 'A modernized camera obscura mounted on a giant stone mural quadrant, casting deep celestial alignments through a micron-scale obsidian pinhole onto a 77K CMOS sensor.',
    specifications: [
      { label: 'Optical Principle', value: 'Al-Haytham Camera Obscura (Lensless Diffraction-Limited Optics)' },
      { label: 'Aperture Plate', value: 'Ultra-Fine Micron-Scale Volcanic Obsidian (SiO₂)', note: 'Chemically etched aperture' },
      { label: 'Aperture Diameter', value: '22.4 µm (Optimized for λ = 550nm starlight)' },
      { label: 'Focal Chamber Length', value: '3,800 mm (Direct stone quadrant focal path)' },
      { label: 'Sensor Architecture', value: 'Scientific Quantum Back-Illuminated CMOS Array' },
      { label: 'Sensor Operating Temp', value: '77.2 Kelvin (Liquid Nitrogen / Stirling Cryocooler)' },
      { label: 'Quantum Efficiency (QE)', value: '> 94% across 380 nm – 850 nm' },
      { label: 'Readout Noise', value: '< 0.7 e⁻ RMS (enabled by zero-noise battery bus)' },
      { label: 'Spatial Resolution', value: '0.038 arcseconds per pixel' }
    ],
    technicalDescription: [
      'Refractive lenses create chromatic aberration and subtle optical distortion. By adopting Ibn al-Haytham’s camera obscura principle with modern nano-machined obsidian apertures, the Dark Astrolabe delivers a purely rectilinear, diffraction-limited celestial projection.',
      'Mounted onto the reconstructed stone mural quadrant of Nasir al-Din al-Tusi, the telescope rotates along an astronomical zenith arc cut into solid mountain bedrock.',
      'The optical image falls directly onto a cryogenic CMOS detector cooled to 77 Kelvin. Power for the sensor is fed directly from the subterranean Baghdad Battery bus, eliminating the 50/60 Hz line-hum that typically plagues high-sensitivity quantum detectors.'
    ],
    mathematicalFormulas: [
      {
        name: 'Optimal Obsidian Pinhole Diameter (Petzval-Lord Rayleigh)',
        formula: 'd_{opt} = \\sqrt{2.44 \\cdot \\lambda \\cdot f} = \\sqrt{2.44 \\cdot 550\\text{ nm} \\cdot 3.8\\text{ m}} \\approx 71.4\\,\\mu\\text{m}',
        explanation: 'Calculates the ideal balance between geometric blur and Fraunhofer diffraction for starlight.'
      },
      {
        name: 'Thermal Dark-Current Suppression at 77K',
        formula: 'I_{dark}(T) \\propto T^{3/2} \\exp\\left(-\\frac{E_g}{2k_B T}\\right)',
        explanation: 'At liquid nitrogen temperature (77K), silicon dark current drops from ~100 e⁻/pixel/s to under 0.0001 e⁻/pixel/s.'
      }
    ],
    historicalPrecedent: 'Hasan Ibn al-Haytham (Alhazen) established modern optics and the camera obscura in the Book of Optics (Kitab al-Manazir, 1011–1021 AD).'
  },
  {
    id: 'earth-shield-topology',
    title: '4. The Earth-Shield Geometry & Trans-Continental Fiber',
    category: 'EARTH_SHIELD_TOPOLOGY',
    summary: 'Using 6,371 km of solid Earth mantle as a natural cosmic-ray filtration lens between Siberia and Maragheh.',
    specifications: [
      { label: 'Siberian Terminal', value: 'Lake Baikal GVD-1 Node (51.78° N, 104.38° E)' },
      { label: 'Iranian Terminal', value: 'Maragheh Observatory Citadel (37.39° N, 46.20° E)' },
      { label: 'Great Circle Distance', value: '4,860 km (Surface) / 4,320 km (Chord through Crust)' },
      { label: 'Optical Cable Route', value: 'Baikal → Novosibirsk → Astana → Samarkand → Tabriz → Maragheh' },
      { label: 'Total Fiber Run', value: '5,210 km (Nitrogen-pressurized permafrost trench)' },
      { label: 'Quantum Repeaters', value: 'Laser-pumped Erbium-doped optical repeaters at 80 km intervals' },
      { label: 'Rock Shield Filtration', value: '10¹² Muon Background Suppression' }
    ],
    technicalDescription: [
      'Atmospheric cosmic ray showers create billions of downward-traveling muons every second. Standard observatories are drowned in this noise.',
      'By pointing the Baikal detector downward to catch upward-traveling particles coming through the Earth from the southern celestial sky, the entire 6,000 km planetary crust acts as a natural lens.',
      'Only uncharged, weakly-interacting neutrinos can pass unscathed through the iron core and silicate mantle of Earth, arriving at Lake Baikal with zero background contamination.'
    ],
    mathematicalFormulas: [
      {
        name: 'Earth Muon Attenuation Function',
        formula: 'I(x) = I_0 \\exp\\left(-\\int \\rho(s) \\sigma_{inel} \\, ds\\right) \\ll 10^{-12} \\quad \\text{for } x > 100\\text{ km}',
        explanation: 'Proves complete absorption of background atmospheric muons through the Earth rock column.'
      }
    ],
    historicalPrecedent: 'The Silk Road conduits historically connected Samarkand, Bukhara, Nishapur, and Tabriz as centers of astronomical computation.'
  }
];
