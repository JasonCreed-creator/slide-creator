import { useState, useCallback } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { TemplateEditor } from './TemplateEditor';
import { SlideRenderer } from '@/components/Preview/SlideRenderer';
import { generateSlides, getStoredApiKey, setStoredApiKey } from '@/utils/aiGenerator';
import type { SlideTemplate, TemplateData } from '@/types';
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

function AiPanel({ onClose }: { onClose: () => void }) {
  const [apiKey, setApiKey] = useState(getStoredApiKey);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { project } = useProjectStore();

  const handleGenerate = async () => {
    if (!apiKey.trim() || !prompt.trim()) return;
    setStoredApiKey(apiKey.trim());
    setLoading(true);
    setError('');
    try {
      const slides = await generateSlides(prompt, apiKey.trim());
      const store = useProjectStore.getState();
      const existingCount = store.project.slides.length;
      slides.forEach((slide, i) => {
        slide.order = existingCount + i;
        store.addSlideFromTemplate(slide.template);
        const lastSlide = store.project.slides[store.project.slides.length - 1];
        store.updateSlide(lastSlide.id, {
          label: slide.label,
          data: slide.data,
          transition: slide.transition,
          duration: slide.duration,
          entryAnimation: slide.entryAnimation,
        });
      });
      setPrompt('');
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI 생성 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <span className="ai-panel-title">AI 슬라이드 생성</span>
        <button className="btn-icon" onClick={onClose}>&times;</button>
      </div>
      <div className="ai-panel-body">
        <label className="prop-label">
          Anthropic API Key
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-..."
          />
        </label>
        <label className="prop-label">
          프롬프트
          <textarea
            className="prop-textarea ai-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={"예: 리멤버 B2B 마케팅 전략 발표자료 10장\n- ABM 마케팅 소개\n- 성과 지표\n- 사례 3건\n- Q&A"}
            rows={6}
          />
        </label>
        {error && <div className="ai-error">{error}</div>}
        <button
          className="btn-primary ai-gen-btn"
          onClick={handleGenerate}
          disabled={loading || !apiKey.trim() || !prompt.trim()}
        >
          {loading ? '생성 중...' : '슬라이드 생성'}
        </button>
        <p className="te-hint">
          현재 테마: {project.keyVisual.name} | 기존 슬라이드에 추가됩니다
        </p>
      </div>
    </div>
  );
}

export function ScreenPlayEditor() {
  const {
    project, addSlideFromTemplate, removeSlide, reorderSlides,
    duplicateSlide, activeSlideId, setActiveSlide, setEditorStep,
    updateSlideData,
  } = useProjectStore();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAi, setShowAi] = useState(false);

  const activeSlide = project.slides.find((s) => s.id === activeSlideId);
  const kv = project.keyVisual;

  const handlePreviewDataChange = useCallback(
    (patch: Partial<TemplateData>) => {
      if (activeSlideId) updateSlideData(activeSlideId, patch);
    },
    [activeSlideId, updateSlideData],
  );

  const handleAdd = (template: SlideTemplate) => {
    addSlideFromTemplate(template);
    setShowAddMenu(false);
  };

  return (
    <div className="screenplay-editor">
      {/* Left: Slide list */}
      <div className="screenplay-sidebar">
        <div className="slide-list">
          <div className="slide-list-header">
            <span>슬라이드 ({project.slides.length})</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="btn-small ai-btn" onClick={() => setShowAi(true)} title="AI로 생성">AI</button>
              <div className="add-menu-wrap">
                <button className="btn-small" onClick={() => setShowAddMenu(!showAddMenu)}>+</button>
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
                  <button className="btn-icon" onClick={(e) => { e.stopPropagation(); duplicateSlide(slide.id); }}>&#x2398;</button>
                  <button className="btn-icon danger" onClick={(e) => { e.stopPropagation(); removeSlide(slide.id); }}>&times;</button>
                </div>
              </div>
            ))}
            {project.slides.length === 0 && (
              <div className="slide-list-empty">
                <p>슬라이드가 없습니다</p>
                <button className="btn-small ai-btn" onClick={() => setShowAi(true)}>AI로 생성</button>
                <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => handleAdd('title')}>수동 추가</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Center: Editor + Live Preview */}
      <div className="screenplay-center">
        {showAi ? (
          <AiPanel onClose={() => setShowAi(false)} />
        ) : activeSlide ? (
          <div className="editor-preview-split">
            <div className="editor-pane">
              <TemplateEditor slide={activeSlide} />
            </div>
            <div className="preview-pane">
              <div className="preview-pane-label">LIVE PREVIEW</div>
              <div
                className="live-preview-screen"
                style={{
                  aspectRatio: `${project.screen.widthPx} / ${project.screen.heightPx}`,
                  background: activeSlide.backgroundColor || kv.gradientCss || kv.backgroundColor,
                  color: kv.primaryColor,
                  fontFamily: kv.fontFamily,
                }}
              >
                <SlideRenderer slide={activeSlide} kv={kv} onDataChange={handlePreviewDataChange} />
              </div>
            </div>
          </div>
        ) : (
          <div className="canvas-empty">
            <div className="canvas-empty-icon">+</div>
            <p>슬라이드를 선택하거나 추가하세요</p>
            <button className="btn-small ai-btn" style={{ marginTop: 12 }} onClick={() => setShowAi(true)}>AI로 한번에 생성</button>
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
