const SLANT_ARLAN = [
  '    ___         __          ',
  '   /   |  _____/ /___ _____ ',
  '  / /| | / ___/ / __ `/ __ \\',
  ' / ___ |/ /  / / /_/ / / / /',
  '/_/  |_/_/  /_/\\__,_/_/ /_/ ',
];
const SLANT_HUMAN_DELTA = [
  '    __  __                               ____       ____       ',
  '   / / / /_  ______ ___  ____ _____     / __ \\___  / / /_____ _',
  '  / /_/ / / / / __ `__ \\/ __ `/ __ \\   / / / / _ \\/ / __/ __ `/',
  ' / __  / /_/ / / / / / / /_/ / / / /  / /_/ /  __/ / /_/ /_/ / ',
  '/_/ /_/\\__,_/_/ /_/ /_/\\__,_/_/ /_/  /_____/\\___/_/\\__/\\__,_/  ',
];
const SLANT_KAMILA = [
  '    __ __                _ __     ',
  '   / //_/___ _____ ___  (_) /___ _',
  '  / ,< / __ `/ __ `__ \\/ / / __ `/',
  ' / /| / /_/ / / / / / / / / /_/ / ',
  '/_/ |_\\__,_/_/ /_/ /_/_/_/\\__,_/  ',
];

export interface Variant {
  id: string;
  label: string;

  rows: string[];

  ink: string;

  logo: string;

  bg: string;

  zoom: number;
}

export const VARIANTS: Variant[] = [
  {
    id: 'arlan',
    label: 'Arlan',
    rows: SLANT_ARLAN,
    ink: '#d8d8d8',
    logo: '#ffffff',
    bg: '#0c0c0d',
    zoom: 0.62,
  },
  {
    id: 'human-delta',
    label: 'Human Delta',
    rows: SLANT_HUMAN_DELTA,
    ink: '#dfe6f5',
    logo: '#ffffff',
    bg: '#0b1733',
    zoom: 0.62,
  },
  {
    id: 'kamila',
    label: 'Kamila',
    rows: SLANT_KAMILA,
    ink: '#f7d8e3',
    logo: '#ffffff',
    bg: '#2a0f1c',
    zoom: 0.62,
  },
];
