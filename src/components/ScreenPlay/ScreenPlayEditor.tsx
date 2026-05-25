import { useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { TemplateEditor } from './TemplateEditor';
import type { SlideTemplate } from '@/types';
import { TEMPLATE_LABELS } from '@/types';

const TEMPLATE_OPTIONS: { value: SlideTemplate; icon: string }[] = [
  { value: 'title', icon: 'H' },
  { value: 'section-cover', icon: '#' },
  { value: 'content', icon: '=' },
  { value: 'two-column', icon: '||' },
  { value: 'comparison', icon: 'VS' },
  { value: 'metrics', icon: '%' },
  { value: 'quote', icon: '"' },
  { value: 'image-text', icon: 'IMG' },
  { value: 'cards', icon: '::' },
  { value: 'blank', icon: '+' },
];

export function ScreenPlayEditor() {
  const {
    project, addSlideFromTemplate, removeSlide, reorderSlides,
    duplicateSlide, activeSlideId, setActiveSlide, setEditorStep,
  } = useProjectStore();
  const [showAddMenu, setShowAddMenu] = useState(false);

  const activeSlide = project.slides.find((s) => s.id === activeSlideId);

  const handleAdd = (template: SlideTemplate) => {
    addSlideFromTemplate(template);
    setShowAddMenu(false);
  };

  return (
    <div className="screenplay-editor">
      <div className="screenplay-sidebar">
        <div className="slide-list">
          <div className="slide-list-header">
            <span>슬라이드 ({project.slides.length})</span>
            <div className="add-menu-wrap">
              <button className="btn-small" onClick={() => setShowAddMenu(!showAddMenu)}>+ 추가</button>
              {showAddMenu && (
                <>
                  <div className="menu-backdrop" onClick={() => setShowAddMenu(false)} />
                  <div className="add-menu-dropdown">
                    {TEMPLATE_OPTIONS.map((t) => (
                      <button key={t.value} className="add-menu-item" onClick={() => handleAdd(t.value)}>
                        <span className="add-menu-icon">{t.icon}</span>
                        <span>{TEMPLATE_LABELS[t.value]}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
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
                  <span className="slide-meta">{TEMPLATE_LABELS[slide.template]}</span>
                </div>
                <div className="slide-item-actions">
                  <button className="btn-icon" onClick={(e) => { e.stopPropagation(); if (index > 0) reorderSlides(index, index - 1); }} disabled={index === 0}>&#x25B2;</button>
                  <button className="btn-icon" onClick={(e) => { e.stopPropagation(); if (index < project.slides.length - 1) reorderSlides(index, index + 1); }} disabled={index === project.slides.length - 1}>&#x25BC;</button>
                  <button className="btn-icon" onClick={(e) => { e.stopPropagation(); duplicateSlide(slide.id); }} title="복제">&#x2398;</button>
                  <button className="btn-icon danger" onClick={(e) => { e.stopPropagation(); removeSlide(slide.id); }}>&times;</button>
                </div>
              </div>
            ))}
            {project.slides.length === 0 && (
              <div className="slide-list-empty">
                <p>슬라이드가 없습니다</p>
                <button className="btn-primary" onClick={() => handleAdd('title')}>첫 슬라이드 추가</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="screenplay-main">
        {activeSlide ? (
          <TemplateEditor slide={activeSlide} />
        ) : (
          <div className="canvas-empty">
            <div className="canvas-empty-icon">+</div>
            <p>슬라이드를 선택하거나 추가하세요</p>
          </div>
        )}
      </div>

      <div className="screenplay-footer">
        <button className="btn-secondary" onClick={() => setEditorStep('keyvisual')}>&larr; 이전</button>
        <button className="btn-primary" onClick={() => setEditorStep('preview')}>미리보기 &rarr;</button>
      </div>
    </div>
  );
}
