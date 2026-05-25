import { useState, useRef } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { BACKGROUND_EFFECT_PRESETS } from '@/types/effects';
import type { Slide, TransitionType, ContentAnimationType, BackgroundEffect } from '@/types';

const TRANSITIONS: { value: TransitionType; label: string; icon: string }[] = [
  { value: 'none', label: '없음', icon: '—' },
  { value: 'fade', label: '페이드', icon: '◐' },
  { value: 'dissolve', label: '디졸브', icon: '◑' },
  { value: 'slide-left', label: '슬라이드 좌', icon: '←' },
  { value: 'slide-right', label: '슬라이드 우', icon: '→' },
  { value: 'slide-up', label: '슬라이드 상', icon: '↑' },
  { value: 'slide-down', label: '슬라이드 하', icon: '↓' },
  { value: 'zoom-in', label: '줌 인', icon: '⊕' },
  { value: 'zoom-out', label: '줌 아웃', icon: '⊖' },
  { value: 'cube', label: '큐브', icon: '◇' },
  { value: 'flip-x', label: '3D 플립 X', icon: '↔' },
  { value: 'flip-y', label: '3D 플립 Y', icon: '↕' },
  { value: 'morph', label: '모프', icon: '◈' },
  { value: 'glitch', label: '글리치', icon: '⚡' },
  { value: 'wipe-left', label: '와이프 좌', icon: '▌' },
  { value: 'wipe-right', label: '와이프 우', icon: '▐' },
  { value: 'iris', label: '아이리스', icon: '◉' },
];

const CONTENT_ANIMATIONS: { value: ContentAnimationType; label: string }[] = [
  { value: 'none', label: '없음' },
  { value: 'fade-up', label: '페이드 업' },
  { value: 'fade-down', label: '페이드 다운' },
  { value: 'scale-pop', label: '스케일 팝' },
  { value: 'blur-in', label: '블러 인' },
  { value: 'slide-in-left', label: '좌측 슬라이드' },
  { value: 'slide-in-right', label: '우측 슬라이드' },
  { value: 'bounce-in', label: '바운스' },
  { value: 'rotate-in', label: '회전 등장' },
  { value: 'glitch', label: '글리치' },
  { value: 'typewriter', label: '타이프라이터' },
];

export function ScreenPlayEditor() {
  const { project, addSlide, updateSlide, removeSlide, reorderSlides, activeSlideId, setActiveSlide, setEditorStep } =
    useProjectStore();

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragCounter = useRef(0);

  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: crypto.randomUUID(),
      order: project.slides.length,
      label: `슬라이드 ${project.slides.length + 1}`,
      contents: [],
      transition: 'fade',
      duration: 5000,
      contentAnimation: 'fade-up',
      backgroundEffect: { type: 'none' },
      subtitle: '',
    };
    addSlide(newSlide);
    setActiveSlide(newSlide.id);
  };

  const handleDuplicateSlide = (slide: Slide) => {
    const newSlide: Slide = {
      ...slide,
      id: crypto.randomUUID(),
      order: project.slides.length,
      label: `${slide.label} (복사)`,
    };
    addSlide(newSlide);
    setActiveSlide(newSlide.id);
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragEnter = (index: number) => {
    dragCounter.current++;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (toIndex: number) => {
    if (dragIndex !== null && dragIndex !== toIndex) {
      reorderSlides(dragIndex, toIndex);
    }
    setDragIndex(null);
    setDragOverIndex(null);
    dragCounter.current = 0;
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
    dragCounter.current = 0;
  };

  const activeSlide = project.slides.find((s) => s.id === activeSlideId);

  return (
    <div className="editor-panel screenplay-panel">
      <h2>스크린 플레이</h2>
      <p className="panel-description">
        슬라이드 순서, 전환 효과, 콘텐츠 애니메이션을 설정합니다. 드래그로 순서를 변경할 수 있습니다.
      </p>

      <div className="screenplay-layout">
        <div className="slide-list">
          <div className="slide-list-header">
            <span>슬라이드 ({project.slides.length})</span>
            <button className="btn-small" onClick={handleAddSlide}>
              + 추가
            </button>
          </div>
          {project.slides.length === 0 && (
            <div className="slide-list-empty">
              <div className="slide-list-empty-icon">+</div>
              슬라이드를 추가하여<br />프레젠테이션을 구성하세요
            </div>
          )}
          {project.slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`slide-item ${slide.id === activeSlideId ? 'active' : ''} ${dragIndex === index ? 'dragging' : ''} ${dragOverIndex === index ? 'drag-over' : ''}`}
              onClick={() => setActiveSlide(slide.id)}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragLeave={handleDragLeave}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              onDragEnd={handleDragEnd}
            >
              <span className="drag-handle">⋮⋮</span>
              <span className="slide-order">{index + 1}</span>
              <span className="slide-label">{slide.label}</span>
              {slide.backgroundEffect?.type !== 'none' && (
                <span className="effect-badge">FX</span>
              )}
              <button
                className="btn-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDuplicateSlide(slide);
                }}
                title="복제"
              >
                ⧉
              </button>
              <button
                className="btn-icon danger"
                onClick={(e) => {
                  e.stopPropagation();
                  removeSlide(slide.id);
                }}
                title="삭제"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {activeSlide ? (
          <div className="slide-config">
            <h3>{activeSlide.label}</h3>

            <label>
              슬라이드 이름
              <input
                type="text"
                value={activeSlide.label}
                onChange={(e) => updateSlide(activeSlide.id, { label: e.target.value })}
              />
            </label>

            <label>
              부제목 (선택)
              <input
                type="text"
                value={activeSlide.subtitle || ''}
                onChange={(e) => updateSlide(activeSlide.id, { subtitle: e.target.value })}
                placeholder="슬라이드 하단에 표시될 텍스트"
              />
            </label>

            <div className="inline-row">
              <label>
                전환 효과
                <select
                  value={activeSlide.transition}
                  onChange={(e) =>
                    updateSlide(activeSlide.id, {
                      transition: e.target.value as TransitionType,
                    })
                  }
                >
                  {TRANSITIONS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.icon} {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                표시 시간 (초)
                <input
                  type="number"
                  value={activeSlide.duration / 1000}
                  onChange={(e) =>
                    updateSlide(activeSlide.id, {
                      duration: Number(e.target.value) * 1000,
                    })
                  }
                  min={1}
                  max={300}
                  step={0.5}
                />
              </label>
            </div>

            <div className="config-section">
              <span className="config-section-title">콘텐츠 입장 애니메이션</span>
              <div className="effect-selector">
                {CONTENT_ANIMATIONS.map((anim) => (
                  <button
                    key={anim.value}
                    className={`effect-chip ${activeSlide.contentAnimation === anim.value ? 'active' : ''}`}
                    onClick={() => updateSlide(activeSlide.id, { contentAnimation: anim.value })}
                  >
                    {anim.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="config-section">
              <span className="config-section-title">슬라이드 배경 이펙트</span>
              <div className="effect-selector">
                {BACKGROUND_EFFECT_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    className={`effect-chip ${activeSlide.backgroundEffect?.type === preset.value.type ? 'active' : ''}`}
                    onClick={() => updateSlide(activeSlide.id, { backgroundEffect: preset.value as BackgroundEffect })}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="slide-config" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center' }}>
              좌측에서 슬라이드를 선택하거나<br />새 슬라이드를 추가하세요
            </p>
          </div>
        )}
      </div>

      <div className="panel-actions">
        <button className="btn-secondary" onClick={() => setEditorStep('keyvisual')}>
          ← 이전
        </button>
        <button className="btn-primary" onClick={() => setEditorStep('preview')}>
          <span>미리보기 →</span>
        </button>
      </div>
    </div>
  );
}
