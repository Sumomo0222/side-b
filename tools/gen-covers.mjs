/* ============================================================
 * 生成虚构专辑封面 SVG（从 js/data.js 读取）
 * 运行: node tools/gen-covers.mjs
 * 输出: assets/covers/*.svg  +  assets/favicon.svg
 * ============================================================ */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const window = {};
eval(readFileSync(join(root, 'js/data.js'), 'utf8'));
const { records, store } = window.SIDEB;

const OUT = join(root, 'assets/covers');
mkdirSync(OUT, { recursive: true });

/* ---------- 工具 ---------- */
function hashStr(s) { let h = 1779033703; for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return h >>> 0; }
function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function shade(hex, f) { // f>0 变亮, f<0 变暗
  const n = parseInt(hex.slice(1), 16);
  const ch = (v) => Math.max(0, Math.min(255, Math.round(f > 0 ? v + (255 - v) * f : v * (1 + f))));
  return '#' + [ch(n >> 16), ch((n >> 8) & 255), ch(n & 255)].map(v => v.toString(16).padStart(2, '0')).join('');
}
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const SERIF = `'Palatino Linotype', Palatino, Georgia, 'Songti SC', 'Times New Roman', serif`;
const SANS = `'Helvetica Neue', Helvetica, Arial, 'PingFang SC', sans-serif`;

/* ---------- 公共部件 ---------- */
function frame(fg, op) {
  return `<rect x="30" y="30" width="740" height="740" fill="none" stroke="${fg}" stroke-opacity="${op ?? .38}" stroke-width="2"/>
          <rect x="40" y="40" width="720" height="720" fill="none" stroke="${fg}" stroke-opacity="${(op ?? .38) / 2}" stroke-width="1"/>`;
}
function grain(id, amount = .07) {
  return `<filter id="gr${id}" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${id}" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.6 0.6 0.6 0 0"/>
    </filter>
    <rect width="800" height="800" filter="url(#gr${id})" opacity="${amount}"/>`;
}
function vignette() {
  return `<radialGradient id="vg" cx="50%" cy="42%" r="75%">
      <stop offset="55%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity=".32"/>
    </radialGradient><rect width="800" height="800" fill="url(#vg)"/>`;
}
function scratches(id, fg) {
  const r = mulberry32(id * 7 + 13);
  let s = '';
  for (let i = 0; i < 4; i++) {
    const x = r() * 800, y = r() * 800, len = 60 + r() * 260, ang = (r() * 40 - 20) + (r() > .5 ? 62 : -28);
    s += `<line x1="${x}" y1="${y}" x2="${x + Math.cos(ang * Math.PI / 180) * len}" y2="${y + Math.sin(ang * Math.PI / 180) * len}" stroke="${fg}" stroke-opacity="${.05 + r() * .05}" stroke-width="${.6 + r()}"/>`;
  }
  return s;
}
function footerMeta(rec, fg) {
  const y = 756;
  return `<g font-family="${SANS}" fill="${fg}">
      <text x="46" y="${y}" font-size="17" letter-spacing="4" opacity=".8">${esc(rec.label)} · ${esc(rec.catalog)}</text>
      <text x="754" y="${y}" font-size="17" letter-spacing="3" opacity=".8" text-anchor="end">${rec.year} · 33⅓ RPM</text>
    </g>`;
}
function cornerBadge(rec, fg) {
  return `<g font-family="${SANS}" fill="${fg}">
      <rect x="46" y="46" width="150" height="34" fill="none" stroke="${fg}" stroke-opacity=".55" stroke-width="1.4"/>
      <text x="121" y="69" font-size="15" letter-spacing="3" text-anchor="middle" opacity=".85">STEREO · 33⅓</text>
    </g>`;
}

/* ---------- 版式 ---------- */
const layouts = {
  /* 同心圆环 —— 唱片纹路放射 */
  rings(rec, r, { bg, fg, accent }) {
    let c = '';
    const cx = 400 + (r() * 160 - 80), cy = 330 + (r() * 100 - 50);
    for (let i = 0; i < 11; i++) {
      const rad = 60 + i * (46 + r() * 16);
      c += `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="none" stroke="${i % 3 === 2 ? accent : fg}" stroke-opacity="${i % 3 === 2 ? .5 : .22}" stroke-width="${i % 3 === 2 ? 3 : 1.6}"/>`;
    }
    c += `<circle cx="${cx}" cy="${cy}" r="34" fill="${accent}"/><circle cx="${cx}" cy="${cy}" r="7" fill="${shade(bg, -.5)}"/>
          <path d="M ${cx - 260} ${cy} A 260 260 0 0 1 ${cx} ${cy - 260}" fill="none" stroke="#fff" stroke-opacity=".10" stroke-width="52"/>`;
    return `${c}${cornerBadge(rec, fg)}
      <text x="46" y="600" font-family="${SERIF}" font-size="92" fill="${fg}" font-style="italic">${esc(rec.album)}</text>
      <text x="46" y="662" font-family="${SANS}" font-size="27" letter-spacing="10" fill="${accent}">${esc(rec.artist)}</text>`;
  },

  /* 大字排版 —— 厂牌经典蓝调封面味 */
  type(rec, r, { bg, fg, accent }) {
    const t = esc(rec.album), big = t.length > 5 ? 96 : 130;
    const col = r() > .5 ? 'left' : 'right';
    const x = col === 'left' ? 52 : 748, anchor = col === 'left' ? 'start' : 'end';
    return `<rect x="0" y="0" width="800" height="${r() > .5 ? 250 : 550}" fill="${accent}" opacity=".92"/>
      <circle cx="${col === 'left' ? 640 : 160}" cy="640" r="118" fill="none" stroke="${fg}" stroke-opacity=".55" stroke-width="2"/>
      <circle cx="${col === 'left' ? 640 : 160}" cy="640" r="86" fill="none" stroke="${fg}" stroke-opacity=".3" stroke-width="1.4"/>
      <circle cx="${col === 'left' ? 640 : 160}" cy="640" r="14" fill="${fg}" opacity=".8"/>
      <text x="${x}" y="${big > 100 ? 300 : 268}" font-family="${SERIF}" font-weight="bold" font-size="${big}" fill="${bg === accent ? fg : shade(bg, -.55)}" text-anchor="${anchor}">${t.slice(0, 3)}</text>
      ${t.length > 3 ? `<text x="${x}" y="${(big > 100 ? 300 : 268) + big * 1.02}" font-family="${SERIF}" font-weight="bold" font-size="${big}" fill="${bg === accent ? fg : shade(bg, -.55)}" text-anchor="${anchor}">${t.slice(3)}</text>` : ''}
      <text x="${col === 'left' ? 52 : 748}" y="620" font-family="${SANS}" font-size="24" letter-spacing="9" fill="${fg}" text-anchor="${anchor}">${esc(rec.artist)}</text>
      <line x1="${col === 'left' ? 52 : 420}" y1="650" x2="${col === 'left' ? 380 : 748}" y2="650" stroke="${fg}" stroke-opacity=".5" stroke-width="2"/>`;
  },

  /* 太阳 / 地平线 —— 民谣 */
  sun(rec, r, { bg, fg, accent }) {
    const sx = 400 + (r() * 120 - 60), sy = 430 + (r() * 60 - 30), sr = 150 + r() * 50;
    let rays = '';
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      rays += `<line x1="${sx + Math.cos(a) * (sr + 18)}" y1="${sy + Math.sin(a) * (sr + 18)}" x2="${sx + Math.cos(a) * (sr + 62)}" y2="${sy + Math.sin(a) * (sr + 62)}" stroke="${accent}" stroke-opacity=".65" stroke-width="${i % 2 ? 3 : 1.6}"/>`;
    }
    return `${rays}<circle cx="${sx}" cy="${sy}" r="${sr}" fill="${accent}"/>
      <circle cx="${sx}" cy="${sy}" r="${sr - 14}" fill="none" stroke="${shade(accent, -.25)}" stroke-opacity=".5" stroke-width="2"/>
      <rect x="0" y="${sy + sr + 44}" width="800" height="4" fill="${fg}" opacity=".55"/>
      <rect x="0" y="${sy + sr + 44}" width="800" height="800" fill="${shade(bg, -.25)}" opacity=".35"/>
      <text x="400" y="120" font-family="${SERIF}" font-size="76" fill="${fg}" text-anchor="middle">${esc(rec.album)}</text>
      <text x="400" y="168" font-family="${SANS}" font-size="24" letter-spacing="12" fill="${shade(fg, -.2)}" text-anchor="middle">${esc(rec.artist)}</text>`;
  },

  /* 弧形色块 —— 极简现代 */
  arc(rec, r, { bg, fg, accent }) {
    const flip = r() > .5;
    const d = flip ? 'M 800 800 L 800 120 A 680 680 0 0 0 120 800 Z' : 'M 0 0 L 0 680 A 680 680 0 0 1 680 0 Z';
    const tx = flip ? 70 : 730, anchor = flip ? 'start' : 'end';
    return `<path d="${d}" fill="${accent}" opacity=".95"/>
      <circle cx="${flip ? 620 : 180}" cy="${flip ? 180 : 620}" r="150" fill="none" stroke="${fg}" stroke-opacity=".4" stroke-width="2"/>
      <circle cx="${flip ? 620 : 180}" cy="${flip ? 180 : 620}" r="110" fill="none" stroke="${fg}" stroke-opacity=".25" stroke-width="1.5"/>
      <circle cx="${flip ? 620 : 180}" cy="${flip ? 180 : 620}" r="10" fill="${fg}" opacity=".7"/>
      <text x="${tx}" y="600" font-family="${SERIF}" font-weight="bold" font-size="104" fill="${fg}" text-anchor="${anchor}">${esc(rec.album)}</text>
      <text x="${tx}" y="656" font-family="${SANS}" font-size="25" letter-spacing="9" fill="${fg}" opacity=".85" text-anchor="${anchor}">${esc(rec.artist)}</text>`;
  },

  /* 网格 / 波形 —— 电子 */
  grid(rec, r, { bg, fg, accent }) {
    let cells = '';
    const n = 12, cs = 56, ox = 46, oy = 470;
    for (let gx = 0; gx < n; gx++) {
      const h = 20 + Math.pow(r(), .6) * 200;
      cells += `<rect x="${ox + gx * (cs + 6)}" y="${oy + 220 - h}" width="${cs}" height="${h}" fill="${gx % 4 === 2 ? accent : fg}" opacity="${gx % 4 === 2 ? .9 : .28}"/>`;
    }
    let dots = '';
    for (let gx = 0; gx < 10; gx++) for (let gy = 0; gy < 3; gy++)
      if (r() > .55) dots += `<rect x="${46 + gx * 52}" y="${100 + gy * 52}" width="14" height="14" fill="${r() > .8 ? accent : fg}" opacity="${r() * .5 + .15}"/>`;
    return `${dots}${cells}
      <text x="46" y="360" font-family="${SERIF}" font-size="82" fill="${fg}">${esc(rec.album)}</text>
      <text x="46" y="415" font-family="${SANS}" font-size="24" letter-spacing="10" fill="${accent}">${esc(rec.artist)}</text>`;
  },

  /* 散落唱片 —— 多盘叠放 */
  discs(rec, r, { bg, fg, accent }) {
    let c = '';
    const spots = [[250, 300, 190], [520, 430, 230], [400, 210, 120], [620, 240, 110]];
    spots.forEach(([x, y, rad], i) => {
      const fill = i === 1 ? accent : 'none';
      c += `<circle cx="${x}" cy="${y}" r="${rad}" fill="${fill}" ${i === 1 ? '' : `stroke="${fg}" stroke-opacity=".5" stroke-width="2"`}/>`;
      if (i === 1) { c += `<circle cx="${x}" cy="${y}" r="${rad - 10}" fill="none" stroke="${shade(accent, -.3)}" stroke-opacity=".7" stroke-width="1.5"/>`; }
      else { c += `<circle cx="${x}" cy="${y}" r="${rad * .62}" fill="none" stroke="${fg}" stroke-opacity=".28" stroke-width="1.4"/><circle cx="${x}" cy="${y}" r="${rad * .3}" fill="none" stroke="${fg}" stroke-opacity=".22" stroke-width="1.2"/>`; }
      c += `<circle cx="${x}" cy="${y}" r="9" fill="${i === 1 ? shade(accent, -.45) : fg}" opacity=".75"/>`;
    });
    return `${c}
      <text x="52" y="118" font-family="${SERIF}" font-size="78" fill="${fg}">${esc(rec.album)}</text>
      <text x="52" y="172" font-family="${SANS}" font-size="24" letter-spacing="10" fill="${accent}">${esc(rec.artist)}</text>`;
  },

  /* 拼贴剪贴簿 —— 嘻哈 */
  collage(rec, r, { bg, fg, accent }) {
    let c = '';
    const paper = [shade(bg, .14), shade(bg, .08), shade(bg, .2)];
    const rects = [[90, 120, 300, 210, -6], [420, 90, 300, 190, 4], [140, 420, 280, 230, 3], [450, 380, 290, 260, -5]];
    rects.forEach(([x, y, w, h, a], i) => {
      c += `<g transform="rotate(${a} ${x + w / 2} ${y + h / 2})">
        <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${paper[i % 3]}" opacity=".85"/>
        <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${shade(bg, -.4)}" stroke-opacity=".6"/>
        <rect x="${x + w / 2 - 45}" y="${y - 14}" width="90" height="28" fill="${fg}" opacity=".28" transform="rotate(${r() * 8 - 4} ${x + w / 2} ${y})"/>
      </g>`;
    });
    c += `<circle cx="380" cy="300" r="86" fill="${accent}" opacity=".92"/>
      <circle cx="380" cy="300" r="60" fill="none" stroke="${shade(accent, -.35)}" stroke-width="1.6" opacity=".8"/>
      <circle cx="380" cy="300" r="8" fill="${shade(accent, -.5)}"/>
      <text x="400" y="748" font-family="${SANS}" font-size="20" letter-spacing="6" fill="${fg}" opacity=".7" text-anchor="middle">SIDE B TAPE CLUB · ${rec.year}</text>`;
    return `${c}
      <text x="56" y="720" font-family="${SERIF}" font-weight="bold" font-size="72" fill="${fg}" font-style="italic">${esc(rec.album)}</text>
      <text x="56" y="668" font-family="${SANS}" font-size="23" letter-spacing="8" fill="${fg}" opacity=".85">${esc(rec.artist)}</text>`;
  }
};

/* ---------- 生成 ---------- */
for (const rec of records) {
  const seed = hashStr(rec.id);
  const r = mulberry32(seed);
  const st = rec.coverStyle;
  const layout = layouts[st.layout] || layouts.rings;
  const bgGrad = `
    <linearGradient id="bgg" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0%" stop-color="${shade(st.bg, .07)}"/>
      <stop offset="60%" stop-color="${st.bg}"/>
      <stop offset="100%" stop-color="${shade(st.bg, -.16)}"/>
    </linearGradient>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <defs>${bgGrad}</defs>
  <rect width="800" height="800" fill="url(#bgg)"/>
  ${layout(rec, r, st)}
  ${footerMeta(rec, st.fg)}
  ${frame(st.fg)}
  ${scratches(seed, st.fg)}
  ${grain(seed % 97)}
  ${vignette()}
</svg>`;
  writeFileSync(join(OUT, rec.cover), svg);
  console.log('cover:', rec.cover, `(${st.layout})`);
}

/* favicon：唱片 + B */
writeFileSync(join(root, 'assets/favicon.svg'),
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="#121110"/>
  <circle cx="32" cy="32" r="22" fill="none" stroke="#3a332c" stroke-width="1.5"/>
  <circle cx="32" cy="32" r="15" fill="none" stroke="#3a332c" stroke-width="1.2"/>
  <circle cx="32" cy="32" r="10" fill="#7a1f2b"/>
  <circle cx="32" cy="32" r="3" fill="#f1e6cf"/>
  <path d="M 10 52 A 30 30 0 0 1 54 10" fill="none" stroke="#f1e6cf" stroke-opacity=".25" stroke-width="7"/>
</svg>`);
console.log('favicon: assets/favicon.svg');
console.log('done:', records.length, 'covers');
