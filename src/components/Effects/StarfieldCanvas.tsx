import { useEffect, useRef } from 'react';
import type { StarfieldConfig } from '@/types';

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  twinkleOffset: number;
}

export function StarfieldCanvas({ config }: { config: StarfieldConfig }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        canvas.width = entry.contentRect.width;
        canvas.height = entry.contentRect.height;
      }
    });
    resizeObserver.observe(canvas.parentElement!);

    const init = () => {
      const w = canvas.width || 800;
      const h = canvas.height || 400;
      starsRef.current = Array.from({ length: config.density }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random(),
        size: 0.5 + Math.random() * 2,
        twinkleOffset: Math.random() * Math.PI * 2,
      }));
    };
    init();

    let time = 0;
    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      if (!w || !h) {
        animRef.current = requestAnimationFrame(animate);
        return;
      }

      time += 0.016;
      ctx.clearRect(0, 0, w, h);

      const hexColor = config.color;
      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);

      for (const star of starsRef.current) {
        star.y += config.speed * (0.5 + star.z);
        if (star.y > h) {
          star.y = 0;
          star.x = Math.random() * w;
        }

        const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(time * 2 + star.twinkleOffset));
        const alpha = twinkle * (0.3 + star.z * 0.7);
        const size = star.size * (0.5 + star.z * 0.5);

        ctx.globalAlpha = alpha;
        ctx.fillStyle = `rgb(${r},${g},${b})`;

        ctx.beginPath();
        ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
        ctx.fill();

        if (star.z > 0.8) {
          ctx.globalAlpha = alpha * 0.3;
          ctx.beginPath();
          ctx.arc(star.x, star.y, size * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animRef.current);
      resizeObserver.disconnect();
    };
  }, [config]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  );
}
