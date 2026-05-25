import { useState, useEffect, useCallback, useRef } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { SlideRenderer } from './SlideRenderer';
import type { TransitionType } from '@/types';

function getTransitionStyles(_transition: TransitionType) {
  const enterFrom: Record<TransitionType, string> = {
    none: '',
    fade: 'opacity:0;',
    dissolve: 'opacity:0; filter:blur(8px);',
    'slide-left': 'transform:translateX(100%);',
    'slide-right': 'transform:translateX(-100%);',
    'slide-up': 'transform:translateY(100%);',
    'slide-down': 'transform:translateY(-100%);',
    'zoom-in': 'opacity:0; transform:scale(0.8);',
    'zoom-out': 'opacity:0; transform:scale(1.2);',
  };

  const exitTo: Record<TransitionType, string> = {
    none: '',
    fade: 'opacity:0;',
    dissolve: 'opacity:0; filter:blur(8px);',
    'slide-left': 'transform:translateX(-100%);',
    'slide-right': 'transform:translateX(100%);',
    'slide-up': 'transform:translateY(-100%);',
    'slide-down': 'transform:translateY(100%);',
    'zoom-in': 'opacity:0; transform:scale(1.2);',
    'zoom-out': 'opacity:0; transform:scale(0.8);',
  };

  return { enterFrom, exitTo };
}

export function SlidePreview() {
  const { project, setEditorStep } = useProjectStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const slides = project.slides;
  const kv = project.keyVisual;
  const hasSlides = slides.length > 0;
  const currentSlide = hasSlides ? slides[currentIndex] : null;

  const go = useCallback((i: number) => {
    if (i < 0 || i >= slides.length || i === currentIndex || transitioning) return;
    setPrevIndex(currentIndex);
    setCurrentIndex(i);
    setElapsed(0);
    setTransitioning(true);
    setTimeout(() => {
      setPrevIndex(null);
      setTransitioning(false);
    }, 650);
  }, [slides.length, currentIndex, transitioning]);

  const goNext = useCallback(() => go(currentIndex < slides.length - 1 ? currentIndex + 1 : 0), [currentIndex, slides.length, go]);
  const goPrev = useCallback(() => go(currentIndex > 0 ? currentIndex - 1 : slides.length - 1), [currentIndex, slides.length, go]);

  useEffect(() => {
    if (!isPlaying || !hasSlides) return;
    const duration = slides[currentIndex]?.duration ?? 5000;
    setElapsed(0);
    const start = Date.now();
    const interval = setInterval(() => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      setElapsed(progress);
      if (progress >= 1) { clearInterval(interval); goNext(); }
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, hasSlides, slides, goNext]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev();
      if (e.key === ' ') { e.preventDefault(); setIsPlaying((p) => !p); }
      if (e.key === 'Escape') { if (isFullscreen) document.exitFullscreen?.(); else setEditorStep('slides'); }
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

  const transition = currentSlide?.transition || 'fade';
  const { enterFrom, exitTo } = getTransitionStyles(transition);

  const currentStyle: React.CSSProperties = {
    position: 'absolute', inset: 0,
    transition: 'opacity 0.6s cubic-bezier(.22,1,.36,1), transform 0.6s cubic-bezier(.22,1,.36,1), filter 0.6s cubic-bezier(.22,1,.36,1)',
    opacity: 1, transform: 'none', filter: 'none',
  };

  const enterStyle: React.CSSProperties = (() => {
    const s: React.CSSProperties = { ...currentStyle };
    const from = enterFrom[transition];
    if (from.includes('opacity:0')) s.opacity = 0;
    if (from.includes('translateX(100%)')) s.transform = 'translateX(100%)';
    if (from.includes('translateX(-100%)')) s.transform = 'translateX(-100%)';
    if (from.includes('translateY(100%)')) s.transform = 'translateY(100%)';
    if (from.includes('translateY(-100%)')) s.transform = 'translateY(-100%)';
    if (from.includes('scale(0.8)')) { s.opacity = 0; s.transform = 'scale(0.8)'; }
    if (from.includes('scale(1.2)')) { s.opacity = 0; s.transform = 'scale(1.2)'; }
    if (from.includes('blur')) s.filter = 'blur(8px)';
    return s;
  })();

  const exitStyle: React.CSSProperties = (() => {
    const s: React.CSSProperties = { ...currentStyle };
    const to = exitTo[transition];
    if (to.includes('opacity:0')) s.opacity = 0;
    if (to.includes('translateX(-100%)')) s.transform = 'translateX(-100%)';
    if (to.includes('translateX(100%)')) s.transform = 'translateX(100%)';
    if (to.includes('translateY(-100%)')) s.transform = 'translateY(-100%)';
    if (to.includes('translateY(100%)')) s.transform = 'translateY(100%)';
    if (to.includes('scale(1.2)')) { s.opacity = 0; s.transform = 'scale(1.2)'; }
    if (to.includes('scale(0.8)')) { s.opacity = 0; s.transform = 'scale(0.8)'; }
    if (to.includes('blur')) s.filter = 'blur(8px)';
    return s;
  })();

  return (
    <div ref={containerRef} className={`preview-container ${isFullscreen ? 'preview-fullscreen' : ''}`}>
      {!isFullscreen && (
        <div className="preview-toolbar">
          <button className="btn-secondary" onClick={() => setEditorStep('slides')}>&larr; 편집으로</button>
          <div className="preview-info"><span className="preview-spec">{kv.name}</span></div>
          <div className="preview-controls">
            <button className="btn-icon" onClick={goPrev} disabled={!hasSlides}>&#x25C0;</button>
            <button className="btn-icon play-btn" onClick={() => setIsPlaying((p) => !p)} disabled={!hasSlides}>{isPlaying ? '⏸' : '▶'}</button>
            <button className="btn-icon" onClick={goNext} disabled={!hasSlides}>&#x25B6;</button>
            {hasSlides && <span className="slide-counter">{currentIndex + 1} / {slides.length}</span>}
            <button className="btn-icon fullscreen-btn" onClick={toggleFullscreen}>&#x26F6;</button>
          </div>
        </div>
      )}

      {hasSlides && (
        <div className="preview-timeline">
          {slides.map((slide, i) => (
            <div key={slide.id} className={`timeline-segment ${i === currentIndex ? 'active' : ''} ${i < currentIndex ? 'done' : ''}`} onClick={() => go(i)} title={slide.label}>
              <div className="timeline-fill" style={{ width: i === currentIndex ? `${elapsed * 100}%` : i < currentIndex ? '100%' : '0%' }} />
              <span className="timeline-label">{i + 1}</span>
            </div>
          ))}
        </div>
      )}

      <div className="preview-screen" style={{
        aspectRatio: `${project.screen.widthPx} / ${project.screen.heightPx}`,
        background: kv.gradientCss || kv.backgroundColor,
        color: kv.primaryColor, fontFamily: kv.fontFamily,
        overflow: 'hidden',
      }}>
        {/* Exiting slide */}
        {prevIndex !== null && slides[prevIndex] && (
          <div style={{
            ...exitStyle,
            background: slides[prevIndex].backgroundColor || 'transparent',
          }}>
            <SlideRenderer slide={slides[prevIndex]} kv={kv} />
          </div>
        )}

        {/* Current slide */}
        {hasSlides && currentSlide && (
          <div style={{
            ...(prevIndex !== null ? enterStyle : currentStyle),
            ...(prevIndex === null ? {} : {}),
            background: currentSlide.backgroundColor || 'transparent',
          }}
          ref={(el) => {
            if (el && prevIndex !== null) {
              requestAnimationFrame(() => {
                el.style.opacity = '1';
                el.style.transform = 'none';
                el.style.filter = 'none';
              });
            }
          }}
          >
            <SlideRenderer slide={currentSlide} kv={kv} />
          </div>
        )}

        {!hasSlides && <div className="preview-empty-overlay"><p className="preview-empty-text">슬라이드를 추가하면 여기에 표시됩니다</p></div>}
      </div>

      {isFullscreen && hasSlides && (
        <div className="fullscreen-controls">
          <button className="btn-icon fs-btn" onClick={goPrev}>&#x25C0;</button>
          <button className="btn-icon fs-btn play-btn" onClick={() => setIsPlaying((p) => !p)}>{isPlaying ? '⏸' : '▶'}</button>
          <button className="btn-icon fs-btn" onClick={goNext}>&#x25B6;</button>
          <span className="fs-counter">{currentIndex + 1} / {slides.length}</span>
          <span className="fs-label">{currentSlide?.label}</span>
        </div>
      )}

      {!isFullscreen && (
        <div className="preview-shortcuts">
          <span>&larr; &rarr; 이동</span><span>Space 재생/정지</span><span>F 풀스크린</span><span>Esc 편집으로</span>
        </div>
      )}
    </div>
  );
}
