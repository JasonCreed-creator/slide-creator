import { useState, useCallback, useRef } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { TemplateEditor } from './TemplateEditor';
import { SlideRenderer } from '@/components/Preview/SlideRenderer';
import { BackgroundEffect } from '@/components/Preview/BackgroundEffect';
import { generateSlides, getStoredApiKey, setStoredApiKey } from '@/utils/aiGenerator';
import { generateSlideAiEdit } from '@/utils/aiSlideEdit';
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
  { value: 'timeline', icon: '→' },
  { value: 'big-number', icon: '##' },
  { value: 'stats', icon: '▤' },
  { value: 'video', icon: '▶' },
  { value: 'outro', icon: '✦' },
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
      slides.forEach((slide) => {
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
          <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-ant-..." />
        </label>
        <label className="prop-label">
          프롬프트
          <textarea className="prop-textarea ai-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)}
            placeholder={"예: 리멤버 B2B 마케팅 전략 발표자료 10장\n- ABM 마케팅 소개\n- 성과 지표\n- 사례 3건"} rows={6} />
        </label>
        {error && <div className="ai-error">{error}</div>}
        <button className="btn-primary ai-gen-btn" onClick={handleGenerate} disabled={loading || !apiKey.trim() || !prompt.trim()}>
          {loading ? '생성 중...' : '슬라이드 생성'}
        </button>
        <p className="te-hint">현재 테마: {project.keyVisual.name} | 기존 슬라이드에 추가됩니다</p>
      </div>
    </div>
  );
}

function SlideAiPrompt({ slideId }: { slideId: string }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  const handleEdit = async () => {
    const apiKey = getStoredApiKey();
    if (!apiKey || !prompt.trim()) {
      setError('API 키를 먼저 설정하세요 (햄버거 메뉴 → AI 전체 생성)');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const store = useProjectStore.getState();
      const slide = store.project.slides.find((s) => s.id === slideId);
      if (!slide) return;
      const result = await generateSlideAiEdit(prompt, slide, apiKey);
      store.updateSlide(slideId, {
        data: result.data,
        label: result.label || slide.label,
      });
      setPrompt('');
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI 수정 실패');
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button className="btn-small ai-btn" onClick={() => setOpen(true)} style={{ marginTop: 8, width: '100%' }}>
        AI로 이 슬라이드 수정
      </button>
    );
  }

  return (
    <div className="slide-ai-prompt">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>AI 페이지 수정</span>
        <button className="btn-icon" onClick={() => setOpen(false)}>&times;</button>
      </div>
      <textarea
        className="prop-textarea"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="예: 사례를 3개로 늘려줘 / 제목을 더 임팩트있게 / 지표 수치를 추가해줘"
        rows={3}
      />
      {error && <div className="ai-error" style={{ fontSize: 11, marginTop: 4 }}>{error}</div>}
      <button className="btn-primary" onClick={handleEdit} disabled={loading || !prompt.trim()} style={{ marginTop: 6, width: '100%', fontSize: 12 }}>
        {loading ? '수정 중...' : '적용'}
      </button>
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
  const previewContainerRef = useRef<HTMLDivElement>(null);

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
              <div key={slide.id} className={`slide-item ${slide.id === activeSlideId ? 'active' : ''}`} onClick={() => setActiveSlide(slide.id)}>
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

      <div className="screenplay-center">
        {showAi ? (
          <AiPanel onClose={() => setShowAi(false)} />
        ) : activeSlide ? (
          <div className="editor-preview-split">
            <div className="editor-pane">
              <TemplateEditor slide={activeSlide} />
              <SlideAiPrompt slideId={activeSlide.id} />
            </div>
            <div className="preview-pane">
              <div className="preview-pane-label">LIVE PREVIEW (드래그로 오브제 이동)</div>
              <div
                ref={previewContainerRef}
                className="live-preview-screen"
                style={{
                  aspectRatio: `${project.screen.widthPx} / ${project.screen.heightPx}`,
                  background: activeSlide.backgroundColor || kv.gradientCss || kv.backgroundColor,
                  color: kv.primaryColor,
                  fontFamily: kv.fontFamily,
                  position: 'relative',
                }}
              >
                <BackgroundEffect effect={activeSlide.backgroundEffect || project.backgroundEffect} accentColor={kv.accentColor} />
                <SlideRenderer slide={activeSlide} kv={kv} onDataChange={handlePreviewDataChange} containerRef={previewContainerRef} />
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
