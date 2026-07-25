import { useEffect, useRef } from "react";
import "./CustomCursor.css";

export default function CustomCursor({ selector = ".cursor-hoverable" }) {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const tagRef = useRef(null);
  const cornerRefs = useRef({});

  useEffect(() => {
    const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    if (isTouch) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const tag = tagRef.current;
    const corners = cornerRefs.current;

    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let ringPos = { ...mouse };
    let hovering = false;
    let rafId;

    const toHex = (n) => n.toString(16).padStart(4, "0").toUpperCase();

    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
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

    const onMouseDown = (e) => {
      const p = document.createElement("div");
      p.className = "notalive-cursor-ping";
      p.style.left = e.clientX + "px";
      p.style.top = e.clientY + "px";
      document.body.appendChild(p);
      p.addEventListener("animationend", () => p.remove());
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    rafId = requestAnimationFrame(tick);

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
  }, [selector]);

  return (
    <div className="notalive-cursor-root" aria-hidden="true">
      <div ref={dotRef} className="notalive-cursor-dot" />
      <div ref={ringRef} className="notalive-cursor-ring" />
      <span ref={(el) => (cornerRefs.current.tl = el)} className="notalive-cursor-corner tl" />
      <span ref={(el) => (cornerRefs.current.tr = el)} className="notalive-cursor-corner tr" />
      <span ref={(el) => (cornerRefs.current.bl = el)} className="notalive-cursor-corner bl" />
      <span ref={(el) => (cornerRefs.current.br = el)} className="notalive-cursor-corner br" />
      <div ref={tagRef} className="notalive-cursor-tag">X:0000 Y:0000</div>
    </div>
  );
}
