/* ============================================================
 * 生成虚构唱片试听片段 WAV（从 js/data.js 读取）
 * 运行: node tools/gen-audio.mjs
 * 输出: assets/audio/*.wav (22050Hz / 16bit / mono / ~12s)
 * 纯 Node 合成：按曲风使用不同配器 + 黑胶炒豆声，全部为原创虚构旋律
 * ============================================================ */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const window = {};
eval(readFileSync(join(root, 'js/data.js'), 'utf8'));
const { records } = window.SIDEB;

const OUT = join(root, 'assets/audio');
mkdirSync(OUT, { recursive: true });

const SR = 22050, DUR = 12.5, N = Math.floor(SR * DUR);

/* ---------- 随机 ---------- */
function hashStr(s) { let h = 1779033703; for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return h >>> 0; }
function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

/* ---------- 乐器 ---------- */
function addKick(buf, t, gain = .9) {
  const len = Math.floor(SR * .3);
  for (let i = 0; i < len && t * SR + i < N; i++) {
    const p = i / SR;
    const f = 42 + 95 * Math.exp(-p * 26);
    buf[t * SR + i] += Math.sin(2 * Math.PI * f * p) * gain * Math.exp(-p * 11);
  }
}
function addSnare(buf, t, gain = .5) {
  const len = Math.floor(SR * .22);
  let lp = 0;
  for (let i = 0; i < len && t * SR + i < N; i++) {
    const p = i / SR, w = Math.random() * 2 - 1;
    lp += (w - lp) * .35;                       // 带通感
    const ring = Math.sin(2 * Math.PI * 185 * p) * .4;
    buf[t * SR + i] += ((w - lp) * .8 + ring) * gain * Math.exp(-p * 18);
  }
}
function addHat(buf, t, gain = .18, dec = 60) {
  const len = Math.floor(SR * .06);
  let hp = 0, lp = 0;
  for (let i = 0; i < len && t * SR + i < N; i++) {
    const p = i / SR, w = Math.random() * 2 - 1;
    lp += (w - lp) * .5; hp = w - lp;
    buf[t * SR + i] += hp * gain * Math.exp(-p * dec);
  }
}
function addRide(buf, t, gain = .1) {
  const len = Math.floor(SR * .4);
  let hp = 0, lp = 0;
  for (let i = 0; i < len && t * SR + i < N; i++) {
    const p = i / SR, w = Math.random() * 2 - 1;
    lp += (w - lp) * .6; hp = w - lp;
    const metal = .5 * Math.sin(2 * Math.PI * 3170 * p) + .3 * Math.sin(2 * Math.PI * 4930 * p) + .2 * Math.sin(2 * Math.PI * 5430 * p);
    buf[t * SR + i] += (hp * .7 + metal * .3) * gain * Math.exp(-p * 6);
  }
}
function addBass(buf, t, midi, dur, gain = .5) {
  const f = mtof(midi), len = Math.floor(SR * dur);
  for (let i = 0; i < len && t * SR + i < N; i++) {
    const p = i / SR, env = Math.min(1, p * 60) * Math.exp(-p * 2.2);
    buf[t * SR + i] += (Math.sin(2 * Math.PI * f * p) * .8 + Math.sin(2 * Math.PI * f * 2 * p) * .25) * gain * env;
  }
}
function addEP(buf, t, midi, dur, gain = .3) { // 电钢/钟琴
  const f = mtof(midi), len = Math.floor(SR * dur);
  for (let i = 0; i < len && t * SR + i < N; i++) {
    const p = i / SR, env = Math.min(1, p * 90) * Math.exp(-p * 2.6);
    const vib = 1 + Math.sin(2 * Math.PI * 5.3 * p) * .0015;
    buf[t * SR + i] += (Math.sin(2 * Math.PI * f * vib * p) + .38 * Math.sin(2 * Math.PI * f * 2 * p) + .12 * Math.sin(2 * Math.PI * f * 4 * p)) * gain * env;
  }
}
function addPad(buf, t, midis, dur, gain = .13) {
  const len = Math.floor(SR * dur);
  const fs = midis.flatMap(m => [mtof(m), mtof(m) * 1.003, mtof(m) * .997]);
  for (let i = 0; i < len && t * SR + i < N; i++) {
    const p = i / SR;
    const env = Math.min(1, p * 1.4) * Math.min(1, Math.max(0, (dur - p) / .9)) * .9;
    let v = 0; for (const f of fs) v += Math.sin(2 * Math.PI * f * (p + t) * (f > 300 ? .5 : 1));
    buf[t * SR + i] += (v / fs.length) * gain * env;
  }
}
function addPluck(buf, t, midi, dur, gain = .34) { // Karplus-Strong 拨弦
  const f = mtof(midi), period = Math.max(2, Math.round(SR / f)), len = Math.floor(SR * dur);
  const line = new Float32Array(period + len);
  for (let i = 0; i < period; i++) line[i] = Math.random() * 2 - 1;
  for (let i = period; i < period + len; i++) line[i] = .5 * (line[i - period] + line[i - period + 1]) * .9965;
  for (let i = 0; i < len && t * SR + i < N; i++) {
    const p = i / SR, env = Math.min(1, p * 200) * Math.exp(-p * 1.4);
    buf[t * SR + i] += line[period + i] * gain * env;
  }
}
function addSaw(buf, t, midi, dur, gain = .2, cut = 1200) { // 低通锯齿
  const f = mtof(midi), len = Math.floor(SR * dur);
  let phase = 0, lp = 0;
  const k = 1 - Math.exp(-2 * Math.PI * cut / SR);
  for (let i = 0; i < len && t * SR + i < N; i++) {
    const p = i / SR;
    phase = (phase + f / SR) % 1;
    const saw = 2 * phase - 1;
    lp += (saw - lp) * k;
    const env = Math.min(1, p * 30) * Math.min(1, Math.max(0, (dur - p) / .12));
    buf[t * SR + i] += lp * gain * env;
  }
}
function addCrackle(buf, gain = .05) { // 黑胶炒豆 + 底噪
  let lp = 0;
  for (let i = 0; i < N; i++) {
    const w = Math.random() * 2 - 1;
    lp += (w - lp) * .04;
    let v = lp * gain * .5;
    if (Math.random() < .00035) v += (Math.random() * 2 - 1) * gain * 2.2 * (0.4 + Math.random() * .6);
    if (Math.random() < .00008) v += (Math.random() * 2 - 1) * gain * 4;
    buf[i] += v;
  }
}

/* ---------- 曲风编曲 ---------- */
const CH = { m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11], dom7: [0, 4, 7, 10], m9: [0, 3, 7, 10, 14], M: [0, 4, 7], m: [0, 3, 7], sus: [0, 5, 7], p5: [0, 7, 12] };

function render(rec) {
  const buf = new Float32Array(N);
  const r = mulberry32(hashStr(rec.id));
  const root = 48 + Math.floor(r() * 10); // C3–A3 区
  const genre = rec.genre;
  const beat = 60 / (genre === '电子' ? 116 : genre === '摇滚' ? 122 : genre === '嘻哈' ? 88 : genre === '爵士' ? 96 : 82);
  const bar = beat * 4;

  if (genre === '爵士') {
    const prog = [[2, CH.m7], [7, CH.dom7], [0, CH.maj7], [5, CH.maj7]];
    for (let b = 0, t = 0; t < DUR - 1; b++, t = b * bar) {
      const [deg, ch] = prog[b % prog.length];
      for (const iv of ch) addEP(buf, t + .01, root + 12 + deg + iv, bar * .9, .16);
      addBass(buf, t, root - 12 + deg, beat * 2.2, .42);
      addBass(buf, t + beat * 2.5, root - 12 + deg + 7, beat * 1.2, .38);
      for (let s = 0; s < 8; s++) { // 摇摆 ride
        const sw = s % 2 === 0 ? 0 : .33;
        addRide(buf, t + s * beat / 2 + sw * beat, .07);
        if (s % 4 === 2) addHat(buf, t + s * beat / 2, .12);
      }
      if (r() > .4) addEP(buf, t + beat * (1 + Math.floor(r() * 2)), root + 24 + deg + [10, 14, 17][Math.floor(r() * 3)], beat * .8, .1); // 即兴音
    }
  } else if (genre === '电子') {
    const pent = [0, 3, 5, 7, 10];
    for (let b = 0, t = 0; t < DUR - 1; b++, t = b * bar) {
      const deg = [0, 0, 5, 3][b % 4];
      addPad(buf, t, [root + deg, root + 12 + deg, root + 19 + deg], bar, .12);
      for (let s = 0; s < 4; s++) {
        addKick(buf, t + s * beat, .85);
        addHat(buf, t + s * beat + beat / 2, .16);
      }
      for (let s = 0; s < 8; s++) addSaw(buf, t + s * beat / 2, root + 12 + deg + pent[Math.floor(r() * 5)] + 12, beat * .45, .13, 1600);
      addBass(buf, t, root - 12 + deg, beat * 1.8, .4); addBass(buf, t + beat * 2, root - 12 + deg, beat * 1.8, .4);
    }
  } else if (genre === '民谣') {
    const prog = [[0, CH.M], [5, CH.M], [9, CH.m], [7, CH.M]];
    const strum = [0, 1, 2, 1, 0, 2, 1, 2];
    for (let b = 0, t = 0; t < DUR - 1; b++, t = b * bar) {
      const [deg, ch] = prog[b % prog.length];
      for (let s = 0; s < 8; s++) {
        const iv = ch[strum[s] % ch.length];
        addPluck(buf, t + s * beat / 2 + (s % 2 ? .008 : 0), root + 12 + deg + iv, beat, s % 4 === 0 ? .3 : .2);
      }
      if (b % 2 === 1) for (const iv of ch) addPluck(buf, t + beat * 3.5, root + 24 + deg + iv, beat, .12);
      addBass(buf, t, root - 12 + deg, beat * 3, .3);
      if (b >= 1) for (const iv of ch) addEP(buf, t + .02, root + deg + iv, bar, .05);
    }
  } else if (genre === '摇滚') {
    const riff = [0, 0, 3, 0, 5, 3, 0, -2];
    for (let b = 0, t = 0; t < DUR - 1; b++, t = b * bar) {
      for (let s = 0; s < 8; s++) {
        const tt = t + s * beat / 2;
        if (s % 4 === 0) addKick(buf, tt, .95);
        if (s % 8 === 4) addSnare(buf, tt, .5);
        addHat(buf, tt, .12);
        const deg = riff[s % riff.length] + (b % 2 ? 0 : 0);
        addSaw(buf, tt, root + 12 + deg, beat * .48, .16, 950);
        if (s % 2 === 0) addSaw(buf, tt, root + deg, beat * .45, .1, 600);
      }
      addBass(buf, t, root - 12 + riff[b % riff.length], beat * 3.6, .45);
    }
  } else if (genre === '灵魂放克') {
    const prog = [[0, CH.m7], [3, CH.maj7], [5, CH.m7], [7, CH.dom7]];
    for (let b = 0, t = 0; t < DUR - 1; b++, t = b * bar) {
      const [deg, ch] = prog[b % prog.length];
      // 16 分电钢切分
      for (let s = 0; s < 8; s++) {
        if (r() > .3) for (const iv of ch.slice(0, 3)) addEP(buf, t + s * beat / 2 + (s % 2 ? .012 : 0), root + 12 + deg + iv, beat * .4, .12);
      }
      for (let s = 0; s < 4; s++) {
        addKick(buf, t + s * beat, .8);
        addSnare(buf, t + s * beat + beat * (s % 2 ? 1.5 : 1), .4);
        addHat(buf, t + s * beat + beat * .5, .14);
      }
      addBass(buf, t, root - 12 + deg, beat * .9, .45);
      addBass(buf, t + beat * 1.5, root - 12 + deg + 7, beat * .5, .4);
      addBass(buf, t + beat * 2, root - 12 + deg + 3, beat * .9, .42);
      addBass(buf, t + beat * 3.25, root - 12 + deg + 10, beat * .6, .38);
    }
  } else { // 嘻哈
    const prog = [[0, CH.m9], [0, CH.m9], [8, CH.maj7], [5, CH.m7]];
    for (let b = 0, t = 0; t < DUR - 1; b++, t = b * bar) {
      const [deg, ch] = prog[b % prog.length];
      addPad(buf, t, ch.map(iv => root + 12 + deg + iv), bar, .1);
      addKick(buf, t, .9); addKick(buf, t + beat * 2.5, .8);
      addSnare(buf, t + beat, .5); addSnare(buf, t + beat * 3, .5);
      for (let s = 0; s < 8; s++) addHat(buf, t + s * beat / 2, s % 2 ? .1 : .15);
      addBass(buf, t, root - 12 + deg, beat * 2.4, .45);
      addBass(buf, t + beat * 3, root - 12 + deg - 5, beat * .9, .4);
      if (r() > .5) addEP(buf, t + beat * 3.5, root + 24 + deg + 7, beat, .08);
    }
  }

  addCrackle(buf, genre === '嘻哈' ? .07 : .05);

  /* 淡入淡出 + 软限幅 */
  const fade = Math.floor(SR * .35);
  let peak = 1e-6;
  for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(buf[i]));
  const g = .82 / peak;
  const out = new Int16Array(N);
  for (let i = 0; i < N; i++) {
    let v = Math.tanh(buf[i] * g * 1.15);
    if (i < fade) v *= i / fade;
    if (i > N - fade) v *= (N - i) / fade;
    out[i] = Math.round(Math.max(-1, Math.min(1, v)) * 32767);
  }

  /* WAV 16bit mono */
  const hdr = Buffer.alloc(44);
  hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + N * 2, 4); hdr.write('WAVE', 8);
  hdr.write('fmt ', 12); hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(1, 22);
  hdr.writeUInt32LE(SR, 24); hdr.writeUInt32LE(SR * 2, 28); hdr.writeUInt16LE(2, 32); hdr.writeUInt16LE(16, 34);
  hdr.write('data', 36); hdr.writeUInt32LE(N * 2, 40);
  writeFileSync(join(OUT, rec.preview), Buffer.concat([hdr, Buffer.from(out.buffer)]));
  console.log('audio:', rec.preview, `(${(N * 2 / 1024).toFixed(0)}KB, ${genre})`);
}

for (const rec of records) render(rec);
console.log('done:', records.length, 'previews');
