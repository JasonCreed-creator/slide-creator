import { useProjectStore } from '@/stores/projectStore';
import { SlideCanvas, ContentToolbar, PropertyPanel } from '@/components/SlideEditor';
import type { Slide, TransitionType } from '@/types';

const TRANSITIONS: { value: TransitionType; label: string }[] = [
  { value: 'none', label: '없음' },
  { value: 'fade', label: '페이드' },
  { value: 'slide-left', label: '슬라이드 좌' },
  { value: 'slide-right', label: '슬라이드 우' },
  { value: 'slide-up', label: '슬라이드 상' },
  { value: 'slide-down', label: '슬라이드 하' },
  { value: 'zoom-in', label: '줌 인' },
  { value: 'zoom-out', label: '줌 아웃' },
  { value: 'dissolve', label: '디졸브' },
];

export function ScreenPlayEditor() {
  const {
    project,
    addSlide,
    updateSlide,
    removeSlide,
    reorderSlides,
    duplicateSlide,
    activeSlideId,
    setActiveSlide,
    setEditorStep,
  } = useProjectStore();

  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: crypto.randomUUID(),
      order: project.slides.length,
      label: `슬라이드 ${project.slides.length + 1}`,
      contents: [],
      transition: 'fade',
      duration: 5000,
    };
    addSlide(newSlide);
    setActiveSlide(newSlide.id);
  };

  const activeSlide = project.slides.find((s) => s.id === activeSlideId);

  return (
    <div className="screenplay-editor">
      <div className="screenplay-sidebar">
        <div className="slide-list">
          <div className="slide-list-header">
            <span>슬라이드 ({project.slides.length})</span>
            <button className="btn-small" onClick={handleAddSlide}>
              + 추가
            </button>
          </div>
          <div className="slide-list-items">
            {project.slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`slide-item ${slide.id === activeSlideId ? 'active' : ''}`}
                onClick={() => setActiveSlide(slide.id)}
              >
                <span className="slide-order">{index + 1}</span>
                <div className="slide-item-info">
                  <span className="slide-label">{slide.label}</span>
                  <span className="slide-meta">
                    {slide.duration / 1000}s · {slide.contents.length}개 콘텐츠
                  </span>
                </div>
                <div className="slide-item-actions">
                  <button
                    className="btn-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (index > 0) reorderSlides(index, index - 1);
                    }}
                    disabled={index === 0}
                    title="위로"
                  >
                    &#x25B2;
                  </button>
                  <button
                    className="btn-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (index < project.slides.length - 1) reorderSlides(index, index + 1);
                    }}
                    disabled={index === project.slides.length - 1}
                    title="아래로"
                  >
                    &#x25BC;
                  </button>
                  <button
                    className="btn-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateSlide(slide.id);
                    }}
                    title="복제"
                  >
                    &#x2398;
                  </button>
                  <button
                    className="btn-icon danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSlide(slide.id);
                    }}
                    title="삭제"
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}
            {project.slides.length === 0 && (
              <div className="slide-list-empty">
                <p>슬라이드가 없습니다</p>
                <button className="btn-primary" onClick={handleAddSlide}>
                  첫 슬라이드 추가
                </button>
              </div>
            )}
          </div>
        </div>

        {activeSlide && (
          <div className="slide-config">
            <span className="property-section-title">슬라이드 설정</span>
            <label className="prop-label">
              이름
              <input
                type="text"
                value={activeSlide.label}
                onChange={(e) => updateSlide(activeSlide.id, { label: e.target.value })}
              />
            </label>
            <div className="property-row">
              <label className="prop-label">
                전환 효과
                <select
                  value={activeSlide.transition}
                  onChange={(e) =>
                    updateSlide(activeSlide.id, { transition: e.target.value as TransitionType })
                  }
                >
                  {TRANSITIONS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="prop-label">
                시간 (초)
                <input
                  type="number"
                  value={activeSlide.duration / 1000}
                  onChange={(e) =>
                    updateSlide(activeSlide.id, { duration: Number(e.target.value) * 1000 })
                  }
                  min={1}
                  max={300}
                />
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="screenplay-main">
        <ContentToolbar />
        <SlideCanvas />
      </div>

      <div className="screenplay-props">
        <PropertyPanel />
      </div>

      <div className="screenplay-footer">
        <button className="btn-secondary" onClick={() => setEditorStep('keyvisual')}>
          &larr; 이전
        </button>
        <button className="btn-primary" onClick={() => setEditorStep('preview')}>
          미리보기 &rarr;
        </button>
      </div>
    </div>
  );
}
