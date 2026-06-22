import { useEffect, useRef } from "react";

export default function StarBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = window.innerWidth;
    let height = window.innerHeight;
    let stars = [];
    let animationFrame;

    const mouse = {
      x: -9999,
      y: -9999,
      targetX: -9999,
      targetY: -9999,
    };

    function random(min, max) {
      return Math.random() * (max - min) + min;
    }

    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      createStars();
    }

    function createStars() {
      const starCount = Math.min(
        180,
        Math.max(80, Math.floor((width * height) / 9000))
      );

      stars = Array.from({ length: starCount }, () => ({
        x: random(0, width),
        y: random(0, height),
        size: random(0.8, 2.2),
        opacity: random(0.35, 0.9),
        phase: random(0, Math.PI * 2),
        speed: random(0.6, 1.4),
        drift: random(0.4, 1.6),
      }));
    }

    function handlePointerMove(event) {
      mouse.targetX = event.clientX;
      mouse.targetY = event.clientY;
    }

    function animate(time) {
      ctx.clearRect(0, 0, width, height);

      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      for (const star of stars) {
        const dx = star.x - mouse.x;
        const dy = star.y - mouse.y;

        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const radius = 160;

        const force = Math.max(0, 1 - distance / radius);

        const pushX = (dx / distance) * force * 42;
        const pushY = (dy / distance) * force * 42;

        const jiggleX =
          Math.sin(time * 0.002 * star.speed + star.phase) * star.drift;

        const jiggleY =
          Math.cos(time * 0.002 * star.speed + star.phase) * star.drift;

        const x = star.x + pushX + jiggleX;
        const y = star.y + pushY + jiggleY;

        const twinkle =
          star.opacity +
          Math.sin(time * 0.003 * star.speed + star.phase) * 0.2;

        ctx.beginPath();
        ctx.arc(x, y, star.size + force * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
        ctx.fill();
      }

      animationFrame = requestAnimationFrame(animate);
    }

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("pointermove", handlePointerMove);

    animationFrame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("pointermove", handlePointerMove);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <canvas className="star-background" ref={canvasRef} />;
}