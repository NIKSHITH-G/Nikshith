"use client";

// Every sound in the studio is synthesised with WebAudio — no audio files to
// download. Nothing plays until init() runs from a click (browser autoplay rules).

let ctx = null;
let master;
let sfxBus;
let musicBus;
let noiseBuf;
let ambient = null;

let muted = false;
try {
  muted = localStorage.getItem("studio-muted") === "1";
} catch {}

export const isMuted = () => muted;

export function init() {
  if (ctx) {
    if (ctx.state === "suspended") ctx.resume();
    return;
  }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : 0.9;
  const comp = ctx.createDynamicsCompressor();
  master.connect(comp).connect(ctx.destination);

  sfxBus = ctx.createGain();
  sfxBus.gain.value = 0.7;
  sfxBus.connect(master);

  // music runs through a lowpass for that warm, slightly-muffled lo-fi feel
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 1700;
  musicBus = ctx.createGain();
  musicBus.gain.value = 0.55;
  musicBus.connect(lp).connect(master);

  noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
}

export function setMuted(m) {
  muted = m;
  try {
    localStorage.setItem("studio-muted", m ? "1" : "0");
  } catch {}
  if (master) master.gain.setTargetAtTime(m ? 0 : 0.9, ctx.currentTime, 0.08);
}

function noise(dur, { type = "bandpass", freq = 1000, q = 1, gain = 0.3, at = 0, bus = sfxBus } = {}) {
  if (!ctx) return;
  const t = ctx.currentTime + at;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(bus);
  src.start(t, Math.random() * 0.5);
  src.stop(t + dur + 0.02);
}

function tone(freq, { type = "sine", dur = 0.12, gain = 0.15, at = 0, to, bus = sfxBus } = {}) {
  if (!ctx) return;
  const t = ctx.currentTime + at;
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(bus);
  o.start(t);
  o.stop(t + dur + 0.02);
}

// A soft electric-piano voice: a few partials with a fast attack and long decay.
export function note(freq, { gain = 0.3, dur = 1.8, at = 0, bus } = {}) {
  if (!ctx) return;
  const t = ctx.currentTime + at;
  const out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, t);
  out.gain.exponentialRampToValueAtTime(gain, t + 0.012);
  out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  out.connect(bus ?? sfxBus);
  [[1, "triangle", 1], [2, "sine", 0.35], [3, "sine", 0.1]].forEach(([mult, type, g]) => {
    const o = ctx.createOscillator();
    const gn = ctx.createGain();
    o.type = type;
    o.frequency.value = freq * mult;
    gn.gain.value = g;
    o.connect(gn).connect(out);
    o.start(t);
    o.stop(t + dur + 0.05);
  });
}

// Light switch: a sharp tick with a little body.
export function click(at = 0) {
  noise(0.025, { type: "highpass", freq: 3000, gain: 0.35, at });
  noise(0.05, { type: "lowpass", freq: 400, gain: 0.3, at: at + 0.004 });
}

export function step() {
  noise(0.07, { type: "lowpass", freq: 220 + Math.random() * 140, gain: 0.32 });
  noise(0.03, { type: "bandpass", freq: 1800 + Math.random() * 600, q: 2, gain: 0.04 });
}

export function blip(up = true) {
  tone(up ? 620 : 880, { to: up ? 990 : 560, dur: 0.11, gain: 0.08 });
}

export function hover() {
  tone(1400, { dur: 0.04, gain: 0.025 });
}

export function meow() {
  if (!ctx) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(480, t);
  o.frequency.linearRampToValueAtTime(820, t + 0.16);
  o.frequency.linearRampToValueAtTime(520, t + 0.5);
  const f = ctx.createBiquadFilter();
  f.type = "bandpass";
  f.Q.value = 4;
  f.frequency.setValueAtTime(900, t);
  f.frequency.linearRampToValueAtTime(1600, t + 0.16);
  f.frequency.linearRampToValueAtTime(1000, t + 0.5);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.18, t + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
  o.connect(f).connect(g).connect(sfxBus);
  o.start(t);
  o.stop(t + 0.6);
}

export function chime() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => note(f, { gain: 0.16, dur: 1.4, at: i * 0.09 }));
}

// Lo-fi room tone: vinyl crackle plus a slow Cmaj7 → Am7 → Fmaj7 → G6 loop.
const CHORDS = [
  [130.81, 246.94, 329.63, 392.0],
  [110.0, 196.0, 261.63, 329.63],
  [87.31, 220.0, 261.63, 329.63],
  [98.0, 246.94, 293.66, 329.63],
];
const MELODY = [659.25, 587.33, 523.25, 493.88, 440.0, 392.0, 523.25, 587.33];

export function startAmbient() {
  if (!ctx || ambient) return;
  const crackle = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
  const c = crackle.getChannelData(0);
  for (let i = 0; i < c.length; i++) {
    c[i] = (Math.random() * 2 - 1) * 0.015 + (Math.random() < 0.0007 ? (Math.random() * 2 - 1) * 0.6 : 0);
  }
  const src = ctx.createBufferSource();
  src.buffer = crackle;
  src.loop = true;
  const g = ctx.createGain();
  g.gain.value = 0.35;
  src.connect(g).connect(musicBus);
  src.start();

  let bar = 0;
  const BAR = 3.4;
  const play = () => {
    const chord = CHORDS[bar % CHORDS.length];
    chord.forEach((f, j) => note(f, { bus: musicBus, gain: j === 0 ? 0.11 : 0.055, dur: BAR + 0.8, at: j * 0.035 }));
    // an occasional lazy melody note
    if (bar % 2 === 1) note(MELODY[(bar * 3) % MELODY.length], { bus: musicBus, gain: 0.05, dur: 2.2, at: BAR * 0.5 });
    bar++;
  };
  play();
  ambient = setInterval(play, BAR * 1000);
}

// Turn the background music down while you're playing the piano.
export function duck(on) {
  if (!musicBus || station !== "lofi") return;
  musicBus.gain.setTargetAtTime(on ? 0.12 : 0.55, ctx.currentTime, 0.3);
}

// Camera shutter: two quick mechanical clacks.
export function shutter() {
  noise(0.03, { type: "highpass", freq: 2000, gain: 0.45 });
  noise(0.05, { type: "bandpass", freq: 900, q: 2, gain: 0.3, at: 0.07 });
}

// Paper rustle for the letter.
export function rustle() {
  noise(0.35, { type: "bandpass", freq: 3200, q: 0.6, gain: 0.08 });
}

// Elevator: a low motor hum for the trip.
export function elevator() {
  if (!ctx) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(55, t);
  o.frequency.linearRampToValueAtTime(70, t + 0.9);
  o.frequency.linearRampToValueAtTime(52, t + 1.8);
  const f = ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 220;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.12, t + 0.4);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.9);
  o.connect(f).connect(g).connect(sfxBus);
  o.start(t);
  o.stop(t + 2);
  noise(0.4, { type: "bandpass", freq: 600, q: 0.8, gain: 0.05, at: 0.05 });
}

// Elevator arrival chime.
export function ding() {
  note(1318.5, { gain: 0.18, dur: 1.6 });
  note(1046.5, { gain: 0.16, dur: 1.8, at: 0.28 });
}

// Coffee machine: grind then pour.
export function brew() {
  noise(0.6, { type: "bandpass", freq: 1400, q: 1.5, gain: 0.12 });
  noise(1.2, { type: "lowpass", freq: 700, gain: 0.09, at: 0.65 });
}

// Snooker: ball-on-ball clack, cushion thud, pocket drop.
export function clack(strength = 1) {
  tone(2200 + Math.random() * 300, { dur: 0.04, gain: 0.06 * Math.min(1, strength), type: "triangle" });
  noise(0.03, { type: "highpass", freq: 3000, gain: 0.12 * Math.min(1, strength) });
}
export function cushion(strength = 1) {
  noise(0.06, { type: "lowpass", freq: 260, gain: 0.18 * Math.min(1, strength) });
}
export function pocket() {
  noise(0.18, { type: "lowpass", freq: 380, gain: 0.3 });
  tone(140, { to: 90, dur: 0.2, gain: 0.1 });
}

// Gym: a punch landing on the bag, and treadmill footfalls.
export function punch(power = 1) {
  noise(0.09, { type: "lowpass", freq: 300 + power * 200, gain: 0.35 + power * 0.15 });
  tone(90, { to: 55, dur: 0.12, gain: 0.12 });
}

/* ── radio stations ── */
let station = "lofi";
let stationNodes = [];
let stationTimer = null;
export const currentStation = () => station;

function stopStation() {
  stationNodes.forEach((n) => { try { n.stop(); } catch {} });
  stationNodes = [];
  clearInterval(stationTimer);
  stationTimer = null;
}

// "lofi" (the default chords), "rain", "crickets" or "off".
export function setStation(name) {
  init();
  if (!ctx) return;
  station = name;
  stopStation();
  musicBus.gain.setTargetAtTime(name === "lofi" ? 0.55 : 0.0001, ctx.currentTime, 0.4);
  if (name === "lofi") startAmbient();
  if (name === "rain") {
    const src = ctx.createBufferSource();
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (Math.random() < 0.002 ? 1 : 0.35);
    src.buffer = buf;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 1400;
    f.Q.value = 0.4;
    const g = ctx.createGain();
    g.gain.value = 0.22;
    src.connect(f).connect(g).connect(master);
    src.start();
    stationNodes.push(src);
  }
  if (name === "crickets") {
    stationTimer = setInterval(() => {
      const at = Math.random() * 0.4;
      for (let k = 0; k < 3; k++) tone(4200 + Math.random() * 300, { dur: 0.03, gain: 0.035, at: at + k * 0.06, type: "sine" });
    }, 700);
  }
}

// Pixel's happy "woof": two short, rough barks.
export function bark() {
  if (!ctx) return;
  [0, 0.18].forEach((at) => {
    const t = ctx.currentTime + at;
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(420, t);
    o.frequency.exponentialRampToValueAtTime(180, t + 0.12);
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 700;
    f.Q.value = 1.5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    o.connect(f).connect(g).connect(sfxBus);
    o.start(t);
    o.stop(t + 0.16);
    noise(0.08, { type: "bandpass", freq: 900, q: 1, gain: 0.08, at });
  });
}

// Camera shutter + film advance, for the photo booth.
export function snap() {
  noise(0.025, { type: "highpass", freq: 2500, gain: 0.5 });
  noise(0.04, { type: "bandpass", freq: 1100, q: 2, gain: 0.3, at: 0.06 });
  noise(0.2, { type: "bandpass", freq: 2400, q: 3, gain: 0.06, at: 0.12 });
}

// Tiny arcade bleeps for the cabinets.
export function beep(freq = 660, dur = 0.06) {
  tone(freq, { type: "square", dur, gain: 0.05 });
}
