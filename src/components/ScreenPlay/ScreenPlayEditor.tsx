import { useProjectStore } from '@/stores/projectStore';
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
  const { project, addSlide, updateSlide, removeSlide, reorderSlides, activeSlideId, setActiveSlide, setEditorStep } =
    useProjectStore();

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
    <div className="editor-panel screenplay-panel">
      <h2>스크린 플레이</h2>
      <p className="panel-description">
        슬라이드 순서와 전환 효과를 설정합니다.
      </p>

      <div className="screenplay-layout">
        <div className="slide-list">
          <div className="slide-list-header">
            <span>슬라이드 목록</span>
            <button className="btn-small" onClick={handleAddSlide}>
              + 추가
            </button>
          </div>
          {project.slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`slide-item ${slide.id === activeSlideId ? 'active' : ''}`}
              onClick={() => setActiveSlide(slide.id)}
            >
              <span className="slide-order">{index + 1}</span>
              <span className="slide-label">{slide.label}</span>
              <button
                className="btn-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  if (index > 0) reorderSlides(index, index - 1);
                }}
              >
                ↑
              </button>
              <button
                className="btn-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  if (index < project.slides.length - 1) reorderSlides(index, index + 1);
                }}
              >
                ↓
              </button>
              <button
                className="btn-icon danger"
                onClick={(e) => {
                  e.stopPropagation();
                  removeSlide(slide.id);
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {activeSlide && (
          <div className="slide-config">
            <label>
              슬라이드 이름
              <input
                type="text"
                value={activeSlide.label}
                onChange={(e) => updateSlide(activeSlide.id, { label: e.target.value })}
              />
            </label>
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
                    {t.label}
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
              />
            </label>
          </div>
        )}
      </div>

      <div className="panel-actions">
        <button className="btn-secondary" onClick={() => setEditorStep('keyvisual')}>
          ← 이전
        </button>
        <button className="btn-primary" onClick={() => setEditorStep('preview')}>
          미리보기 →
        </button>
      </div>
    </div>
  );
}
