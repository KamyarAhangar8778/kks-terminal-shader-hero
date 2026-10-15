const HEX_RGB01_CACHE = new Map<string, [number, number, number]>();
const INV_255 = 1 / 255;

const HEX_BYTE_TABLE: string[] = Array.from({ length: 256 }, (_, i) =>
  i.toString(16).padStart(2, '0')
);

function hexVal(code: number): number {
  if (code >= 48 && code <= 57) return code - 48;
  if (code >= 97 && code <= 102) return code - 87;
  if (code >= 65 && code <= 70) return code - 55;
  return 0;
}

function parseHex24(hex: string): number {
  const len = hex.length;
  let start = 0;
  while (start < len && hex.charCodeAt(start) <= 32) start++;
  if (start < len && hex.charCodeAt(start) === 35) start++;
  let end = len;
  while (end > start && hex.charCodeAt(end - 1) <= 32) end--;
  const hLen = end - start;
  if (hLen === 3) {
    const r = hexVal(hex.charCodeAt(start));
    const g = hexVal(hex.charCodeAt(start + 1));
    const b = hexVal(hex.charCodeAt(start + 2));
    return (r << 20) | (r << 16) | (g << 12) | (g << 8) | (b << 4) | b;
  }
  let n = 0;
  for (let i = start; i < end; i++) {
    n = (n << 4) | hexVal(hex.charCodeAt(i));
  }
  return n;
}

export function hexToRgb01(hex: string): [number, number, number] {
  const cached = HEX_RGB01_CACHE.get(hex);
  if (cached) return cached;
  const n = parseHex24(hex);
  const res: [number, number, number] = [
    ((n >> 16) & 255) * INV_255,
    ((n >> 8) & 255) * INV_255,
    (n & 255) * INV_255,
  ];
  if (HEX_RGB01_CACHE.size < 256) {
    HEX_RGB01_CACHE.set(hex, res);
  }
  return res;
}

export function hexToHsl(hex: string): [number, number, number] {
  const n = parseHex24(hex);
  const r = ((n >> 16) & 255) * INV_255;
  const g = ((n >> 8) & 255) * INV_255;
  const b = (n & 255) * INV_255;
  const max = r > g ? (r > b ? r : b) : g > b ? g : b;
  const min = r < g ? (r < b ? r : b) : g < b ? g : b;
  const l = (max + min) * 0.5;
  let s = 0;
  let hue = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) hue = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue *= 60;
  }
  return [(hue + 0.5) | 0, (s * 100 + 0.5) | 0, (l * 100 + 0.5) | 0];
}

export function hslToHex(h: number, s: number, l: number): string {
  const sn = s * 0.01;
  const ln = l * 0.01;
  const a = sn * (ln < 1 - ln ? ln : 1 - ln);
  const hDiv30 = h / 30;

  const k0 = hDiv30 % 12;
  const m0 = k0 - 3 < 9 - k0 ? (k0 - 3 < 1 ? k0 - 3 : 1) : 9 - k0 < 1 ? 9 - k0 : 1;
  const r = ((255 * (ln - a * (m0 > -1 ? m0 : -1)) + 0.5) | 0) & 255;

  const k8 = (8 + hDiv30) % 12;
  const m8 = k8 - 3 < 9 - k8 ? (k8 - 3 < 1 ? k8 - 3 : 1) : 9 - k8 < 1 ? 9 - k8 : 1;
  const g = ((255 * (ln - a * (m8 > -1 ? m8 : -1)) + 0.5) | 0) & 255;

  const k4 = (4 + hDiv30) % 12;
  const m4 = k4 - 3 < 9 - k4 ? (k4 - 3 < 1 ? k4 - 3 : 1) : 9 - k4 < 1 ? 9 - k4 : 1;
  const b = ((255 * (ln - a * (m4 > -1 ? m4 : -1)) + 0.5) | 0) & 255;

  return `#${HEX_BYTE_TABLE[r]!}${HEX_BYTE_TABLE[g]!}${HEX_BYTE_TABLE[b]!}`;
}

export const isHex = (s: string): boolean => /^#?[0-9a-fA-F]{6}$/.test(s.trim());

export const normHex = (s: string): string => {
  const v = s.trim().replace(/^#?/, '');
  return `#${v.toLowerCase()}`;
};

export const PRESET_SWATCHES = [
  '#ffffff',
  '#d8d8d8',
  '#9b9b9b',
  '#1b1b1b',
  '#0b1733',
  '#e88f00',
  '#2ee06a',
  '#3b82f6',
  '#a855f7',
  '#f7d8e3',
] as const;
