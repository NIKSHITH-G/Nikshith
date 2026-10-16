// Two octaves from C4, shared by the on-screen piano and the 3D piano keys.
// `k` is the computer key that plays it.
export const WHITE = [
  { n: "C4", f: 261.63, k: "a" }, { n: "D4", f: 293.66, k: "s" }, { n: "E4", f: 329.63, k: "d" },
  { n: "F4", f: 349.23, k: "f" }, { n: "G4", f: 392.0, k: "g" }, { n: "A4", f: 440.0, k: "h" },
  { n: "B4", f: 493.88, k: "j" }, { n: "C5", f: 523.25, k: "k" }, { n: "D5", f: 587.33, k: "l" },
  { n: "E5", f: 659.25, k: ";" },
];

// Black keys sit after the white key at index `after`.
export const BLACK = [
  { n: "C#4", f: 277.18, k: "w", after: 0 }, { n: "D#4", f: 311.13, k: "e", after: 1 },
  { n: "F#4", f: 369.99, k: "t", after: 3 }, { n: "G#4", f: 415.3, k: "y", after: 4 },
  { n: "A#4", f: 466.16, k: "u", after: 5 }, { n: "C#5", f: 554.37, k: "o", after: 7 },
  { n: "D#5", f: 622.25, k: "p", after: 8 },
];

export const ALL_NOTES = [...WHITE, ...BLACK];
