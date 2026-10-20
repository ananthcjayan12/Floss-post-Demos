import React from 'react';
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame,
} from 'remotion';
import walk from './walk.json';
import { BODY, C, FPS, HEAD } from './theme';
import { Background, Headline, Pill, clamp, ease, usePop } from './ui';
import { useFonts } from './fonts';
import w1 from '../public/wvo/w1.json';
import w2 from '../public/wvo/w2.json';
import w3 from '../public/wvo/w3.json';
import w4 from '../public/wvo/w4.json';
import w5 from '../public/wvo/w5.json';
import w6 from '../public/wvo/w6.json';
import w7 from '../public/wvo/w7.json';
import w8 from '../public/wvo/w8.json';
import w9 from '../public/wvo/w9.json';

type Key = [number, number];
type Tap = { t: number; x: number; y: number; label: string; w?: number; h?: number; lead?: number };
type Step = {
  id: string; n?: number; title?: string; dur: number; keys?: number[][]; taps?: Tap[];
  pills?: { at: number; text: string; swatch?: string }[];
};

const STEPS = walk.steps as Step[];
const VO = [w1, w2, w3, w4, w5, w6, w7, w8, w9] as { w: string; s: number; e: number }[][];
const VO_DELAY = 9;
const LENS = STEPS.map((s) => Math.round(s.dur * FPS));
const STARTS = LENS.map((_, i) => LENS.slice(0, i).reduce((a, b) => a + b, 0));
export const WALK_TOTAL = LENS.reduce((a, b) => a + b, 0);

/* ---------- time remap helpers ---------- */
const srcToOut = (keys: Key[], t: number) => {
  for (let i = 1; i < keys.length; i++) {
    const [s0, o0] = keys[i - 1];
    const [s1, o1] = keys[i];
    if (t <= s1) return o0 + ((t - s0) / (s1 - s0)) * (o1 - o0);
  }
  return keys[keys.length - 1][1];
};
const outToSrc = (keys: Key[], o: number) => {
  for (let i = 1; i < keys.length; i++) {
    const [s0, o0] = keys[i - 1];
    const [s1, o1] = keys[i];
    if (o <= o1) return s0 + ((o - o0) / (o1 - o0)) * (s1 - s0);
  }
  return keys[keys.length - 1][0];
};
const kbOpen = (src: number) => walk.kb.some(([a, b]) => src >= a && src <= b);

/* ---------- layout ---------- */
const PHONE_W = 900;
const SCALE = PHONE_W / 1080;
const VIEW_TOP = 290;
const PAN_DOWN = 640; // source px hidden above the view when the keyboard is closed

const Header: React.FC<{ step: Step }> = ({ step }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 10], [0, 1], { ...clamp, easing: ease });
  return (
    <div
      style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: 330, padding: '78px 70px 0',
        background: `linear-gradient(${C.night} 0%, ${C.night} 70%, transparent 100%)`,
      }}
    >
      <div style={{ display: 'flex', gap: 10, marginBottom: 26 }}>
        {[1, 2, 3, 4, 5, 6].map((i) => {
          const done = step.n ? i < step.n : true;
          const cur = step.n === i;
          return (
            <div key={i} style={{ flex: 1, height: 10, borderRadius: 99, background: 'rgba(255,255,255,.15)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%', borderRadius: 99, background: cur ? C.pink : C.teal,
                  width: done ? '100%' : cur ? `${p * 100}%` : '0%',
                }}
              />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 26, opacity: p, transform: `translateY(${(1 - p) * 24}px)` }}>
        <div
          style={{
            width: 104, height: 104, flex: '0 0 104px', borderRadius: 30, background: step.n ? C.pink : C.teal,
            display: 'grid', placeItems: 'center', fontFamily: HEAD, fontWeight: 800, fontSize: step.n ? 60 : 50, color: C.white,
          }}
        >
          {step.n ?? '☀️'}
        </div>
        <div>
          <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 26, letterSpacing: 4, color: C.teal }}>
            {step.n ? `STEP ${step.n} OF 6` : 'THEN, EVERY DAY'}
          </div>
          <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 60, color: C.white, letterSpacing: -1, lineHeight: 1.1 }}>
            {step.title}
          </div>
        </div>
      </div>
    </div>
  );
};

const TapMark: React.FC<{ tap: Tap; at: number; panY: number }> = ({ tap, at, panY }) => {
  const f = useCurrentFrame();
  const lead = Math.round((tap.lead ?? 0.7) * FPS);
  const start = at - lead;
  const end = at + 14;
  if (f < start - 2 || f > end + 8) return null;
  const inP = interpolate(f, [start, start + 8], [0, 1], { ...clamp, easing: ease });
  const outP = interpolate(f, [end, end + 8], [1, 0], clamp);
  const o = inP * outP;
  const press = interpolate(f, [at - 4, at, at + 6], [1, 0.82, 1], clamp);
  const ripple = interpolate(f, [at, at + 14], [0, 1], clamp);
  const cx = 90 + tap.x * SCALE;
  const cy = VIEW_TOP + (tap.y - panY) * SCALE;
  const isBox = !!tap.w;
  const bw = (tap.w ?? 0) * SCALE;
  const bh = (tap.h ?? 0) * SCALE;
  const labelAbove = cy > 1000;
  const labelY = labelAbove ? cy - (isBox ? bh / 2 : 70) - 96 : cy + (isBox ? bh / 2 : 70) + 24;
  return (
    <>
      {isBox ? (
        <div
          style={{
            position: 'absolute', left: cx - bw / 2, top: cy - bh / 2, width: bw, height: bh, borderRadius: 28,
            border: `5px solid ${C.teal}`, boxShadow: `0 0 0 9999px rgba(6,5,30,${0.45 * o}), 0 0 40px ${C.teal}`, opacity: o,
          }}
        />
      ) : (
        <>
          <div
            style={{
              position: 'absolute', left: cx - 62, top: cy - 62, width: 124, height: 124, borderRadius: 999, opacity: o,
              border: `6px solid ${C.teal}`, background: 'rgba(126,224,214,.22)', transform: `scale(${press})`,
              boxShadow: `0 0 40px ${C.teal}`,
            }}
          />
          <div
            style={{
              position: 'absolute', left: cx - 62, top: cy - 62, width: 124, height: 124, borderRadius: 999,
              border: `4px solid ${C.white}`, opacity: o * (1 - ripple), transform: `scale(${1 + ripple * 1.2})`,
            }}
          />
        </>
      )}
      <div
        style={{
          position: 'absolute', top: labelY, left: Math.min(Math.max(cx - 300, 40), 1080 - 640), width: 600,
          display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - inP) * 14}px)`,
        }}
      >
        <div
          style={{
            background: C.white, color: C.ink, fontFamily: HEAD, fontWeight: 800, fontSize: 36, borderRadius: 99,
            padding: '16px 30px', boxShadow: '0 16px 40px rgba(0,0,0,.45)', whiteSpace: 'nowrap',
          }}
        >
          {isBox ? '' : '👆 '}{tap.label}
        </div>
      </div>
    </>
  );
};

const StepScene: React.FC<{ step: Step }> = ({ step }) => {
  const f = useCurrentFrame();
  const keys = step.keys as Key[];
  // Pan up while the keyboard is open, averaged over neighbouring frames for a smooth glide.
  let pan = 0;
  for (let d = -8; d <= 8; d++) {
    const o = Math.min(Math.max((f + d) / FPS, 0), step.dur);
    pan += kbOpen(outToSrc(keys, o)) ? 0 : PAN_DOWN;
  }
  pan /= 17;
  const h = 2340 * SCALE;
  const pills = step.pills ?? [];
  const stack = step.id === 's7';
  const shown = pills.filter((p) => f >= VO_DELAY + p.at * FPS);
  return (
    <AbsoluteFill>
      <Background />
      <div
        style={{
          position: 'absolute', left: 90 - 14, top: VIEW_TOP - pan * SCALE - 14, width: PHONE_W + 28, height: h + 28,
          borderRadius: 96, padding: 14, background: 'linear-gradient(145deg,#3a3a48,#111118 40%,#2a2a36)',
          boxShadow: '0 50px 110px rgba(0,0,0,.55), 0 0 0 2px rgba(255,255,255,.08), 0 0 90px #3532e855',
        }}
      >
        <div style={{ width: PHONE_W, height: h, borderRadius: 82, overflow: 'hidden', background: '#000' }}>
          <OffthreadVideo src={staticFile(`wseg/${step.id}.mp4`)} muted style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
      {(step.taps ?? []).map((t, i) => (
        <TapMark key={i} tap={t} at={Math.round(srcToOut(keys, t.t) * FPS)} panY={pan} />
      ))}
      <div
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: 330,
          background: `linear-gradient(transparent, ${C.night}f0 35%, ${C.night})`,
        }}
      />
      <Header step={step} />
      <div
        style={{
          position: 'absolute', top: stack ? 420 : 330, left: 0, right: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 18,
        }}
      >
        {(stack ? shown : shown.slice(-1)).map((p) => (
          <Pill key={p.text} at={Math.round(VO_DELAY + p.at * FPS)} size={34} bg={stack ? C.white : C.pink} color={stack ? C.ink : C.white}>
            {p.swatch && <span style={{ width: 40, height: 40, borderRadius: 12, background: p.swatch, border: '3px solid #fff' }} />}
            {p.text}
          </Pill>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- intro & call to action ---------- */
const SLIDES = [1, 2, 3, 4, 5].map((i) => staticFile(`slides/slide${i}.jpg`));
const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const listAt = VO_DELAY + Math.round(5.6 * FPS);
  const move = interpolate(f, [listAt - 12, listAt + 8], [0, 1], { ...clamp, easing: ease });
  const titles = STEPS.filter((s) => s.n).map((s) => s.title as string);
  return (
    <AbsoluteFill>
      <Background />
      <Headline kicker="All inside WhatsApp" title="Your first carousel in 6 simple steps" at={0} top={110} size={70} accent="6" />
      {SLIDES.map((src, i) => {
        const p = usePop(6 + i * 4, 13, 120);
        const o = i - 2;
        const wdt = 380 - move * 170;
        return (
          <Img
            key={i}
            src={src}
            style={{
              position: 'absolute', width: wdt, height: wdt * (1548 / 1296), left: 540 - wdt / 2 + o * (150 - move * 95) * p,
              top: 640 + move * 720 + Math.abs(o) * 30 * p, borderRadius: 20, zIndex: 10 - Math.abs(o),
              transform: `rotate(${o * 8 * p}deg) scale(${0.5 + 0.5 * p})`, opacity: Math.min(1, p * 1.5),
              boxShadow: '0 30px 70px rgba(0,0,0,.5)',
            }}
          />
        );
      })}
      <div style={{ position: 'absolute', top: 470, left: 150, right: 150, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {titles.map((t, i) => {
          const p = interpolate(f, [listAt + i * 5, listAt + i * 5 + 10], [0, 1], { ...clamp, easing: ease });
          return (
            <div
              key={t}
              style={{
                display: 'flex', alignItems: 'center', gap: 24, opacity: p, transform: `translateX(${(1 - p) * -60}px)`,
                fontFamily: HEAD, fontWeight: 800, fontSize: 44, color: C.white,
              }}
            >
              <span
                style={{
                  width: 72, height: 72, borderRadius: 22, background: i === 5 ? C.pink : 'rgba(255,255,255,.12)',
                  border: '2px solid rgba(255,255,255,.25)', display: 'grid', placeItems: 'center', fontSize: 36,
                }}
              >
                {i + 1}
              </span>
              {t}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const logo = usePop(0, 12, 130);
  const btn = usePop(VO_DELAY + Math.round(1.7 * FPS), 10, 160);
  const qr = usePop(VO_DELAY + Math.round(3.0 * FPS), 13, 130);
  const pulse = f > 90 ? 1 + Math.max(0, Math.sin((f - 90) / 7)) * 0.035 : 1;
  return (
    <AbsoluteFill>
      <Background />
      <div style={{ position: 'absolute', top: 130, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 22, background: C.white, borderRadius: 30, padding: '18px 34px 18px 22px',
            transform: `scale(${logo})`, boxShadow: '0 24px 60px rgba(0,0,0,.4)',
          }}
        >
          <Img src={staticFile('logo.svg')} style={{ width: 96, height: 85 }} />
          <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 52, color: C.indigo, letterSpacing: -1 }}>FlossPost</div>
        </div>
      </div>
      <Headline title="Your clinic's turn." at={4} top={340} size={90} accent="turn." />
      <div
        style={{
          position: 'absolute', top: 540, left: 0, right: 0, display: 'flex', justifyContent: 'center',
          transform: `scale(${btn * pulse})`, opacity: Math.min(1, btn * 1.5),
        }}
      >
        <div
          style={{
            background: C.wa, color: '#04361a', fontFamily: HEAD, fontWeight: 800, fontSize: 56, borderRadius: 99,
            padding: '30px 60px', boxShadow: '0 30px 70px rgba(37,211,102,.35)',
          }}
        >
          Send “Hi” on WhatsApp
        </div>
      </div>
      <div
        style={{
          position: 'absolute', top: 760, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 40,
          transform: `translateY(${(1 - qr) * 60}px)`, opacity: qr,
        }}
      >
        <div style={{ background: C.white, borderRadius: 30, padding: 20 }}>
          <Img src={staticFile('qr.svg')} style={{ width: 300, height: 300 }} />
        </div>
        <div style={{ fontFamily: HEAD, color: C.white }}>
          <div style={{ fontSize: 30, fontWeight: 700, color: C.teal }}>Scan to chat</div>
          <div style={{ fontSize: 46, fontWeight: 800, marginTop: 8 }}>+91 82813</div>
          <div style={{ fontSize: 46, fontWeight: 800 }}>62708</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 1180, left: 60, right: 60, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
        <Pill at={110} size={30}>🎁 Free demo carousel</Pill>
        <Pill at={116} size={30}>⏱ Ready in about 5 minutes</Pill>
        <Pill at={122} size={30} bg={C.pink} color={C.white}>No card needed</Pill>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- captions & audio ---------- */
const WORDS = VO.flatMap((words, i) =>
  words.map((x) => ({ w: x.w, s: STARTS[i] + VO_DELAY + x.s * FPS, e: STARTS[i] + VO_DELAY + x.e * FPS, sec: i })),
);
const CHUNKS: (typeof WORDS)[] = [];
let cur: typeof WORDS = [];
WORDS.forEach((x, idx) => {
  cur.push(x);
  const next = WORDS[idx + 1];
  if (/[.,?!:]["”]?$/.test(x.w) || cur.length >= 4 || !next || next.sec !== x.sec) {
    CHUNKS.push(cur);
    cur = [];
  }
});
const VO_RANGES = VO.map((words, i) => [STARTS[i] + VO_DELAY, STARTS[i] + VO_DELAY + words[words.length - 1].e * FPS]);

const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const i = CHUNKS.findIndex((c, k) => {
    const next = CHUNKS[k + 1] ? CHUNKS[k + 1][0].s - 2 : Infinity;
    return f >= c[0].s - 2 && f < Math.min(c[c.length - 1].e + 10, next);
  });
  if (i < 0) return null;
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top: 1700, display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 16px', fontFamily: HEAD, fontWeight: 800,
          fontSize: 56, lineHeight: 1.15, textShadow: '0 4px 18px rgba(0,0,0,.65)',
        }}
      >
        {CHUNKS[i].map((x, k) => (
          <span key={k} style={{ color: f >= x.s - 1 && f < x.e + 2 ? C.teal : C.white, opacity: f >= x.s - 1 ? 1 : 0.35 }}>
            {x.w.replace(/[“”]/g, '"')}
          </span>
        ))}
      </div>
    </div>
  );
};

const musicVolume = (f: number) => {
  const duck = VO_RANGES.some(([a, b]) => f >= a - 8 && f <= b + 8);
  return (duck ? 0.11 : 0.26) * interpolate(f, [0, 12, WALK_TOTAL - 75, WALK_TOTAL - 5], [0, 1, 1, 0], clamp);
};

const SFX: [string, number, number][] = [
  ...STARTS.slice(1).map((s): [string, number, number] => ['whoosh', s - 4, 0.25]),
  ...STEPS.flatMap((s, i) =>
    (s.taps ?? []).map((t): [string, number, number] => ['pop', STARTS[i] + Math.round(srcToOut(s.keys as Key[], t.t) * FPS) - 2, 0.35]),
  ),
  ['ding', STARTS[6] + Math.round(4.4 * FPS), 0.4],
  ['riser', STARTS[8] - 50, 0.35],
];

export const FlossPostWalkthrough: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: C.night }}>
      {STEPS.map((s, i) => (
        <Sequence key={s.id} from={STARTS[i]} durationInFrames={LENS[i]} name={s.id}>
          {s.id === 'intro' ? <Intro /> : s.id === 'cta' ? <Cta /> : <StepScene step={s} />}
        </Sequence>
      ))}
      <Captions />
      <Audio src={staticFile('music_walk.mp3')} volume={musicVolume} />
      {VO.map((_, i) => (
        <Sequence key={`vo${i}`} from={STARTS[i] + VO_DELAY} name={`vo${i + 1}`}>
          <Audio src={staticFile(`wvo/w${i + 1}.mp3`)} />
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
