import { useState, useEffect, useCallback } from 'react';
import { useProjectStore } from '@/stores/projectStore';

export function SlidePreview() {
  const { project, setEditorStep } = useProjectStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const slides = project.slides;
  const currentSlide = slides[currentIndex];
  const kv = project.keyVisual;

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i < slides.length - 1 ? i + 1 : 0));
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : slides.length - 1));
  }, [slides.length]);

  useEffect(() => {
    if (!isPlaying || slides.length === 0) return;
    const duration = currentSlide?.duration ?? 5000;
    const timer = setTimeout(goNext, duration);
    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex, currentSlide, goNext, slides.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
      if (e.key === 'Escape') setEditorStep('slides');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, setEditorStep]);

  if (slides.length === 0) {
    return (
      <div className="editor-panel">
        <h2>미리보기</h2>
        <p>슬라이드가 없습니다. 먼저 슬라이드를 추가해주세요.</p>
        <button className="btn-secondary" onClick={() => setEditorStep('slides')}>
          ← 슬라이드 편집으로
        </button>
      </div>
    );
  }

  return (
    <div className="preview-container">
      <div className="preview-toolbar">
        <button className="btn-secondary" onClick={() => setEditorStep('slides')}>
          ← 편집으로 돌아가기
        </button>
        <div className="preview-controls">
          <button className="btn-icon" onClick={goPrev}>◀</button>
          <button className="btn-icon" onClick={() => setIsPlaying((p) => !p)}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button className="btn-icon" onClick={goNext}>▶</button>
          <span className="slide-counter">
            {currentIndex + 1} / {slides.length}
          </span>
        </div>
      </div>

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

        <div className="preview-slide-label">{currentSlide?.label}</div>
      </div>
    </div>
  );
}
