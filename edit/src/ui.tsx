import React from 'react';
import {
  AbsoluteFill, Easing, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig,
} from 'remotion';
import { BODY, C, HEAD } from './theme';

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const ease = Easing.bezier(0.22, 1, 0.36, 1);

/** Spring 0→1 starting at frame `at`. */
export const usePop = (at: number, damping = 14, stiffness = 140) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - at, fps, config: { damping, stiffness, mass: 0.8 } });
};

export const Background: React.FC<{ hue?: 'indigo' | 'teal' }> = ({ hue = 'indigo' }) => {
  const f = useCurrentFrame();
  const a = 20 + Math.sin(f / 90) * 12;
  const b = 80 + Math.cos(f / 110) * 10;
  const glow1 = hue === 'teal' ? '#0e5e66cc' : '#3532e8b0';
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${a}% 12%, ${glow1}, transparent 52%),
          radial-gradient(circle at ${b}% 88%, #ff5f8738, transparent 46%),
          radial-gradient(circle at 50% 50%, #1614a640, transparent 70%),
          linear-gradient(170deg, ${C.night} 0%, ${C.night2} 55%, ${C.night} 100%)`,
      }}
    >
      <AbsoluteFill
        style={{
          opacity: 0.07,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          backgroundPosition: `0 ${(f * 0.6) % 72}px`,
          maskImage: 'radial-gradient(circle at 50% 40%, black, transparent 75%)',
        }}
      />
    </AbsoluteFill>
  );
};

/** Phone mockup playing a pre-cut segment. top = y of the phone's top edge, w = screen width. */
export const Phone: React.FC<{
  src: string; top: number; w?: number; x?: number; dim?: number; rotate?: number; startFrom?: number;
  style?: React.CSSProperties;
}> = ({ src, top, w = 760, x = 540, dim = 0, rotate = 0, startFrom = 0, style }) => {
  const h = (w * 2340) / 1080;
  const bezel = w * 0.018;
  return (
    <div
      style={{
        position: 'absolute', left: x - w / 2 - bezel, top: top - bezel, width: w + bezel * 2, height: h + bezel * 2,
        borderRadius: w * 0.105, background: 'linear-gradient(145deg,#3a3a48,#111118 40%,#2a2a36)',
        padding: bezel, boxShadow: '0 60px 120px rgba(0,0,0,.55), 0 0 0 2px rgba(255,255,255,.08), 0 0 90px #3532e855',
        transform: `rotate(${rotate}deg)`, ...style,
      }}
    >
      <div style={{ width: w, height: h, borderRadius: w * 0.09, overflow: 'hidden', position: 'relative', background: '#000' }}>
        <OffthreadVideo src={staticFile(src)} startFrom={startFrom} muted style={{ width: '100%', height: '100%' }} />
        <AbsoluteFill style={{ background: `rgba(6,5,30,${dim})` }} />
      </div>
    </div>
  );
};

/** Darkens the top band so headlines stay legible over the phone. */
export const TopShade: React.FC<{ h?: number }> = ({ h = 520 }) => (
  <div
    style={{
      position: 'absolute', left: 0, right: 0, top: 0, height: h,
      background: `linear-gradient(${C.night} 0%, ${C.night}ee 45%, transparent 100%)`,
    }}
  />
);

export const BottomShade: React.FC = () => (
  <div
    style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, height: 420,
      background: `linear-gradient(transparent, ${C.night}f2 55%, ${C.night})`,
    }}
  />
);

/** Kicker + headline with a staggered word rise. */
export const Headline: React.FC<{
  kicker?: string; title: string; at?: number; top?: number; size?: number; accent?: string; align?: 'center' | 'left';
}> = ({ kicker, title, at = 0, top = 130, size = 74, accent, align = 'center' }) => {
  const f = useCurrentFrame();
  const words = title.split(' ');
  const k = interpolate(f - at, [0, 12], [0, 1], { ...clamp, easing: ease });
  return (
    <div style={{ position: 'absolute', top, left: 70, right: 70, textAlign: align }}>
      {kicker && (
        <div
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 12, fontFamily: HEAD, fontWeight: 800, fontSize: 26,
            letterSpacing: 5, color: C.teal, textTransform: 'uppercase', opacity: k,
            transform: `translateY(${(1 - k) * 16}px)`, marginBottom: 18,
            background: 'rgba(126,224,214,.1)', border: '1.5px solid rgba(126,224,214,.35)', borderRadius: 99, padding: '10px 22px',
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: 99, background: C.pink }} />
          {kicker}
        </div>
      )}
      <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: size, lineHeight: 1.08, color: C.white, letterSpacing: -1.5 }}>
        {words.map((w, i) => {
          const p = interpolate(f - at - 4 - i * 2.5, [0, 12], [0, 1], { ...clamp, easing: ease });
          const hl = accent && w.replace(/[^\w$%.’']/g, '').toLowerCase() === accent.toLowerCase();
          return (
            <span
              key={i}
              style={{
                display: 'inline-block', marginRight: size * 0.24, opacity: p,
                transform: `translateY(${(1 - p) * 40}px)`, filter: `blur(${(1 - p) * 8}px)`,
                color: hl ? C.pink : C.white,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** White info card that pops in. */
export const Card: React.FC<{
  at: number; x: number; y: number; w?: number; icon: string; title: string; sub?: string; rotate?: number; tint?: string;
}> = ({ at, x, y, w = 470, icon, title, sub, rotate = 0, tint = C.indigo }) => {
  const p = usePop(at, 13, 160);
  if (p <= 0.001) return null;
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, width: w, background: C.card, borderRadius: 30, padding: '22px 26px',
        display: 'flex', gap: 20, alignItems: 'center', boxShadow: '0 30px 60px rgba(5,4,40,.45)',
        transform: `translateY(${(1 - p) * 60}px) scale(${0.7 + 0.3 * p}) rotate(${rotate * p}deg)`, opacity: Math.min(1, p * 1.4),
      }}
    >
      <div
        style={{
          width: 74, height: 74, flex: '0 0 74px', borderRadius: 22, background: `${tint}18`, display: 'grid',
          placeItems: 'center', fontSize: 40,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 34, color: C.ink, lineHeight: 1.1 }}>{title}</div>
        {sub && <div style={{ fontFamily: BODY, fontSize: 24, color: '#55537a', marginTop: 6, lineHeight: 1.25 }}>{sub}</div>}
      </div>
    </div>
  );
};

export const Pill: React.FC<{
  at: number; children: React.ReactNode; bg?: string; color?: string; size?: number; style?: React.CSSProperties;
}> = ({ at, children, bg = C.white, color = C.ink, size = 30, style }) => {
  const p = usePop(at, 12, 170);
  return (
    <div
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 12, background: bg, color, fontFamily: HEAD, fontWeight: 800,
        fontSize: size, borderRadius: 99, padding: `${size * 0.45}px ${size * 0.8}px`, boxShadow: '0 18px 40px rgba(0,0,0,.35)',
        transform: `scale(${p})`, opacity: Math.min(1, p * 1.5), ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Small source line for on-screen proof. */
export const Source: React.FC<{ at: number; text: string; bottom?: number }> = ({ at, text, bottom = 300 }) => {
  const f = useCurrentFrame();
  const o = interpolate(f - at, [0, 10], [0, 1], clamp);
  return (
    <div
      style={{
        position: 'absolute', left: 60, right: 60, bottom, textAlign: 'center', fontFamily: BODY, fontSize: 22,
        color: 'rgba(255,255,255,.62)', opacity: o, letterSpacing: 0.2,
      }}
    >
      {text}
    </div>
  );
};

/** Section entry: quick zoom/blur settle. */
export const Enter: React.FC<{ children: React.ReactNode; dur?: number }> = ({ children, dur = 9 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, dur], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill style={{ transform: `scale(${1.08 - 0.08 * p})`, filter: `blur(${(1 - p) * 14}px)`, opacity: 0.2 + 0.8 * p }}>
      {children}
    </AbsoluteFill>
  );
};
