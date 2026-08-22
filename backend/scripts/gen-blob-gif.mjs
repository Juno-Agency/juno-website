/**
 * Regenerates the animated JUNO blob mascot used in emails, writing
 * src/mail/assets/blob-mascot.ts. Reproduces the site's click "pop" (squash +
 * blink → overshoot stretch → settle) on a loop. Background is TRANSPARENT so
 * the blob adapts to whatever colour the mail client paints the card (no baked
 * disc that mismatches when a mobile client re-tints in dark mode). A thin light
 * outline keeps the silhouette legible if the card goes dark.
 * Run from backend/:  node scripts/gen-blob-gif.mjs   (needs rsvg-convert + pngjs + gifenc)
 * Blob geometry mirrors frontend/src/app/shared/juno-mascot/blob.ts.
 */
import { execSync } from 'node:child_process';
import { writeFileSync, readFileSync, unlinkSync } from 'node:fs';
import { PNG } from 'pngjs';
import gifenc from 'gifenc';
const { GIFEncoder, quantize, applyPalette } = gifenc;

const SIZE = 168;
const BODY = '#fcfcfb';     // cream body (crisp on the black card)
const FEAT = '#141414';     // eyes + smile + outline (charcoal)
const PTS = 10, CX = 32, CY = 32, RX = 27.5, RY = 28, PX = 32, PY = 55;

const blobRadius = (a, t, amp) =>
  1 + amp * (0.6 * Math.sin(3 * a + 0.9 * t) + 0.4 * Math.sin(2 * a - 1.37 * t));
function blobPath(t, amp) {
  const p = [];
  for (let i = 0; i < PTS; i++) { const a = (i / PTS) * 2 * Math.PI, r = blobRadius(a, t, amp); p.push([CX + Math.cos(a) * RX * r, CY + Math.sin(a) * RY * r]); }
  const at = (i) => p[(i + PTS) % PTS], r2 = (n) => n.toFixed(2);
  let d = `M${r2(at(0)[0])} ${r2(at(0)[1])}`;
  for (let i = 0; i < PTS; i++) { const [px, py] = at(i - 1), [x0, y0] = at(i), [x1, y1] = at(i + 1), [nx, ny] = at(i + 2); d += `C${r2(x0 + (x1 - px) / 6)} ${r2(y0 + (y1 - py) / 6)} ${r2(x1 - (nx - x0) / 6)} ${r2(y1 - (ny - y0) / 6)} ${r2(x1)} ${r2(y1)}`; }
  return d + 'Z';
}
const eye = {
  open: (cx) => `<circle cx="${cx}" cy="30" r="3.1" fill="${FEAT}"/><circle cx="${cx + 1}" cy="30.7" r="1.1" fill="${BODY}"/>`,
  half: (cx) => `<ellipse cx="${cx}" cy="30" rx="3.1" ry="1.5" fill="${FEAT}"/>`,
  closed: (cx) => `<path d="M${cx - 2.9} 29.7 Q${cx} 31.5 ${cx + 2.9} 29.7" stroke="${FEAT}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
};
const smile = `<path d="M24.5 40 Q32 47 39.5 40" stroke="${FEAT}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;

function frameSvg({ t, amp, sx, sy, e }) {
  const tf = `translate(${PX} ${PY}) scale(${sx} ${sy}) translate(${-PX} ${-PY})`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${SIZE}" height="${SIZE}">`
    + `<g transform="${tf}"><path d="${blobPath(t, amp)}" fill="${BODY}" stroke="${FEAT}" stroke-width="0.9"/>${eye[e](24.5)}${eye[e](39.5)}${smile}</g></svg>`;
}

const A = 0.028;
const seq = [
  { t: 0.0, amp: A, sx: 1, sy: 1, e: 'open', d: 520 },
  { t: 1.0, amp: A, sx: 1, sy: 1, e: 'open', d: 520 },
  { t: 2.0, amp: A, sx: 1, sy: 1, e: 'open', d: 460 },
  { t: 2.3, amp: A, sx: 1.03, sy: 0.97, e: 'half', d: 70 },
  { t: 2.5, amp: 0.05, sx: 1.16, sy: 0.80, e: 'closed', d: 80 },
  { t: 2.7, amp: 0.05, sx: 1.13, sy: 0.83, e: 'closed', d: 70 },
  { t: 2.9, amp: 0.05, sx: 0.93, sy: 1.11, e: 'open', d: 80 },
  { t: 3.1, amp: 0.04, sx: 0.97, sy: 1.05, e: 'open', d: 70 },
  { t: 3.3, amp: 0.035, sx: 1.03, sy: 0.98, e: 'open', d: 70 },
  { t: 3.5, amp: 0.03, sx: 0.99, sy: 1.01, e: 'open', d: 90 },
  { t: 3.7, amp: A, sx: 1, sy: 1, e: 'open', d: 140 },
];
function rgba(spec) { writeFileSync('/tmp/_f.svg', frameSvg(spec)); execSync(`rsvg-convert -w ${SIZE} -h ${SIZE} -b none /tmp/_f.svg -o /tmp/_f.png`); return new Uint8Array(PNG.sync.read(readFileSync('/tmp/_f.png')).data); }

const gif = GIFEncoder();
const first = rgba(seq[0]);
const palette = quantize(first, 256, { format: 'rgba4444', oneBitAlpha: true });
const transparentIndex = palette.findIndex((c) => c.length === 4 && c[3] === 0);
seq.forEach((spec, i) => {
  const px = i === 0 ? first : rgba(spec);
  const index = applyPalette(px, palette, 'rgba4444');
  gif.writeFrame(index, SIZE, SIZE, { palette, delay: spec.d, repeat: 0, transparent: true, transparentIndex, dispose: 2 });
});
gif.finish();
const bytes = gif.bytes();
writeFileSync('/tmp/blob.gif', Buffer.from(bytes));
writeFileSync('src/mail/assets/blob-mascot.ts', `/**
 * JUNO blob mascot as a base64 animated GIF (${SIZE}x${SIZE}, TRANSPARENT bg): the
 * site's click "pop" (squash + blink → overshoot stretch → settle) on a loop.
 * Charcoal body + light outline so it reads on light and dark cards alike.
 * Embedded as a Resend inline attachment (cid) so it renders in Gmail without
 * external hosting. Regenerate with backend/scripts/gen-blob-gif.mjs.
 */
export const BLOB_MASCOT_CID = 'juno-blob';
export const BLOB_MASCOT_FILENAME = 'juno.gif';
export const BLOB_MASCOT_BASE64 =
  '${Buffer.from(bytes).toString('base64')}';
`);
['/tmp/_f.svg', '/tmp/_f.png'].forEach((f) => { try { unlinkSync(f); } catch {} });
console.log('Regenerated — GIF', bytes.length, 'bytes, transparentIndex', transparentIndex);
