"use client";

import { useEffect, useSyncExternalStore } from "react";

// One shared copy of the live game for the whole page: the 3D board in the games
// room and the chess screen both read from here, and polling only runs while
// something is watching.
const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
let game = { fen: START, history: [], turn: "w", loading: true };
const listeners = new Set();
let watchers = 0;
let timer = null;

const emit = () => listeners.forEach((l) => l());
const set = (next) => {
  game = { ...game, ...next, loading: false };
  emit();
};

const OWNER_KEY = "studio-chess-owner";
export function ownerKey() {
  try {
    return localStorage.getItem(OWNER_KEY) || "";
  } catch {
    return "";
  }
}
export function setOwnerKey(k) {
  try {
    if (k) localStorage.setItem(OWNER_KEY, k);
    else localStorage.removeItem(OWNER_KEY);
  } catch {}
}
const headers = () => {
  const k = ownerKey();
  return { "Content-Type": "application/json", ...(k ? { "x-owner-key": k } : {}) };
};

export async function refresh() {
  try {
    const res = await fetch("/api/chess", { headers: headers(), cache: "no-store" });
    if (res.ok) set(await res.json());
  } catch {}
}

async function post(body) {
  const res = await fetch("/api/chess", { method: "POST", headers: headers(), body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (data.fen) set(data);
  return { ok: res.ok, ...data };
}

export const move = (from, to, promotion) => post({ from, to, promotion });
export const reset = () => post({ action: "reset" });
export const whoami = () => post({ action: "whoami" });

function subscribe(l) {
  listeners.add(l);
  return () => listeners.delete(l);
}

// Read the game and keep it fresh while mounted (every `ms`).
export function useChess(ms = 6000) {
  useEffect(() => {
    watchers++;
    if (watchers === 1) {
      refresh();
      timer = setInterval(refresh, ms);
    }
    return () => {
      watchers--;
      if (watchers === 0) clearInterval(timer);
    };
  }, [ms]);
  return useSyncExternalStore(subscribe, () => game, () => game);
}

// FEN → { a1: "R", e8: "k", ... }  (uppercase = white)
export function boardFromFen(fen) {
  const out = {};
  const rows = fen.split(" ")[0].split("/");
  rows.forEach((row, i) => {
    let file = 0;
    for (const ch of row) {
      if (/\d/.test(ch)) file += Number(ch);
      else {
        out[`${"abcdefgh"[file]}${8 - i}`] = ch;
        file++;
      }
    }
  });
  return out;
}
