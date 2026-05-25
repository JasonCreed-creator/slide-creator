import { useState, useEffect, useCallback, useRef } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { BackgroundRenderer } from '@/components/Effects';
import { SlideContentRenderer } from './LivePreview';
import type { TransitionType, ContentAnimationType } from '@/types';

function getTransitionStyle(
  transition: TransitionType,
  phase: 'enter' | 'exit' | 'idle',
): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
    backfaceVisibility: 'hidden',
  };

  if (phase === 'idle') return { ...base, opacity: 1, transform: 'none' };

  const styles: Record<TransitionType, React.CSSProperties> = {
    none: { opacity: 1 },
    fade: { opacity: 0 },
    dissolve: { opacity: 0, filter: 'blur(12px)' },
    'slide-left': { transform: phase === 'enter' ? 'translateX(100%)' : 'translateX(-100%)' },
    'slide-right': { transform: phase === 'enter' ? 'translateX(-100%)' : 'translateX(100%)' },
    'slide-up': { transform: phase === 'enter' ? 'translateY(100%)' : 'translateY(-100%)' },
    'slide-down': { transform: phase === 'enter' ? 'translateY(-100%)' : 'translateY(100%)' },
    'zoom-in': { opacity: 0, transform: phase === 'enter' ? 'scale(0.3)' : 'scale(1.5)' },
    'zoom-out': { opacity: 0, transform: phase === 'enter' ? 'scale(1.8)' : 'scale(0.3)' },
    cube: {
      transform: phase === 'enter' ? 'perspective(1200px) rotateY(90deg)' : 'perspective(1200px) rotateY(-90deg)',
      opacity: phase === 'enter' ? 0 : 1,
      transformOrigin: phase === 'enter' ? 'left center' : 'right center',
    },
    'flip-x': { transform: phase === 'enter' ? 'perspective(1200px) rotateY(180deg)' : 'perspective(1200px) rotateY(-180deg)', opacity: 0 },
    'flip-y': { transform: phase === 'enter' ? 'perspective(1200px) rotateX(180deg)' : 'perspective(1200px) rotateX(-180deg)', opacity: 0 },
    morph: { opacity: 0, transform: phase === 'enter' ? 'scale(0.8) rotate(5deg)' : 'scale(1.2) rotate(-5deg)', filter: 'blur(6px)' },
    glitch: { opacity: 0, transform: phase === 'enter' ? 'translateX(10px) skewX(5deg)' : 'translateX(-10px) skewX(-5deg)', filter: 'hue-rotate(90deg) saturate(2)' },
    'wipe-left': { clipPath: phase === 'enter' ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)' },
    'wipe-right': { clipPath: phase === 'enter' ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' },
    iris: { clipPath: 'circle(0% at 50% 50%)' },
  };

  return { ...base, ...styles[transition] };
}

function getContentAnimClass(anim?: ContentAnimationType): string {
  if (!anim || anim === 'none') return '';
  return `content-animate-${anim}`;
}

export function SlidePreview() {
  const { project, setEditorStep } = useProjectStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState<'idle' | 'exiting' | 'entering'>('idle');
  const [displayIndex, setDisplayIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number>(0);

  const slides = project.slides;
  const kv = project.keyVisual;
  const hasSlides = slides.length > 0;
  const currentSlide = hasSlides ? slides[displayIndex] : null;

  const transitionTo = useCallback(
    (nextIndex: number) => {
      if (slides.length === 0 || nextIndex === displayIndex) return;
      setTransitionPhase('exiting');
      setTimeout(() => {
        setDisplayIndex(nextIndex);
        setCurrentIndex(nextIndex);
        setTransitionPhase('entering');
        setAnimKey((k) => k + 1);
        setTimeout(() => setTransitionPhase('idle'), 50);
      }, 700);
    },
    [slides.length, displayIndex],
  );

  const goNext = useCallback(() => {
    if (!hasSlides) return;
    transitionTo(currentIndex < slides.length - 1 ? currentIndex + 1 : 0);
  }, [currentIndex, slides.length, hasSlides, transitionTo]);

  const goPrev = useCallback(() => {
    if (!hasSlides) return;
    transitionTo(currentIndex > 0 ? currentIndex - 1 : slides.length - 1);
  }, [currentIndex, slides.length, hasSlides, transitionTo]);

  useEffect(() => {
    if (!isPlaying || !hasSlides) return;
    const duration = slides[currentIndex]?.duration ?? 5000;
    setElapsed(0);
    const startTime = Date.now();
    const interval = window.setInterval(() => {
      const progress = Math.min((Date.now() - startTime) / duration, 1);
      setElapsed(progress);
      if (progress >= 1) { clearInterval(interval); goNext(); }
    }, 50);
    timerRef.current = interval;
    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, hasSlides, slides, goNext]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev();
      if (e.key === ' ') { e.preventDefault(); setIsPlaying((p) => !p); }
      if (e.key === 'Escape') { isFullscreen ? document.exitFullscreen?.() : setEditorStep('slides'); }
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, setEditorStep, isFullscreen]);

  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    document.fullscreenElement ? document.exitFullscreen() : containerRef.current.requestFullscreen();
  };

  const transition = currentSlide?.transition ?? 'fade';
  const bg = currentSlide?.backgroundColor === '__theme__' || !currentSlide?.backgroundColor
    ? (kv.gradientCss || kv.backgroundColor)
    : currentSlide.backgroundColor;
  const effect = currentSlide?.backgroundEffect?.type !== 'none' ? currentSlide?.backgroundEffect : kv.backgroundEffect;

  return (
    <div ref={containerRef} className={`preview-container ${isFullscreen ? 'preview-fullscreen' : ''}`}>
      {!isFullscreen && (
        <div className="preview-toolbar">
          <button className="btn-secondary" onClick={() => setEditorStep('slides')}>← 편집</button>
          <div className="preview-info">
            <span className="preview-spec">{project.screen.name} · {project.layout.name} · {kv.name}</span>
          </div>
          <div className="preview-controls">
            <button className="btn-icon" onClick={goPrev} disabled={!hasSlides}>◀</button>
            <button className="btn-icon play-btn" onClick={() => setIsPlaying((p) => !p)} disabled={!hasSlides}>
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button className="btn-icon" onClick={goNext} disabled={!hasSlides}>▶</button>
            {hasSlides && <span className="slide-counter">{currentIndex + 1} / {slides.length}</span>}
            <button className="btn-icon fullscreen-btn" onClick={toggleFullscreen}>⛶</button>
          </div>
        </div>
      )}

      {hasSlides && (
        <div className="preview-timeline">
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className={`timeline-segment ${i === currentIndex ? 'active' : ''} ${i < currentIndex ? 'done' : ''}`}
              onClick={() => transitionTo(i)}
              title={`${slide.label} (${slide.duration / 1000}s)`}
            >
              <div className="timeline-fill" style={{ width: i === currentIndex ? `${elapsed * 100}%` : i < currentIndex ? '100%' : '0%' }} />
              <span className="timeline-label">{i + 1}</span>
            </div>
          ))}
        </div>
      )}

      <div
        className="preview-screen"
        style={{
          aspectRatio: `${project.screen.widthPx} / ${project.screen.heightPx}`,
          background: bg,
          color: kv.primaryColor,
          fontFamily: kv.fontFamily,
          perspective: '1200px',
        }}
      >
        <BackgroundRenderer effect={effect} />

        {project.layout.zones.map((zone) => (
          <div
            key={zone.id}
            className="preview-zone"
            style={{
              position: 'absolute',
              left: `${zone.x}%`, top: `${zone.y}%`,
              width: `${zone.width}%`, height: `${zone.height}%`,
            }}
          >
            <span className="zone-label">{zone.label}</span>
          </div>
        ))}

        {hasSlides && currentSlide && (
          <div
            className="slide-content-layer"
            style={
              transitionPhase === 'idle'
                ? getTransitionStyle(transition, 'idle')
                : transitionPhase === 'exiting'
                  ? getTransitionStyle(transition, 'exit')
                  : getTransitionStyle(transition, 'enter')
            }
          >
            <div key={animKey} className={transitionPhase === 'idle' ? getContentAnimClass(currentSlide.contentAnimation) : ''} style={{ width: '100%', height: '100%' }}>
              <SlideContentRenderer slide={currentSlide} />
            </div>
          </div>
        )}

        {!hasSlides && (
          <div className="preview-empty-overlay">
            <p className="preview-empty-text">슬라이드를 추가하면 여기에 콘텐츠가 표시됩니다</p>
          </div>
        )}
      </div>

      {isFullscreen && hasSlides && (
        <div className="fullscreen-controls">
          <button className="btn-icon fs-btn" onClick={goPrev}>◀</button>
          <button className="btn-icon fs-btn play-btn" onClick={() => setIsPlaying((p) => !p)}>{isPlaying ? '⏸' : '▶'}</button>
          <button className="btn-icon fs-btn" onClick={goNext}>▶</button>
          <span className="fs-counter">{currentIndex + 1} / {slides.length}</span>
          <span className="fs-label">{currentSlide?.label}</span>
        </div>
      )}

      {!isFullscreen && (
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
