import { useState, useEffect, useCallback, useRef } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import type { TransitionType } from '@/types';

function getTransitionStyle(
  transition: TransitionType,
  phase: 'enter' | 'exit' | 'idle',
): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    transition: 'all 0.6s ease-in-out',
  };

  if (phase === 'idle') return { ...base, opacity: 1, transform: 'none' };

  const hidden: Record<TransitionType, React.CSSProperties> = {
    none: { opacity: 1 },
    fade: { opacity: 0 },
    dissolve: { opacity: 0, filter: 'blur(8px)' },
    'slide-left': { transform: phase === 'enter' ? 'translateX(100%)' : 'translateX(-100%)' },
    'slide-right': { transform: phase === 'enter' ? 'translateX(-100%)' : 'translateX(100%)' },
    'slide-up': { transform: phase === 'enter' ? 'translateY(100%)' : 'translateY(-100%)' },
    'slide-down': { transform: phase === 'enter' ? 'translateY(-100%)' : 'translateY(100%)' },
    'zoom-in': { opacity: 0, transform: phase === 'enter' ? 'scale(0.5)' : 'scale(1.5)' },
    'zoom-out': { opacity: 0, transform: phase === 'enter' ? 'scale(1.5)' : 'scale(0.5)' },
  };

  return { ...base, ...hidden[transition] };
}

export function SlidePreview() {
  const { project, setEditorStep } = useProjectStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState<'idle' | 'exiting' | 'entering'>('idle');
  const [displayIndex, setDisplayIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
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
        setTimeout(() => setTransitionPhase('idle'), 50);
      }, 600);
    },
    [slides.length, displayIndex],
  );

  const goNext = useCallback(() => {
    if (!hasSlides) return;
    const next = currentIndex < slides.length - 1 ? currentIndex + 1 : 0;
    transitionTo(next);
  }, [currentIndex, slides.length, hasSlides, transitionTo]);

  const goPrev = useCallback(() => {
    if (!hasSlides) return;
    const prev = currentIndex > 0 ? currentIndex - 1 : slides.length - 1;
    transitionTo(prev);
  }, [currentIndex, slides.length, hasSlides, transitionTo]);

  useEffect(() => {
    if (!isPlaying || !hasSlides) return;
    const duration = slides[currentIndex]?.duration ?? 5000;
    setElapsed(0);
    const startTime = Date.now();

    const interval = window.setInterval(() => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      setElapsed(progress);
      if (progress >= 1) {
        clearInterval(interval);
        goNext();
      }
    }, 50);

    timerRef.current = interval;
    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, hasSlides, slides, goNext]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
      if (e.key === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen?.();
        } else {
          setEditorStep('slides');
        }
      }
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, setEditorStep, isFullscreen]);

  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  const transition = currentSlide?.transition ?? 'fade';

  return (
    <div
      ref={containerRef}
      className={`preview-container ${isFullscreen ? 'preview-fullscreen' : ''}`}
    >
      {!isFullscreen && (
        <div className="preview-toolbar">
          <button className="btn-secondary" onClick={() => setEditorStep('slides')}>
            ← 편집으로 돌아가기
          </button>
          <div className="preview-info">
            <span className="preview-spec">
              {project.screen.name} · {project.layout.name} · {kv.name}
            </span>
          </div>
          <div className="preview-controls">
            <button
              className="btn-icon"
              onClick={goPrev}
              disabled={!hasSlides}
              title="이전 (←)"
            >
              ◀
            </button>
            <button
              className="btn-icon play-btn"
              onClick={() => setIsPlaying((p) => !p)}
              disabled={!hasSlides}
              title="재생/정지 (Space)"
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button
              className="btn-icon"
              onClick={goNext}
              disabled={!hasSlides}
              title="다음 (→)"
            >
              ▶
            </button>
            {hasSlides && (
              <span className="slide-counter">
                {currentIndex + 1} / {slides.length}
              </span>
            )}
            <button
              className="btn-icon fullscreen-btn"
              onClick={toggleFullscreen}
              title="풀스크린 (F)"
            >
              ⛶
            </button>
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
              title={slide.label}
            >
              <div
                className="timeline-fill"
                style={{
                  width: i === currentIndex ? `${elapsed * 100}%` : i < currentIndex ? '100%' : '0%',
                }}
              />
              <span className="timeline-label">{i + 1}</span>
            </div>
          ))}
        </div>
      )}

      <div
        className="preview-screen"
        style={{
          aspectRatio: `${project.screen.widthPx} / ${project.screen.heightPx}`,
          background: kv.gradientCss || kv.backgroundColor,
          color: kv.primaryColor,
          fontFamily: kv.fontFamily,
        }}
      >
        {project.layout.zones.map((zone) => (
          <div
            key={zone.id}
            className="preview-zone"
            style={{
              position: 'absolute',
              left: `${zone.x}%`,
              top: `${zone.y}%`,
              width: `${zone.width}%`,
              height: `${zone.height}%`,
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
            <div className="slide-center-content">
              <h2 className="slide-title">{currentSlide.label}</h2>
              {currentSlide.transition !== 'none' && (
                <span className="slide-transition-badge">{currentSlide.transition}</span>
              )}
            </div>
          </div>
        )}

        {!hasSlides && (
          <div className="preview-empty-overlay">
            <p className="preview-empty-text">
              현재 설정으로 스크린이 이렇게 보입니다
            </p>
            <p className="preview-empty-sub">
              슬라이드를 추가하면 여기에 콘텐츠가 표시됩니다
            </p>
          </div>
        )}
      </div>

      {isFullscreen && hasSlides && (
        <div className="fullscreen-controls">
          <button className="btn-icon fs-btn" onClick={goPrev}>◀</button>
          <button className="btn-icon fs-btn play-btn" onClick={() => setIsPlaying((p) => !p)}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button className="btn-icon fs-btn" onClick={goNext}>▶</button>
          <span className="fs-counter">
            {currentIndex + 1} / {slides.length}
          </span>
          <span className="fs-label">{currentSlide?.label}</span>
        </div>
      )}

      {!isFullscreen && (
        <div className="preview-shortcuts">
          <span>← → 슬라이드 이동</span>
          <span>Space 재생/정지</span>
          <span>F 풀스크린</span>
          <span>Esc 편집으로</span>
        </div>
      )}
    </div>
  );
}
