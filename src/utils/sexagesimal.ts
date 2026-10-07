import { SexagesimalPacket } from '../types';

/**
 * Ancient Persian Base-60 (Sexagesimal) Math & Telemetry Protocol
 * Derived from the mathematical treatises of Al-Khwarizmi and Jamshid al-Kashi.
 */

// Cuneiform / Persian positional glyph representations for base-60 units
export const SEXAGESIMAL_GLYPHS = [
  '𐎐', '𐎑', '𐎒', '𐎓', '𐎔', '𐎕', '𐎖', '𐎗', '𐎘', '𐎙', // 0-9
  '𐎚', '𐎛', '𐎜', '𐎝', '𐎞', '𐎟', '𐎠', '𐎡', '𐎢', '𐎣', // 10-19
  '𐎤', '𐎥', '𐎦', '𐎧', '𐎨', '𐎩', '𐎪', '𐎫', '𐎬', '𐎭', // 20-29
  '𐎮', '𐎯', '𐎰', '𐎱', '𐎲', '𐎳', '𐎴', '𐎵', '𐎶', '𐎷', // 30-39
  '𐎸', '𐎹', '𐎺', '𐎻', '𐎼', '𐎽', '𐎾', '𐎿', '𐏀', '𐏁', // 40-49
  '𐏂', '𐏃', '𐏄', '𐏅', '𐏆', '𐏇', '𐏈', '𐏉', '𐏊', '𐏋'  // 50-59
];

/**
 * Format a number into Sexagesimal notation (Degrees ° Minutes ' Seconds '')
 */
export function toSexagesimalDMS(valDeg: number): string {
  const deg = Math.floor(valDeg);
  const minRemainder = (valDeg - deg) * 60;
  const min = Math.floor(minRemainder);
  const sec = Math.round((minRemainder - min) * 60);
  return `${deg}° ${min}′ ${sec}″`;
}

/**
 * Format number into Base-60 positional tokens: [D; M, S]
 */
export function toSexagesimalPositional(value: number): string {
  const norm = Math.max(0, Math.min(59, Math.floor(value)));
  return `${norm.toString().padStart(2, '0')}₆₀ (${SEXAGESIMAL_GLYPHS[norm] || '·'})`;
}

/**
 * Calculate the Tusi Couple coordinates:
 * A circle of radius r rolls inside a stationary circle of radius R = 2r.
 * Any point on the perimeter of the smaller circle traces a perfect diameter line.
 * x(theta) = 2r * cos(theta)
 * y(theta) = 0 (relative to rotated diameter axis)
 */
export function calculateTusiCouple(r: number, thetaRad: number): {
  centerSmallX: number;
  centerSmallY: number;
  pointX: number;
  pointY: number;
  linearDisplacement: number;
} {
  // Center of small circle moves along radius r at angle theta
  const centerSmallX = r * Math.cos(thetaRad);
  const centerSmallY = r * Math.sin(thetaRad);

  // The contact point rotates backwards with double relative speed
  const pointX = centerSmallX + r * Math.cos(-thetaRad);
  const pointY = centerSmallY + r * Math.sin(-thetaRad);

  // Theoretical exact linear position along primary axis
  const linearDisplacement = 2 * r * Math.cos(thetaRad);

  return {
    centerSmallX,
    centerSmallY,
    pointX,
    pointY,
    linearDisplacement,
  };
}

/**
 * Compile a raw Siberian Cherenkov event into an authentic 6-token Sexagesimal Packet
 */
export function createAetherCorePacket(
  azimuthDeg: number = 142.5,
  elevationDeg: number = 38.2,
  energyPeV: number = 1.45 // in Peta-electronvolts (10^15 eV)
): SexagesimalPacket {
  const HEADER = 59; // Al-Muqabala fixed synchronization token

  // Fractional Epoch Time (fraction of 24h cycle * 60)
  const now = new Date();
  const fractionalDay = (now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds()) / 86400;
  const epochToken = Math.floor(fractionalDay * 60) % 60;

  // Azimuth mapped to [0, 59]
  const azimuthNorm = ((azimuthDeg % 360) + 360) % 360;
  const azimuthToken = Math.floor((azimuthNorm / 360) * 60);

  // Elevation mapped to [0, 59]
  const elevationNorm = Math.max(0, Math.min(90, elevationDeg));
  const elevationToken = Math.floor((elevationNorm / 90) * 60);

  // Energy payload mapped logarithmically
  // Range: 0.1 PeV to 100 PeV mapped into [0, 59]
  const logEnergy = Math.log10(Math.max(0.01, energyPeV));
  const energyToken = Math.max(0, Math.min(59, Math.floor(((logEnergy + 1) / 3) * 60)));

  // Al-Jabr Checksum calculation:
  // sum(Token_0..5) = 0 mod 60
  const partialSum = HEADER + epochToken + azimuthToken + elevationToken + energyToken;
  const rem = partialSum % 60;
  const checksum = (60 - rem) % 60;

  const rawSum = partialSum + checksum;
  const isBalanced = rawSum % 60 === 0;

  // Tusi couple coordinates for visualization
  const thetaRad = (azimuthToken / 60) * Math.PI * 2;
  const tusi = calculateTusiCouple(100, thetaRad);

  return {
    header: HEADER,
    epochTime: epochToken,
    azimuth: azimuthToken,
    elevation: elevationToken,
    energyThreshold: energyToken,
    checksum: checksum,
    timestamp: now.toISOString(),
    energyEv: energyPeV * 1e15,
    rawSum,
    isBalanced,
    tusiX: tusi.pointX,
    tusiY: tusi.pointY,
  };
}
