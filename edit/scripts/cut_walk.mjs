// Builds time-remapped step clips for the walkthrough from src/walk.json.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(root, '..', 'flosspost Zantal Demo.mp4');
const { steps } = JSON.parse(readFileSync(join(root, 'src/walk.json'), 'utf8'));
const only = process.argv.slice(2);

for (const s of steps.filter((x) => x.keys && (!only.length || only.includes(x.id)))) {
  const t0 = s.keys[0][0];
  const tEnd = s.keys.at(-1)[0];
  const pieces = s.keys.slice(1).map(([src, out], i) => {
    const [ps, po] = s.keys[i];
    return { a: ps - t0, b: src - t0, k: (out - po) / (src - ps) };
  });
  const n = pieces.length;
  const chains = pieces.map((p, i) => `[v${i}]trim=start=${p.a}:end=${p.b},setpts=(PTS-STARTPTS)*${p.k.toFixed(5)}[p${i}]`);
  const graph = `[0:v]split=${n}${pieces.map((_, i) => `[v${i}]`).join('')};${chains.join(';')};` +
    `${pieces.map((_, i) => `[p${i}]`).join('')}concat=n=${n}:v=1:a=0,fps=30,scale=1080:2340:flags=lanczos,format=yuv420p[out]`;
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(t0), '-t', String(tEnd - t0 + 0.5), '-i', SRC,
    '-filter_complex', graph, '-map', '[out]', '-t', String(s.dur), '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
    join(root, 'public/wseg', `${s.id}.mp4`)]);
  const d = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', join(root, 'public/wseg', `${s.id}.mp4`)]);
  console.log(s.id, 'target', s.dur, 'got', String(d).trim());
}
