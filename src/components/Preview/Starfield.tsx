import { useRef, useEffect } from 'react';

export function Starfield({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    const STAR_COUNT = 300;
    let W = 0, H = 0, cx = 0, cy = 0, maxDist = 0;

    interface Star { angle: number; dist: number; speed: number }
    let stars: Star[] = [];

    function mkStar(spread: boolean): Star {
      return {
        angle: Math.random() * Math.PI * 2,
        dist: spread ? Math.random() : Math.random() * 0.08,
        speed: Math.random() * 0.0005 + 0.0002,
      };
    }

    function resize() {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      W = parent.clientWidth;
      H = parent.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W / 2;
      cy = H / 2;
      maxDist = Math.sqrt(cx * cx + cy * cy) * 1.15;
    }

    function init() {
      stars = Array.from({ length: STAR_COUNT }, () => mkStar(true));
    }

    function animate() {
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        s.dist += s.speed;
        if (s.dist > 1.05) { Object.assign(s, mkStar(false)); continue; }
        const d = s.dist * maxDist;
        const sx = cx + Math.cos(s.angle) * d;
        const sy = cy + Math.sin(s.angle) * d;
        const alpha = Math.min(1, s.dist * 2 + 0.18);
        const size = Math.max(0.3, s.dist * 3);
        const bri = Math.floor(190 + s.dist * 65);
        if (s.dist > 0.06) {
          const td = Math.max(0, (s.dist - s.speed * 3)) * maxDist;
          const px = cx + Math.cos(s.angle) * td;
          const py = cy + Math.sin(s.angle) * td;
          ctx.strokeStyle = `rgba(${bri},${bri + 6},${bri + 18},${alpha * 0.5})`;
          ctx.lineWidth = size * 0.55;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(sx, sy);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(sx, sy, size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${bri},${bri + 6},${bri + 18},${alpha})`;
        ctx.fill();
      }
      rafRef.current = requestAnimationFrame(animate);
    }

    resize();
    init();
    animate();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
