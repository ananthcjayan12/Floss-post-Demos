export const FPS = 30;

export const C = {
  night: '#0a0930',
  night2: '#120f5c',
  indigo: '#1614a6',
  indigo2: '#3532e8',
  pink: '#ff5f87',
  teal: '#7ee0d6',
  teal2: '#0e5e66',
  sand: '#E7D9BD',
  wa: '#25d366',
  white: '#ffffff',
  muted: 'rgba(255,255,255,0.72)',
  card: 'rgba(255,255,255,0.97)',
  ink: '#14123f',
};

export const HEAD = "Manrope, 'DM Sans', system-ui, sans-serif";
export const BODY = "'DM Sans', Manrope, system-ui, sans-serif";

// Section timeline (frames @30fps). Narration starts 6 frames into each section.
export const SECTIONS = [
  { id: 'hook', len: 192 },
  { id: 'rewind', len: 177 },
  { id: 'setup', len: 195 },
  { id: 'brand', len: 219 },
  { id: 'facts', len: 411 },
  { id: 'wait', len: 75 },
  { id: 'payoff', len: 498 },
  { id: 'guard', len: 366 },
  { id: 'offer', len: 570 },
] as const;

export const STARTS = SECTIONS.reduce<number[]>((acc, s, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + SECTIONS[i - 1].len);
  return acc;
}, []);

export const TOTAL = STARTS[STARTS.length - 1] + SECTIONS[SECTIONS.length - 1].len;
export const VO_DELAY = 6;
