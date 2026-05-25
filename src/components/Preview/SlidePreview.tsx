import { useState, useEffect, useCallback, useRef } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { BackgroundRenderer } from '@/components/Effects';
import { SlideContentRenderer } from './LivePreview';
import type { TransitionType, ContentAnimationType } from '@/types';

function getTransitionStyle(transition: TransitionType, phase: 'enter' | 'exit' | 'idle'): React.CSSProperties {
  const base: React.CSSProperties = { position: 'absolute', inset: 0, transition: 'all 0.7s cubic-bezier(0.4,0,0.2,1)', backfaceVisibility: 'hidden' };
  if (phase === 'idle') return { ...base, opacity: 1, transform: 'none' };
  const m: Record<TransitionType, React.CSSProperties> = {
    none: { opacity: 1 }, fade: { opacity: 0 }, dissolve: { opacity: 0, filter: 'blur(12px)' },
    'slide-left': { transform: phase === 'enter' ? 'translateX(100%)' : 'translateX(-100%)' },
    'slide-right': { transform: phase === 'enter' ? 'translateX(-100%)' : 'translateX(100%)' },
    'slide-up': { transform: phase === 'enter' ? 'translateY(100%)' : 'translateY(-100%)' },
    'slide-down': { transform: phase === 'enter' ? 'translateY(-100%)' : 'translateY(100%)' },
    'zoom-in': { opacity: 0, transform: phase === 'enter' ? 'scale(0.3)' : 'scale(1.5)' },
    'zoom-out': { opacity: 0, transform: phase === 'enter' ? 'scale(1.8)' : 'scale(0.3)' },
    cube: { transform: phase === 'enter' ? 'perspective(1200px) rotateY(90deg)' : 'perspective(1200px) rotateY(-90deg)', opacity: phase === 'enter' ? 0 : 1, transformOrigin: phase === 'enter' ? 'left center' : 'right center' },
    'flip-x': { transform: phase === 'enter' ? 'perspective(1200px) rotateY(180deg)' : 'perspective(1200px) rotateY(-180deg)', opacity: 0 },
    'flip-y': { transform: phase === 'enter' ? 'perspective(1200px) rotateX(180deg)' : 'perspective(1200px) rotateX(-180deg)', opacity: 0 },
    morph: { opacity: 0, transform: phase === 'enter' ? 'scale(0.8) rotate(5deg)' : 'scale(1.2) rotate(-5deg)', filter: 'blur(6px)' },
    glitch: { opacity: 0, transform: phase === 'enter' ? 'translateX(10px) skewX(5deg)' : 'translateX(-10px) skewX(-5deg)', filter: 'hue-rotate(90deg)' },
    'wipe-left': { clipPath: phase === 'enter' ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)' },
    'wipe-right': { clipPath: phase === 'enter' ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' },
    iris: { clipPath: 'circle(0% at 50% 50%)' },
  };
  return { ...base, ...m[transition] };
}

function getAnimClass(a?: ContentAnimationType | string): string {
  if (!a || a === 'none') return '';
  return `content-animate-${a}`;
}

export function SlidePreview() {
  const { project, setEditorStep, backgroundEffect } = useProjectStore();
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [fs, setFs] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'exiting' | 'entering'>('idle');
  const [dispIdx, setDispIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number>(0);

  const slides = project.slides;
  const kv = project.keyVisual;
  const has = slides.length > 0;
  const cur = has ? slides[dispIdx] : null;

  const goTo = useCallback((next: number) => {
    if (!slides.length || next === dispIdx) return;
    setPhase('exiting');
    setTimeout(() => { setDispIdx(next); setIdx(next); setPhase('entering'); setAnimKey(k => k + 1); setTimeout(() => setPhase('idle'), 50); }, 700);
  }, [slides.length, dispIdx]);

  const goNext = useCallback(() => { if (has) goTo(idx < slides.length - 1 ? idx + 1 : 0); }, [idx, slides.length, has, goTo]);
  const goPrev = useCallback(() => { if (has) goTo(idx > 0 ? idx - 1 : slides.length - 1); }, [idx, slides.length, has, goTo]);

  useEffect(() => {
    if (!playing || !has) return;
    const dur = slides[idx]?.duration ?? 5000;
    setElapsed(0);
    const t0 = Date.now();
    const iv = window.setInterval(() => { const p = Math.min((Date.now() - t0) / dur, 1); setElapsed(p); if (p >= 1) { clearInterval(iv); goNext(); } }, 50);
    timerRef.current = iv;
    return () => clearInterval(iv);
  }, [playing, idx, has, slides, goNext]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === ' ') { e.preventDefault(); setPlaying(p => !p); }
      if (e.key === 'Escape') { fs ? document.exitFullscreen?.() : setEditorStep('slides'); }
      if (e.key === 'f' || e.key === 'F') toggle();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [goNext, goPrev, setEditorStep, fs]);

  useEffect(() => {
    const h = () => setFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  const toggle = () => { if (!ref.current) return; document.fullscreenElement ? document.exitFullscreen() : ref.current.requestFullscreen(); };

  const bg = cur?.backgroundColor || kv.gradientCss || kv.backgroundColor;
  const eff = cur?.backgroundEffect || backgroundEffect;

  return (
    <div ref={ref} className={`preview-container ${fs ? 'preview-fullscreen' : ''}`}>
      {!fs && (
        <div className="preview-toolbar">
          <button className="btn-secondary" onClick={() => setEditorStep('slides')}>← 편집</button>
          <div className="preview-info"><span className="preview-spec">{project.screen.name} · {project.layout.name} · {kv.name}</span></div>
          <div className="preview-controls">
            <button className="btn-icon" onClick={goPrev} disabled={!has}>◀</button>
            <button className="btn-icon play-btn" onClick={() => setPlaying(p => !p)} disabled={!has}>{playing ? '⏸' : '▶'}</button>
            <button className="btn-icon" onClick={goNext} disabled={!has}>▶</button>
            {has && <span className="slide-counter">{idx + 1} / {slides.length}</span>}
            <button className="btn-icon fullscreen-btn" onClick={toggle}>⛶</button>
          </div>
        </div>
      )}

      {has && (
        <div className="preview-timeline">
          {slides.map((s, i) => (
            <div key={s.id} className={`timeline-segment ${i === idx ? 'active' : ''} ${i < idx ? 'done' : ''}`} onClick={() => goTo(i)} title={`${s.label} (${s.duration / 1000}s)`}>
              <div className="timeline-fill" style={{ width: i === idx ? `${elapsed * 100}%` : i < idx ? '100%' : '0%' }} />
              <span className="timeline-label">{i + 1}</span>
            </div>
          ))}
        </div>
      )}

      <div className="preview-screen" style={{ aspectRatio: `${project.screen.widthPx} / ${project.screen.heightPx}`, background: bg, color: kv.primaryColor, fontFamily: kv.fontFamily, perspective: '1200px' }}>
        <BackgroundRenderer effect={eff === 'starfield' ? { type: 'starfield', starfield: { density: 100, speed: 0.3, color: '#ffffff' } } : eff === 'particles' ? { type: 'particles', particles: { count: 50, color: 'rgba(255,255,255,0.3)', minSize: 1, maxSize: 3, speed: 0.5, connected: true, shape: 'circle' as const } } : eff === 'aurora' ? { type: 'aurora', aurora: { colors: [kv.accentColor, '#a855f7', '#06b6d4'], speed: 4, intensity: 0.6 } } : kv.backgroundEffect} />

        {project.layout.zones.map(z => (
          <div key={z.id} className="preview-zone" style={{ position: 'absolute', left: `${z.x}%`, top: `${z.y}%`, width: `${z.width}%`, height: `${z.height}%` }}>
            <span className="zone-label">{z.label}</span>
          </div>
        ))}

        {has && cur && (
          <div className="slide-content-layer" style={phase === 'idle' ? getTransitionStyle(cur.transition, 'idle') : phase === 'exiting' ? getTransitionStyle(cur.transition, 'exit') : getTransitionStyle(cur.transition, 'enter')}>
            <div key={animKey} className={phase === 'idle' ? getAnimClass(cur.entryAnimation) : ''} style={{ width: '100%', height: '100%' }}>
              <SlideContentRenderer slide={cur} />
            </div>
          </div>
        )}

        {!has && (
          <div className="preview-empty-overlay">
            <p className="preview-empty-text">슬라이드를 추가하면 여기에 콘텐츠가 표시됩니다</p>
          </div>
        )}
      </div>

      {fs && has && (
        <div className="fullscreen-controls">
          <button className="btn-icon fs-btn" onClick={goPrev}>◀</button>
          <button className="btn-icon fs-btn play-btn" onClick={() => setPlaying(p => !p)}>{playing ? '⏸' : '▶'}</button>
          <button className="btn-icon fs-btn" onClick={goNext}>▶</button>
          <span className="fs-counter">{idx + 1} / {slides.length}</span>
          <span className="fs-label">{cur?.label}</span>
        </div>
      )}

      {!fs && (
        <div className="preview-shortcuts">
          <span><span className="shortcut-key">←</span><span className="shortcut-key">→</span> 이동</span>
          <span><span className="shortcut-key">Space</span> 재생</span>
          <span><span className="shortcut-key">F</span> 풀스크린</span>
          <span><span className="shortcut-key">Esc</span> 편집</span>
        </div>
      )}
    </div>
  );
}
