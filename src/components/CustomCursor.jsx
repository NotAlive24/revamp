import { useEffect, useRef, useState } from "react";
import "./CustomCursor.css";

const STORAGE_KEY = "notalive-cursor-enabled";
const IDLE_MS = 4500;

export default function CustomCursor({ selector = ".cursor-hoverable" }) {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(true);

  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const tagRef = useRef(null);
  const cornerRefs = useRef({});

  useEffect(() => {
    const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    const isAutomated = typeof navigator !== "undefined" && navigator.webdriver;
    setSupported(!isTouch && !isAutomated);

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved !== null) setEnabled(saved === "true");
  }, []);

  useEffect(() => {
    if (!supported || !enabled) {
      document.documentElement.classList.remove("notalive-cursor-active");
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const tag = tagRef.current;
    const corners = cornerRefs.current;

    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let ringPos = { ...mouse };
    let hovering = false;
    let rafId;
    let lastMoveAt = Date.now();
    let idlePinged = false;

    const toHex = (n) => n.toString(16).padStart(4, "0").toUpperCase();

    const spawnPing = (x, y) => {
      const p = document.createElement("div");
      p.className = "notalive-cursor-ping";
      p.style.left = x + "px";
      p.style.top = y + "px";
      document.body.appendChild(p);
      p.addEventListener("animationend", () => p.remove());
    };

    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      lastMoveAt = Date.now();
      idlePinged = false;
      dot.style.left = mouse.x + "px";
      dot.style.top = mouse.y + "px";
      if (!hovering) {
        tag.textContent = `X:${toHex(Math.round(mouse.x))} Y:${toHex(Math.round(mouse.y))}`;
        tag.style.left = mouse.x + "px";
        tag.style.top = mouse.y + "px";
      }
    };

    const tick = () => {
      const ease = reduceMotion ? 1 : 0.2;
      ringPos.x += (mouse.x - ringPos.x) * ease;
      ringPos.y += (mouse.y - ringPos.y) * ease;
      ring.style.left = ringPos.x + "px";
      ring.style.top = ringPos.y + "px";

      if (!reduceMotion && !hovering && !idlePinged && Date.now() - lastMoveAt > IDLE_MS) {
        spawnPing(mouse.x, mouse.y);
        idlePinged = true;
      }

      rafId = requestAnimationFrame(tick);
    };

    const attachHoverHandlers = (el) => {
      const onEnter = () => {
        hovering = true;
        const r = el.getBoundingClientRect();
        const pad = 6;
        ring.classList.add("hidden");

        corners.tl.style.left = r.left - pad + "px";
        corners.tl.style.top = r.top - pad + "px";
        corners.tr.style.left = r.right + pad - 12 + "px";
        corners.tr.style.top = r.top - pad + "px";
        corners.bl.style.left = r.left - pad + "px";
        corners.bl.style.top = r.bottom + pad - 12 + "px";
        corners.br.style.left = r.right + pad - 12 + "px";
        corners.br.style.top = r.bottom + pad - 12 + "px";
        Object.values(corners).forEach((c) => c.classList.add("on"));

        tag.textContent = `[ ${el.dataset.cursorLabel || "SELECT"} ]`;
        tag.style.left = r.right + pad + "px";
        tag.style.top = r.top - pad + "px";
      };
      const onLeave = () => {
        hovering = false;
        ring.classList.remove("hidden");
        Object.values(corners).forEach((c) => c.classList.remove("on"));
      };
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
      return () => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      };
    };

    const onMouseDown = (e) => spawnPing(e.clientX, e.clientY);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    rafId = requestAnimationFrame(tick);

    // Re-scan for hoverable elements whenever the DOM changes (route changes,
    // new writeup cards rendering, etc.) so this stays a "mount once" component.
    const cleanupFns = [];
    const scan = () => {
      cleanupFns.splice(0).forEach((fn) => fn());
      document.querySelectorAll(selector).forEach((el) => {
        cleanupFns.push(attachHoverHandlers(el));
      });
    };
    scan();
    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });

    document.documentElement.classList.add("notalive-cursor-active");

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      observer.disconnect();
      cleanupFns.forEach((fn) => fn());
      document.documentElement.classList.remove("notalive-cursor-active");
    };
  }, [supported, enabled, selector]);

  const toggle = () => {
    setEnabled((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  if (!supported) return null;

  return (
    <>
      {enabled && (
        <div className="notalive-cursor-root" aria-hidden="true">
          <div ref={dotRef} className="notalive-cursor-dot" />
          <div ref={ringRef} className="notalive-cursor-ring" />
          <span ref={(el) => (cornerRefs.current.tl = el)} className="notalive-cursor-corner tl" />
          <span ref={(el) => (cornerRefs.current.tr = el)} className="notalive-cursor-corner tr" />
          <span ref={(el) => (cornerRefs.current.bl = el)} className="notalive-cursor-corner bl" />
          <span ref={(el) => (cornerRefs.current.br = el)} className="notalive-cursor-corner br" />
          <div ref={tagRef} className="notalive-cursor-tag">X:0000 Y:0000</div>
        </div>
      )}
      <button
        type="button"
        className="notalive-cursor-toggle cursor-hoverable"
        data-cursor-label="TOGGLE"
        onClick={toggle}
        aria-pressed={enabled}
        aria-label="Toggle custom cursor effect"
      >
        [ SCAN: {enabled ? "ON" : "OFF"} ]
      </button>
    </>
  );
}