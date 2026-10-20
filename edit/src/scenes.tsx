import React from 'react';
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { BODY, C, HEAD, VO_DELAY } from './theme';
import {
  Background, BottomShade, Card, Enter, Headline, Phone, Pill, Source, TopShade, clamp, ease, usePop,
} from './ui';

/** Local frame for a narration word time (seconds into that section's clip). */
const w = (sec: number) => VO_DELAY + Math.round(sec * 30);
const SLIDES = [1, 2, 3, 4, 5].map((i) => staticFile(`slides/slide${i}.jpg`));
const SLIDE_RATIO = 1548 / 1296;

const FastBadge: React.FC<{ speed: string; top: number }> = ({ speed, top }) => (
  <div
    style={{
      position: 'absolute', right: 120, top, fontFamily: HEAD, fontWeight: 800, fontSize: 24, color: C.white,
      background: 'rgba(10,9,48,.75)', border: '1.5px solid rgba(255,255,255,.25)', borderRadius: 99, padding: '8px 18px',
    }}
  >
    ⏩ {speed}
  </div>
);

/* 1 · Hook ------------------------------------------------------------------------------------- */
export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const big = usePop(w(0), 11, 120);
  const drift = interpolate(f, [0, 192], [0, 1]);
  return (
    <AbsoluteFill>
      <Background />
      <div style={{ position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center' }}>
        <div
          style={{
            fontFamily: HEAD, fontWeight: 800, fontSize: 210, lineHeight: 0.9, color: C.white, letterSpacing: -6,
            transform: `scale(${0.6 + 0.4 * big})`, opacity: big,
          }}
        >
          5 <span style={{ color: C.pink }}>min</span>
        </div>
        <div
          style={{
            fontFamily: HEAD, fontWeight: 700, fontSize: 44, color: C.muted, marginTop: 14,
            opacity: interpolate(f, [w(0.9), w(1.3)], [0, 1], clamp),
          }}
        >
          from “Hi” to a finished carousel
        </div>
      </div>
      {/* fanned carousel */}
      {SLIDES.map((src, i) => {
        const p = usePop(4 + i * 4, 13, 120);
        const o = i - 2;
        const width = 400;
        return (
          <Img
            key={i}
            src={src}
            style={{
              position: 'absolute', width, height: width * SLIDE_RATIO, left: 540 - width / 2 + o * 150 * p,
              top: 560 + Math.abs(o) * 34 * p - drift * 20, borderRadius: 22, zIndex: 10 - Math.abs(o),
              transform: `rotate(${o * 9 * p}deg) scale(${(0.5 + 0.5 * p) * (1 + drift * 0.04)})`, opacity: Math.min(1, p * 1.5),
              boxShadow: '0 40px 80px rgba(0,0,0,.5)',
            }}
          />
        );
      })}
      <div style={{ position: 'absolute', top: 1235, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 22 }}>
        <Pill at={w(1.6)} size={34}>🕐 15:13 → 15:18</Pill>
        <Pill at={w(4.7)} bg={C.wa} color="#04361a" size={34}>On WhatsApp</Pill>
      </div>
      <Source at={w(1.8)} text="Real chat timestamps from this demo" bottom={600} />
    </AbsoluteFill>
  );
};

/* 2 · Rewind ----------------------------------------------------------------------------------- */
export const Rewind: React.FC = () => {
  const f = useCurrentFrame();
  const scan = f < 33 ? 1 : 0;
  return (
    <AbsoluteFill>
      <Background />
      <Sequence durationInFrames={33}>
        <Phone src="seg/rewind.mp4" top={430} />
      </Sequence>
      <Sequence from={33}>
        <Phone src="seg/s2.mp4" top={430} />
      </Sequence>
      {scan === 1 && (
        <AbsoluteFill
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,.06) 0 2px, transparent 2px 6px)',
            background: 'rgba(53,50,232,.18)',
          }}
        >
          <div style={{ position: 'absolute', top: 860, left: 0, right: 0, textAlign: 'center', fontSize: 180, color: C.white, opacity: 0.9 }}>
            ◀◀
          </div>
        </AbsoluteFill>
      )}
      <TopShade h={470} />
      <Headline kicker="How it works" title="Just one message." at={w(0)} top={90} size={72} />
      <div style={{ position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 18 }}>
        <Pill at={w(1.2)} bg="rgba(255,95,135,.16)" color={C.pink} size={28} style={{ border: `2px solid ${C.pink}` }}>✕ No app</Pill>
        <Pill at={w(1.9)} bg="rgba(255,95,135,.16)" color={C.pink} size={28} style={{ border: `2px solid ${C.pink}` }}>✕ No login</Pill>
        <Pill at={w(4.2)} bg={C.wa} color="#04361a" size={28}>Send “Hi” 👋</Pill>
      </div>
      <BottomShade />
    </AbsoluteFill>
  );
};

/* 3 · Setup ------------------------------------------------------------------------------------ */
export const Setup: React.FC = () => {
  const f = useCurrentFrame();
  const steps: [string, number][] = [['Clinic name', 1.4], ['Website', 2.5], ['Logo', 3.4]];
  return (
    <AbsoluteFill>
      <Background />
      <Enter>
        <Phone src="seg/s3.mp4" top={430} />
        <FastBadge speed="4.6× speed" top={470} />
      </Enter>
      <TopShade h={470} />
      <Headline kicker="Step 1 · Set up" title="Three answers. That's it." at={0} top={90} size={68} />
      <div style={{ position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 16 }}>
        {steps.map(([label, t], i) => {
          const on = interpolate(f, [w(t), w(t) + 8], [0, 1], clamp);
          return (
            <div
              key={label}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, fontFamily: HEAD, fontWeight: 800, fontSize: 28,
                padding: '14px 24px', borderRadius: 99, transform: `scale(${1 + on * 0.06 - (on === 1 ? 0.06 : 0)})`,
                background: on > 0.5 ? C.white : 'rgba(255,255,255,.08)', color: on > 0.5 ? C.ink : 'rgba(255,255,255,.55)',
                border: '2px solid rgba(255,255,255,.2)',
              }}
            >
              <span
                style={{
                  width: 38, height: 38, borderRadius: 99, display: 'grid', placeItems: 'center', fontSize: 22,
                  background: on > 0.5 ? C.indigo : 'rgba(255,255,255,.15)', color: C.white,
                }}
              >
                {on > 0.5 ? '✓' : i + 1}
              </span>
              {label}
            </div>
          );
        })}
      </div>
      <BottomShade />
    </AbsoluteFill>
  );
};

/* 4 · Brand ------------------------------------------------------------------------------------ */
export const Brand: React.FC = () => {
  const f = useCurrentFrame();
  const sw = usePop(w(1.0), 12, 120);
  const push = interpolate(f, [0, 219], [760, 800]);
  return (
    <AbsoluteFill>
      <Background />
      <Enter>
        <Phone src="seg/s4.mp4" top={1620 - (push * 2340) / 1080} w={push} />
        <FastBadge speed="2× speed" top={560} />
      </Enter>
      <TopShade />
      <Headline kicker="Step 2 · Brand" title="Your brand, automatically." at={0} top={90} size={68} accent="brand," />
      {/* colour swatch */}
      <div
        style={{
          position: 'absolute', left: 60, top: 600, width: 420, background: C.card, borderRadius: 34, padding: 24,
          boxShadow: '0 30px 70px rgba(0,0,0,.45)', opacity: Math.min(1, sw * 1.4),
          transform: `translate(${(1 - sw) * 240}px, ${(1 - sw) * 200}px) scale(${0.5 + 0.5 * sw}) rotate(${-4 * sw}deg)`,
        }}
      >
        <div style={{ height: 190, borderRadius: 22, background: C.sand, position: 'relative', overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(110deg, transparent 30%, rgba(255,255,255,.55) 50%, transparent 70%)`,
              transform: `translateX(${interpolate(f, [w(1.2), w(2.2)], [-420, 420], clamp)}px)`,
            }}
          />
        </div>
        <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 40, color: C.ink, marginTop: 18 }}>#E7D9BD</div>
        <div style={{ fontFamily: BODY, fontSize: 24, color: '#55537a', marginTop: 4 }}>Picked from your logo</div>
      </div>
      <div style={{ position: 'absolute', right: 60, top: 1110, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16 }}>
        <Pill at={w(3.3)} size={32}>🇬🇧 English (UK)</Pill>
        <Pill at={w(5.0)} bg={C.pink} color={C.white} size={28}>or mix two: English + Malayalam</Pill>
      </div>
      <BottomShade />
    </AbsoluteFill>
  );
};

/* 5 · Facts ------------------------------------------------------------------------------------ */
export const Facts: React.FC = () => {
  const f = useCurrentFrame();
  const dim = interpolate(f, [w(2.4), w(3)], [0, 0.45], clamp);
  const ok = usePop(w(9.7), 11, 150);
  return (
    <AbsoluteFill>
      <Background />
      <Enter>
        <Phone src="seg/s5.mp4" top={-27} dim={dim} />
      </Enter>
      <TopShade />
      <Headline kicker="Step 3 · Your facts" title="It reads your website." at={0} top={90} size={68} accent="website." />
      <Card at={w(2.6)} x={50} y={470} icon="📍" title="6 clinic locations" sub="Earl's Court, Knightsbridge, Barnet…" rotate={-2} />
      <Card at={w(3.4)} x={560} y={640} icon="🦷" title="Your services" sub="Hygiene, crowns, emergency care…" rotate={2} />
      <Card at={w(4.3)} x={50} y={810} icon="📞" title="+44 20 3982 8602" sub="Booking number" rotate={-1.5} />
      <Card at={w(5.9)} x={560} y={980} icon="⭐" title="4.9 stars" sub="from 1,952 reviews" rotate={2} tint={C.pink} />
      <div
        style={{
          position: 'absolute', top: 1220, left: 0, right: 0, display: 'flex', justifyContent: 'center',
          transform: `scale(${ok})`, opacity: Math.min(1, ok * 1.5),
        }}
      >
        <div
          style={{
            background: C.wa, color: '#04361a', fontFamily: HEAD, fontWeight: 800, fontSize: 40, borderRadius: 26,
            padding: '24px 40px', boxShadow: '0 30px 60px rgba(0,0,0,.45)', textAlign: 'center',
          }}
        >
          ✓ You confirm every fact
          <div style={{ fontSize: 26, fontWeight: 700, opacity: 0.8, marginTop: 4 }}>Nothing is made up</div>
        </div>
      </div>
      <Source at={w(2.6)} text="Pulled automatically from zental.uk during this chat" bottom={330} />
      <BottomShade />
    </AbsoluteFill>
  );
};

/* 6 · Wait ------------------------------------------------------------------------------------- */
export const Wait: React.FC = () => {
  const f = useCurrentFrame();
  const hand = interpolate(f, [0, 60], [0, 1080], { ...clamp, easing: ease });
  const p = usePop(2, 12, 160);
  return (
    <AbsoluteFill>
      <Background />
      <Phone src="seg/s6.mp4" top={360} w={600} dim={0.25} />
      <TopShade h={420} />
      <div
        style={{
          position: 'absolute', top: 110, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30,
          transform: `scale(${p})`,
        }}
      >
        <div style={{ width: 150, height: 150, borderRadius: 99, border: `10px solid ${C.white}`, position: 'relative' }}>
          <div
            style={{
              position: 'absolute', left: 60, top: 18, width: 10, height: 52, background: C.pink, borderRadius: 9,
              transformOrigin: '5px 52px', transform: `rotate(${hand}deg)`,
            }}
          />
          <div style={{ position: 'absolute', left: 57, top: 57, width: 16, height: 16, borderRadius: 99, background: C.white }} />
        </div>
        <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 80, color: C.white, lineHeight: 1 }}>
          ~3 minutes
          <div style={{ fontSize: 40, color: C.teal }}>later…</div>
        </div>
      </div>
      <BottomShade />
    </AbsoluteFill>
  );
};

/* 7 · Payoff ----------------------------------------------------------------------------------- */
const SlideSwipe: React.FC = () => {
  // local frames: section frame - 75
  const f = useCurrentFrame();
  const marks = [25, 47, 69, 87];
  let prog = 0;
  marks.forEach((m) => (prog += interpolate(f, [m - 9, m], [0, 1], { ...clamp, easing: ease })));
  const W = 900;
  const H = W * SLIDE_RATIO;
  const zoom = interpolate(f, [92, 125], [1, 1.9], { ...clamp, easing: ease });
  const zoomY = interpolate(f, [92, 125], [0, -H * 0.42], { ...clamp, easing: ease });
  const labels: [number, string][] = [[3, '5 slides'], [24, 'In your colours'], [57, 'Your logo'], [90, 'Your real contact details']];
  const active = labels.filter(([t]) => f >= t).pop();
  return (
    <AbsoluteFill>
      <Background />
      <div style={{ position: 'absolute', top: 470, left: 90, width: W, height: H, overflow: 'visible' }}>
        {SLIDES.map((src, i) => {
          const off = (i - prog) * (W + 40);
          const s = 1 - Math.min(1, Math.abs(i - prog)) * 0.12;
          const isLast = i === 4;
          return (
            <div
              key={i}
              style={{
                position: 'absolute', left: off, top: 0, width: W, height: H, borderRadius: 32, overflow: 'hidden',
                transform: `scale(${s})`, boxShadow: '0 50px 100px rgba(0,0,0,.55)',
              }}
            >
              <Img
                src={src}
                style={{
                  width: '100%', height: '100%',
                  transform: isLast ? `translateY(${zoomY}px) scale(${zoom})` : `scale(${1.04 + 0.02 * Math.sin(f / 20)})`,
                  transformOrigin: '50% 100%',
                }}
              />
            </div>
          );
        })}
      </div>
      {/* page dots */}
      <div style={{ position: 'absolute', top: 470 + H + 24, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 12 }}>
        {SLIDES.map((_, i) => (
          <div
            key={i}
            style={{
              width: Math.round(prog) === i ? 40 : 14, height: 14, borderRadius: 99,
              background: Math.round(prog) === i ? C.pink : 'rgba(255,255,255,.35)',
            }}
          />
        ))}
      </div>
      <TopShade h={440} />
      <Headline kicker="Delivered in WhatsApp" title="Your carousel is ready." at={-75} top={90} size={68} />
      {active && (
        <div key={active[1]} style={{ position: 'absolute', top: 330, left: 0, right: 0, textAlign: 'center' }}>
          <Pill at={active[0]} bg={C.pink} color={C.white} size={34}>✓ {active[1]}</Pill>
        </div>
      )}
    </AbsoluteFill>
  );
};

const StatCard: React.FC = () => {
  const f = useCurrentFrame(); // local: section frame - 278
  const card = usePop(0, 14, 120);
  const bars: [string, number, string][] = [['Carousels', 0.55, C.pink], ['Reels', 0.52, '#9b99ff'], ['Images', 0.37, '#9b99ff']];
  const posts = Math.round(interpolate(f, [w(13.4) - 278 - 10, w(14.4) - 278], [0, 35], { ...clamp, easing: ease }));
  return (
    <AbsoluteFill>
      <Background />
      {/* drifting slide wall */}
      <div style={{ position: 'absolute', top: 160, left: -200 - f * 0.8, display: 'flex', gap: 30, opacity: 0.35, filter: 'blur(3px)' }}>
        {[...SLIDES, ...SLIDES].map((src, i) => (
          <Img key={i} src={src} style={{ width: 420, height: 420 * SLIDE_RATIO, borderRadius: 24 }} />
        ))}
      </div>
      <div style={{ position: 'absolute', top: 760, left: 100 + f * 0.6 - 300, display: 'flex', gap: 30, opacity: 0.25, filter: 'blur(3px)' }}>
        {[...SLIDES].reverse().concat(SLIDES).map((src, i) => (
          <Img key={i} src={src} style={{ width: 420, height: 420 * SLIDE_RATIO, borderRadius: 24 }} />
        ))}
      </div>
      <AbsoluteFill style={{ background: 'rgba(10,9,48,.55)' }} />
      <div
        style={{
          position: 'absolute', left: 70, right: 70, top: 300, background: C.card, borderRadius: 44, padding: '54px 56px',
          boxShadow: '0 50px 110px rgba(0,0,0,.55)', transform: `translateY(${(1 - card) * 120}px) scale(${0.85 + 0.15 * card})`,
          opacity: Math.min(1, card * 1.4),
        }}
      >
        <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 26, letterSpacing: 4, color: C.indigo, textTransform: 'uppercase' }}>
          Instagram study · {posts}M posts
        </div>
        <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 62, color: C.ink, lineHeight: 1.08, marginTop: 16, letterSpacing: -1 }}>
          Carousels are the <span style={{ color: C.pink }}>most engaging</span> format
        </div>
        <div style={{ marginTop: 44, display: 'flex', flexDirection: 'column', gap: 26 }}>
          {bars.map(([label, v, col], i) => {
            const g = interpolate(f, [20 + i * 8, 50 + i * 8], [0, 1], { ...clamp, easing: ease });
            return (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: HEAD, fontWeight: 800, fontSize: 32, color: C.ink }}>
                  <span>{label}</span>
                  <span style={{ color: i === 0 ? C.pink : '#55537a' }}>{(v * g).toFixed(2)}%</span>
                </div>
                <div style={{ height: 34, borderRadius: 99, background: '#ecebf7', marginTop: 10, overflow: 'hidden' }}>
                  <div style={{ width: `${(v / 0.6) * 100 * g}%`, height: '100%', borderRadius: 99, background: col }} />
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ fontFamily: BODY, fontSize: 24, color: '#6b6990', marginTop: 34 }}>Average engagement rate per post, 2025</div>
      </div>
      <Source at={20} text="Source: Socialinsider Instagram Benchmarks 2026 · 35M posts from 447,613 pages" bottom={330} />
    </AbsoluteFill>
  );
};

export const Payoff: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={78}>
      <Background />
      <Phone src="seg/s7a.mp4" top={-27} />
      <TopShade />
      <Headline kicker="Delivered in WhatsApp" title="Your carousel is ready." at={0} top={90} size={68} />
      <BottomShade />
    </Sequence>
    <Sequence from={75} durationInFrames={131}>
      <Enter dur={7}>
        <SlideSwipe />
      </Enter>
    </Sequence>
    <Sequence from={205} durationInFrames={74}>
      <Enter dur={7}>
        <Background />
        <Phone src="seg/s7c.mp4" top={-140} w={820} />
        <TopShade />
        <Headline kicker="Copy · paste · post" title="Caption included." at={0} top={90} size={68} />
        <BottomShade />
      </Enter>
    </Sequence>
    <Sequence from={278}>
      <Enter dur={8}>
        <StatCard />
      </Enter>
    </Sequence>
  </AbsoluteFill>
);

/* 8 · Guardrails ------------------------------------------------------------------------------- */
const Blocked: React.FC<{ word: string; at: number; x: number; y: number; r: number }> = ({ word, at, x, y, r }) => {
  const f = useCurrentFrame();
  const p = usePop(at, 12, 170);
  const hit = w(6.1);
  const strike = interpolate(f, [hit + (x % 3), hit + 8 + (x % 3)], [0, 1], { ...clamp, easing: ease });
  const shake = f > hit && f < hit + 10 ? Math.sin(f * 3) * 6 : 0;
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, transform: `rotate(${r}deg) scale(${p}) translateX(${shake}px)`,
        opacity: Math.min(1, p * 1.5) * (1 - strike * 0.35),
        fontFamily: HEAD, fontWeight: 800, fontSize: 48, color: strike > 0.5 ? '#ffb3c6' : C.white,
        background: strike > 0.5 ? 'rgba(255,60,100,.25)' : 'rgba(255,255,255,.12)', border: `2px solid ${strike > 0.5 ? C.pink : 'rgba(255,255,255,.3)'}`,
        borderRadius: 20, padding: '14px 30px',
      }}
    >
      “{word}”
      <div
        style={{
          position: 'absolute', left: 18, top: '50%', height: 6, width: `calc(${strike * 100}% - 36px)`, background: C.pink,
          borderRadius: 9,
        }}
      />
    </div>
  );
};

export const Guard: React.FC = () => {
  const f = useCurrentFrame();
  const stamp = usePop(w(6.1) + 4, 9, 220);
  const approve = usePop(w(8.4), 12, 150);
  const tap = interpolate(f, [w(9.8), w(9.8) + 14], [0, 1], clamp);
  const marq = ['GDC', 'ASA / CAP', 'AHPRA', 'FTC', 'GDPR', 'Dental Council of Ireland', 'ADA Code', 'HIPAA-conscious'];
  return (
    <AbsoluteFill>
      <Enter>
        <Background hue="teal" />
        <Headline kicker="Compliance-aware" title="Guardrails built in." at={0} top={110} size={76} accent="Guardrails" />
        <Card at={w(1.5)} x={190} y={400} w={700} icon="✅" title="Approved facts only" sub="Every line checked before artwork is made" tint={C.wa} />
        <Blocked word="painless" at={w(4.1)} x={120} y={680} r={-4} />
        <Blocked word="guaranteed" at={w(4.9)} x={530} y={650} r={3} />
        <Blocked word="100%" at={w(5.2)} x={210} y={820} r={2} />
        <Blocked word="risk-free" at={w(5.5)} x={540} y={800} r={-3} />
        <div
          style={{
            position: 'absolute', left: 300, top: 700, fontFamily: HEAD, fontWeight: 800, fontSize: 100, color: C.pink,
            border: `10px solid ${C.pink}`, borderRadius: 24, padding: '4px 34px', letterSpacing: 6,
            transform: `rotate(-12deg) scale(${2.4 - 1.4 * stamp})`, opacity: stamp, background: 'rgba(10,9,48,.75)',
          }}
        >
          BLOCKED
        </div>
        <div
          style={{
            position: 'absolute', top: 1040, left: 0, right: 0, textAlign: 'center', opacity: approve,
            transform: `translateY(${(1 - approve) * 50}px)`,
          }}
        >
          <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 56, color: C.white }}>
            Nothing goes out until <span style={{ color: C.teal }}>you approve.</span>
          </div>
          <div
            style={{
              display: 'inline-block', position: 'relative', marginTop: 34, background: C.wa, color: '#04361a', fontFamily: HEAD,
              fontWeight: 800, fontSize: 44, borderRadius: 99, padding: '22px 64px', transform: `scale(${1 - Math.sin(tap * Math.PI) * 0.08})`,
              boxShadow: '0 24px 50px rgba(0,0,0,.4)',
            }}
          >
            ✓ Approve
            <div
              style={{
                position: 'absolute', left: '50%', top: '50%', width: 300 * tap, height: 300 * tap, marginLeft: -150 * tap,
                marginTop: -150 * tap, borderRadius: 999, border: `4px solid rgba(255,255,255,${1 - tap})`,
              }}
            />
          </div>
        </div>
        <div style={{ position: 'absolute', top: 1430, left: 0, right: 0, overflow: 'hidden' }}>
          <div style={{ textAlign: 'center', fontFamily: BODY, fontSize: 22, color: C.muted, marginBottom: 14 }}>
            Designed with these standards in mind
          </div>
          <div style={{ display: 'flex', gap: 18, transform: `translateX(${-f * 2.2}px)`, whiteSpace: 'nowrap' }}>
            {[...marq, ...marq, ...marq].map((m, i) => (
              <div
                key={i}
                style={{
                  fontFamily: HEAD, fontWeight: 800, fontSize: 26, color: C.teal, border: '2px solid rgba(126,224,214,.4)',
                  borderRadius: 99, padding: '10px 22px',
                }}
              >
                {m}
              </div>
            ))}
          </div>
        </div>
      </Enter>
    </AbsoluteFill>
  );
};

/* 9 · Offer + end card ------------------------------------------------------------------------- */
const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const logo = usePop(0, 12, 130);
  const btn = usePop(w(10.6) - 261, 10, 160);
  const qr = usePop(20, 13, 130);
  const pulse = 1 + Math.max(0, Math.sin((f - 70) / 7)) * 0.035 * (f > 70 ? 1 : 0);
  return (
    <AbsoluteFill>
      <Background />
      <div style={{ position: 'absolute', top: 120, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
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
      <Headline title="See your clinic's version." at={6} top={330} size={84} accent="clinic's" />
      <div
        style={{
          position: 'absolute', top: 600, left: 0, right: 0, display: 'flex', justifyContent: 'center',
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
          position: 'absolute', top: 820, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 40,
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
      <div style={{ position: 'absolute', top: 1240, left: 60, right: 60, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
        <Pill at={40} size={28}>🎁 Free demo carousel</Pill>
        <Pill at={46} size={28}>💳 No card to start</Pill>
        <Pill at={52} size={28} bg={C.pink} color={C.white}>Launch prices end 31 Dec 2026</Pill>
      </div>
    </AbsoluteFill>
  );
};

export const Offer: React.FC = () => {
  const price = usePop(w(4.4), 12, 140);
  const per = usePop(w(6.5), 12, 160);
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={268}>
        <Enter>
          <Background />
          <Phone src="seg/s9.mp4" top={300} w={700} dim={0.15} />
          <TopShade h={440} />
          <Headline kicker="Your plan" title="Fresh content. Every morning." at={0} top={90} size={66} accent="morning." />
          <div style={{ position: 'absolute', top: 310, left: 0, right: 0, textAlign: 'center' }}>
            <Pill at={w(2.5)} size={30}>📅 6 days a week · in your style</Pill>
          </div>
          <div
            style={{
              position: 'absolute', right: 50, top: 820, width: 400, background: C.white, borderRadius: 36, padding: '30px 34px',
              boxShadow: '0 40px 80px rgba(0,0,0,.5)', transform: `rotate(${3 * price}deg) scale(${price})`, opacity: Math.min(1, price * 1.5),
            }}
          >
            <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 26, color: C.indigo, letterSpacing: 3 }}>FROM</div>
            <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 110, color: C.ink, lineHeight: 1, letterSpacing: -4 }}>
              $79<span style={{ fontSize: 40, color: '#55537a', letterSpacing: 0 }}>/mo</span>
            </div>
          </div>
          <div
            style={{
              position: 'absolute', left: 50, top: 1130, width: 430, background: C.pink, borderRadius: 36, padding: '26px 32px',
              boxShadow: '0 40px 80px rgba(0,0,0,.5)', transform: `rotate(${-3 * per}deg) scale(${per})`, opacity: Math.min(1, per * 1.5),
            }}
          >
            <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 72, color: C.white, lineHeight: 1 }}>≈ $3</div>
            <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 34, color: C.white }}>per post</div>
            <div style={{ fontFamily: BODY, fontSize: 20, color: 'rgba(255,255,255,.85)', marginTop: 8 }}>
              $79 ÷ ~26 posts a month (6 a week)
            </div>
          </div>
          <Source at={w(4.4)} text="Monthly plan price in USD, plus local taxes" bottom={330} />
          <BottomShade />
        </Enter>
      </Sequence>
      <Sequence from={261}>
        <Enter dur={10}>
          <EndCard />
        </Enter>
      </Sequence>
    </AbsoluteFill>
  );
};
