import { useRef, useEffect } from 'react';
import type { BackgroundEffect as BgEffect } from '@/types';

export function BackgroundEffect({ effect, accentColor }: { effect: BgEffect; accentColor: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (effect === 'none') return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    let W = 0, H = 0;
    let onResizeExtra: (() => void) | null = null;

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
      onResizeExtra?.();
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    if (effect === 'starfield') {
      const STAR_COUNT = 300;
      let cx = 0, cy = 0, maxDist = 0;

      interface Star { angle: number; dist: number; speed: number }
      let stars: Star[] = [];

      function mkStar(spread: boolean): Star {
        return {
          angle: Math.random() * Math.PI * 2,
          dist: spread ? Math.random() : Math.random() * 0.08,
          speed: Math.random() * 0.0005 + 0.0002,
        };
      }

      function initStarfield() {
        cx = W / 2;
        cy = H / 2;
        maxDist = Math.sqrt(cx * cx + cy * cy) * 1.15;
        stars = Array.from({ length: STAR_COUNT }, () => mkStar(true));
      }

      onResizeExtra = () => {
        cx = W / 2;
        cy = H / 2;
        maxDist = Math.sqrt(cx * cx + cy * cy) * 1.15;
      };

      initStarfield();

      function animateStarfield() {
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
        rafRef.current = requestAnimationFrame(animateStarfield);
      }
      animateStarfield();

    } else if (effect === 'particles') {
      const PARTICLE_COUNT = 80;
      const CONNECT_DIST = 120;

      function hexToRgb(hex: string) {
        const m = hex.replace('#', '').match(/.{2}/g);
        if (!m) return { r: 79, g: 140, b: 255 };
        return { r: parseInt(m[0], 16), g: parseInt(m[1], 16), b: parseInt(m[2], 16) };
      }
      const rgb = hexToRgb(accentColor);

      interface Particle { x: number; y: number; vx: number; vy: number; size: number; accent: boolean }
      let particles: Particle[] = [];

      function initParticles() {
        particles = Array.from({ length: PARTICLE_COUNT }, () => ({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 2.5 + 1,
          accent: Math.random() < 0.3,
        }));
      }

      initParticles();

      function animateParticles() {
        ctx.clearRect(0, 0, W, H);
        for (const p of particles) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
        }
        // draw connections
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CONNECT_DIST) {
              const alpha = (1 - dist / CONNECT_DIST) * 0.15;
              ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
        // draw particles
        for (const p of particles) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          if (p.accent) {
            ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.7)`;
          } else {
            ctx.fillStyle = 'rgba(200,200,210,0.4)';
          }
          ctx.fill();
        }
        rafRef.current = requestAnimationFrame(animateParticles);
      }
      animateParticles();

    } else if (effect === 'gradient-wave') {
      function hexToRgb(hex: string) {
        const m = hex.replace('#', '').match(/.{2}/g);
        if (!m) return { r: 79, g: 140, b: 255 };
        return { r: parseInt(m[0], 16), g: parseInt(m[1], 16), b: parseInt(m[2], 16) };
      }
      const rgb = hexToRgb(accentColor);

      interface Blob { x: number; y: number; vx: number; vy: number; radius: number }
      let blobs: Blob[] = [];

      function initBlobs() {
        blobs = Array.from({ length: 4 }, () => ({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.min(W, H) * (0.2 + Math.random() * 0.2),
        }));
      }

      initBlobs();

      function animateGradientWave() {
        ctx.clearRect(0, 0, W, H);
        for (const b of blobs) {
          b.x += b.vx;
          b.y += b.vy;
          if (b.x < -b.radius) b.x = W + b.radius;
          if (b.x > W + b.radius) b.x = -b.radius;
          if (b.y < -b.radius) b.y = H + b.radius;
          if (b.y > H + b.radius) b.y = -b.radius;

          const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
          grad.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},0.12)`);
          grad.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        rafRef.current = requestAnimationFrame(animateGradientWave);
      }
      animateGradientWave();

    } else if (effect === 'bokeh') {
      function hexToRgb(hex: string) {
        const m = hex.replace('#', '').match(/.{2}/g);
        if (!m) return { r: 79, g: 140, b: 255 };
        return { r: parseInt(m[0], 16), g: parseInt(m[1], 16), b: parseInt(m[2], 16) };
      }
      const rgb = hexToRgb(accentColor);

      interface Circle { x: number; y: number; vx: number; vy: number; radius: number; alpha: number; tint: boolean }
      let circles: Circle[] = [];

      function initBokeh() {
        circles = Array.from({ length: 25 }, () => ({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 40 + 10,
          alpha: Math.random() * 0.12 + 0.03,
          tint: Math.random() < 0.5,
        }));
      }

      initBokeh();

      function animateBokeh() {
        ctx.clearRect(0, 0, W, H);
        for (const c of circles) {
          c.x += c.vx;
          c.y += c.vy;
          if (c.x < -c.radius * 2) c.x = W + c.radius * 2;
          if (c.x > W + c.radius * 2) c.x = -c.radius * 2;
          if (c.y < -c.radius * 2) c.y = H + c.radius * 2;
          if (c.y > H + c.radius * 2) c.y = -c.radius * 2;

          const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.radius);
          if (c.tint) {
            grad.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},${c.alpha})`);
            grad.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
          } else {
            grad.addColorStop(0, `rgba(220,220,230,${c.alpha})`);
            grad.addColorStop(1, `rgba(220,220,230,0)`);
          }
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        rafRef.current = requestAnimationFrame(animateBokeh);
      }
      animateBokeh();

    } else if (effect === 'grid') {
      let time = 0;

      function animateGrid() {
        ctx.clearRect(0, 0, W, H);
        time += 0.005;
        const pulseFactor = 0.5 + 0.5 * Math.sin(time);
        const alpha = 0.06 + pulseFactor * 0.06;

        const spacing = 40;
        const vanishY = H * 0.35;
        const cx = W / 2;

        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.lineWidth = 0.5;

        // horizontal lines (perspective)
        const hLineCount = 20;
        for (let i = 0; i <= hLineCount; i++) {
          const t = i / hLineCount;
          const y = vanishY + (H - vanishY) * (t * t);
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(W, y);
          ctx.stroke();
        }

        // vertical lines (perspective from center)
        const vLineCount = Math.ceil(W / spacing);
        for (let i = -vLineCount; i <= vLineCount; i++) {
          const baseX = cx + i * spacing;
          ctx.beginPath();
          ctx.moveTo(cx + (baseX - cx) * 0.02, vanishY);
          ctx.lineTo(baseX, H);
          ctx.stroke();
        }

        rafRef.current = requestAnimationFrame(animateGrid);
      }
      animateGrid();
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [effect, accentColor]);

  if (effect === 'none') return null;

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
