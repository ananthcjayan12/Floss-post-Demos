import React from 'react';
import {
  AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame,
} from 'remotion';
import { C, HEAD, SECTIONS, STARTS, TOTAL, VO_DELAY } from './theme';
import { Brand, Facts, Guard, Hook, Offer, Payoff, Rewind, Setup, Wait } from './scenes';
import { clamp } from './ui';
import { useFonts } from './fonts';
import vo1 from '../public/vo/vo1.json';
import vo2 from '../public/vo/vo2.json';
import vo3 from '../public/vo/vo3.json';
import vo4 from '../public/vo/vo4.json';
import vo5 from '../public/vo/vo5.json';
import vo6 from '../public/vo/vo6.json';
import vo7 from '../public/vo/vo7.json';
import vo8 from '../public/vo/vo8.json';
import vo9 from '../public/vo/vo9.json';

type Word = { w: string; s: number; e: number };
const VO: Word[][] = [vo1, vo2, vo3, vo4, vo5, vo6, vo7, vo8, vo9];
const SCENES = [Hook, Rewind, Setup, Brand, Facts, Wait, Payoff, Guard, Offer];

// Global word list in frames, cleaned up for display.
const WORDS = VO.flatMap((words, i) =>
  words.map((x) => ({
    w: x.w.replace(/^\.\.\./, '').replace('four-point-nine-star', '4.9-star').replace('thirty-five', '35')
      .replace('seventy-nine', '$79').replace(/^dollars$/, '').replace('two', x.w === 'two' && i === 4 ? '2,000' : 'two')
      .replace(/^thousand$/, ''),
    s: STARTS[i] + VO_DELAY + x.s * 30,
    e: STARTS[i] + VO_DELAY + x.e * 30,
    sec: i,
  })).filter((x) => x.w),
);

// Chunk into caption lines: break on punctuation or after 4 words.
const CHUNKS: (typeof WORDS)[] = [];
let cur: typeof WORDS = [];
WORDS.forEach((x, idx) => {
  cur.push(x);
  const next = WORDS[idx + 1];
  if (/[.,?!:…]$/.test(x.w) || cur.length >= 4 || !next || next.sec !== x.sec || next.s - x.e > 12) {
    CHUNKS.push(cur);
    cur = [];
  }
});

const VO_RANGES = VO.map((words, i) => [STARTS[i] + VO_DELAY, STARTS[i] + VO_DELAY + words[words.length - 1].e * 30]);

const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const i = CHUNKS.findIndex((c, k) => {
    const next = CHUNKS[k + 1] ? CHUNKS[k + 1][0].s - 2 : Infinity;
    return f >= c[0].s - 2 && f < Math.min(c[c.length - 1].e + 10, next);
  });
  if (i < 0) return null;
  const chunk = CHUNKS[i];
  const pop = interpolate(f - chunk[0].s, [-2, 4], [0.85, 1], clamp);
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top: 1660, display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 18px', fontFamily: HEAD, fontWeight: 800, fontSize: 60,
          lineHeight: 1.15, textAlign: 'center', transform: `scale(${pop})`, textShadow: '0 4px 18px rgba(0,0,0,.65)',
        }}
      >
        {chunk.map((x, k) => {
          const on = f >= x.s - 1;
          const now = f >= x.s - 1 && f < x.e + 2;
          return (
            <span key={k} style={{ color: now ? C.teal : C.white, opacity: on ? 1 : 0.35 }}>
              {x.w.replace(/[“”"]/g, '"')}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const musicVolume = (f: number) => {
  const duck = VO_RANGES.some(([a, b]) => f >= a - 8 && f <= b + 8);
  const base = duck ? 0.13 : 0.3;
  return base * interpolate(f, [0, 12, TOTAL - 75, TOTAL - 5], [0, 1, 1, 0], clamp);
};

const SFX: [string, number, number][] = [
  ['pop', 4, 0.35], ['pop', 12, 0.25], ['pop', STARTS[0] + 147, 0.4],
  ['rewind', STARTS[1] - 6, 0.5],
  ['whoosh', STARTS[2] - 4, 0.4], ['pop', STARTS[2] + 48, 0.3], ['pop', STARTS[2] + 81, 0.3], ['pop', STARTS[2] + 108, 0.3],
  ['whoosh', STARTS[3] - 4, 0.4], ['swish', STARTS[3] + 36, 0.5], ['pop', STARTS[3] + 105, 0.3], ['pop', STARTS[3] + 156, 0.3],
  ['whoosh', STARTS[4] - 4, 0.4], ['pop', STARTS[4] + 84, 0.35], ['pop', STARTS[4] + 108, 0.35], ['pop', STARTS[4] + 135, 0.35],
  ['pop', STARTS[4] + 183, 0.35], ['ding', STARTS[4] + 297, 0.3],
  ['tick', STARTS[5], 0.45],
  ['ding', STARTS[6] + 8, 0.45], ['swish', STARTS[6] + 75 + 18, 0.4], ['swish', STARTS[6] + 75 + 40, 0.4],
  ['swish', STARTS[6] + 75 + 62, 0.4], ['swish', STARTS[6] + 75 + 80, 0.4], ['whoosh', STARTS[6] + 202, 0.35], ['whoosh', STARTS[6] + 275, 0.4],
  ['whoosh', STARTS[7] - 4, 0.4], ['pop', STARTS[7] + 51, 0.35], ['stamp', STARTS[7] + 193, 0.7], ['pop', STARTS[7] + 300, 0.35],
  ['whoosh', STARTS[8] - 4, 0.4], ['pop', STARTS[8] + 138, 0.35], ['pop', STARTS[8] + 201, 0.35], ['riser', STARTS[8] + 240, 0.45],
];


export const FlossPostDemo: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: C.night }}>
      {SCENES.map((Scene, i) => (
        <Sequence key={SECTIONS[i].id} from={STARTS[i]} durationInFrames={SECTIONS[i].len} name={SECTIONS[i].id}>
          <Scene />
        </Sequence>
      ))}
      <Captions />
      <Audio src={staticFile('music.mp3')} volume={musicVolume} />
      {VO.map((_, i) => (
        <Sequence key={`vo${i}`} from={STARTS[i] + VO_DELAY} name={`vo${i + 1}`}>
          <Audio src={staticFile(`vo/vo${i + 1}.mp3`)} volume={1} />
        </Sequence>
      ))}
      {SFX.map(([name, at, vol], i) => (
        <Sequence key={`sfx${i}`} from={Math.max(0, at)} durationInFrames={90} name={`sfx-${name}`}>
          <Audio src={staticFile(`sfx/${name}.mp3`)} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
