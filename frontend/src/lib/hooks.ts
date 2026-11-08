"use client";

import { useEffect, useState, type RefObject } from "react";

export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

export function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setR(m.matches);
    const on = () => setR(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return r;
}

export function useWebGL(): "checking" | "ok" | "none" {
  const [s, setS] = useState<"checking" | "ok" | "none">("checking");
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      setS(c.getContext("webgl2") || c.getContext("webgl") ? "ok" : "none");
    } catch {
      setS("none");
    }
  }, []);
  return s;
}

export function useInView(ref: RefObject<Element | null>, margin = "200px") {
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setV(e.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return v;
}
