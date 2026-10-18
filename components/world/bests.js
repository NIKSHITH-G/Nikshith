// Your personal bests from the gym games (sprint, bag combo, squat), kept in this browser.
// Setting one fires "studio:pr" so the PR board on the gym wall can redraw.

export const best = {
  get(k) {
    try {
      return JSON.parse(localStorage.getItem(`studio-best-${k}`));
    } catch {
      return null;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(`studio-best-${k}`, JSON.stringify(v));
    } catch {}
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("studio:pr", { detail: k }));
  },
};
