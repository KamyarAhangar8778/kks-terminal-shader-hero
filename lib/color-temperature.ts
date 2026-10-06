/**
 * Color Temperature Interpolation Utility for Terminal Shader.
 * Computes smooth transitions between deep cybernetic blue and classic phosphor green palettes.
 */

export interface DynamicTerminalPalette {
  background: string;
  glyphMuted: string;
  glyphMedium: string;
  glyphBright: string;
  accentPrimary: string;
  accentSecondary: string;
  foamWhite: string;
  vignetteCenter: string;
  vignetteEdge: string;
  temperatureName: 'DEEP_OCEANIC' | 'BIOLUMINESCENT_TEAL';
  mixFactor: number; // 0.0 (Deep Ocean Sapphire) to 1.0 (Bioluminescent Marine Teal)
}

const PALETTE_STEPS = 32;

/**
 * Linearly interpolates between two RGB color tuples.
 * @param {[number, number, number]} colorA First RGB tuple
 * @param {[number, number, number]} colorB Second RGB tuple
 * @param {number} t Interpolation factor (0 to 1)
 * @returns {string} Formatted CSS rgba string
 */
function interpolateRgb(
  colorA: [number, number, number],
  colorB: [number, number, number],
  t: number
): string {
  const r = (colorA[0] + (colorB[0] - colorA[0]) * t + 0.5) | 0;
  const g = (colorA[1] + (colorB[1] - colorA[1]) * t + 0.5) | 0;
  const b = (colorA[2] + (colorB[2] - colorA[2]) * t + 0.5) | 0;
  return `rgb(${r}, ${g}, ${b})`;
}

/** Pre-computed static lookup array for zero-allocation palette retrieval */
const PALETTE_LOOKUP: DynamicTerminalPalette[] = (() => {
  const lookup: DynamicTerminalPalette[] = [];
  for (let step = 0; step <= PALETTE_STEPS; step++) {
    const t = step / PALETTE_STEPS;
    // Deep ocean floor to marine abyss
    const bg = interpolateRgb([2, 6, 15], [2, 14, 12], t);
    // Deep submerged water body
    const muted = interpolateRgb([30, 68, 110], [20, 85, 78], t);
    // Mid-depth oceanic water
    const medium = interpolateRgb([56, 130, 200], [45, 160, 135], t);
    // Sunlit wave crests & surface glint
    const bright = interpolateRgb([186, 230, 253], [167, 243, 224], t);
    // Primary bioluminescent wave crest highlight
    const accentPrimary = interpolateRgb([56, 189, 248], [45, 212, 191], t);
    // Whitecap foam & crest spray
    const accentSecondary = interpolateRgb([224, 242, 254], [204, 251, 241], t);
    const foamWhite = interpolateRgb([240, 249, 255], [240, 253, 250], t);

    lookup.push({
      background: bg,
      glyphMuted: muted,
      glyphMedium: medium,
      glyphBright: bright,
      accentPrimary,
      accentSecondary,
      foamWhite,
      vignetteCenter: t > 0.5 ? 'rgba(2, 20, 18, 0.15)' : 'rgba(3, 15, 32, 0.15)',
      vignetteEdge: t > 0.5 ? 'rgba(1, 10, 8, 0.96)' : 'rgba(1, 4, 12, 0.96)',
      temperatureName: t > 0.5 ? 'BIOLUMINESCENT_TEAL' : 'DEEP_OCEANIC',
      mixFactor: t,
    });
  }
  return lookup;
})();

/**
 * Calculates current dynamic palette based on timestamp oscillation.
 * O(1) zero-allocation lookup from pre-computed static palette array.
 *
 * @param {number} time Current timestamp in ms
 * @param {number} periodMs Duration of one full color cycle in ms (default: 24000)
 * @returns {DynamicTerminalPalette} Interpolated color palette reference
 */
export function getDynamicColorPalette(time: number, periodMs = 24000): DynamicTerminalPalette {
  const rawT = Math.sin((time * 2 * Math.PI) / periodMs) * 0.5 + 0.5;
  const step = (rawT * PALETTE_STEPS + 0.5) | 0;
  const clampedStep = step < 0 ? 0 : step > PALETTE_STEPS ? PALETTE_STEPS : step;
  return PALETTE_LOOKUP[clampedStep] ?? PALETTE_LOOKUP[0]!;
}
