import { useState, useRef } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { LivePreview } from '@/components/Preview';
import { BACKGROUND_EFFECT_PRESETS } from '@/types/effects';
import { TEMPLATE_LABELS, getDefaultTemplateData } from '@/types/slide';
import type { Slide, SlideTemplate, TransitionType, ContentAnimationType, BackgroundEffect, OverlayObject } from '@/types';

const TRANSITIONS: { value: TransitionType; label: string }[] = [
  { value: 'none', label: '없음' },
  { value: 'fade', label: '페이드' },
  { value: 'dissolve', label: '디졸브' },
  { value: 'slide-left', label: '슬라이드 좌' },
  { value: 'slide-right', label: '슬라이드 우' },
  { value: 'slide-up', label: '슬라이드 상' },
  { value: 'slide-down', label: '슬라이드 하' },
  { value: 'zoom-in', label: '줌 인' },
  { value: 'zoom-out', label: '줌 아웃' },
  { value: 'cube', label: '큐브 3D' },
  { value: 'flip-x', label: '3D 플립 X' },
  { value: 'flip-y', label: '3D 플립 Y' },
  { value: 'morph', label: '모프' },
  { value: 'glitch', label: '글리치' },
  { value: 'wipe-left', label: '와이프 좌' },
  { value: 'wipe-right', label: '와이프 우' },
  { value: 'iris', label: '아이리스' },
];

const CONTENT_ANIMATIONS: { value: ContentAnimationType; label: string }[] = [
  { value: 'none', label: '없음' },
  { value: 'fade-up', label: '아래에서 위로' },
  { value: 'fade-down', label: '위에서 아래로' },
  { value: 'scale-pop', label: '스케일 팝' },
  { value: 'blur-in', label: '블러 인' },
  { value: 'slide-in-left', label: '좌측에서' },
  { value: 'slide-in-right', label: '우측에서' },
  { value: 'bounce-in', label: '바운스' },
  { value: 'rotate-in', label: '회전' },
  { value: 'glitch', label: '글리치' },
  { value: 'typewriter', label: '타이프라이터' },
];

const TEMPLATES: { value: SlideTemplate; label: string }[] = Object.entries(TEMPLATE_LABELS).map(
  ([value, label]) => ({ value: value as SlideTemplate, label }),
);

function TitleForm({ slide, onChange }: { slide: Slide; onChange: (data: Record<string, unknown>) => void }) {
  const d = slide.templateData;
  return (
    <>
      <label>
        태그
        <input type="text" value={(d.tag as string) || ''} onChange={(e) => onChange({ ...d, tag: e.target.value })} />
      </label>
      <label>
        제목
        <textarea rows={3} value={(d.title as string) || ''} onChange={(e) => onChange({ ...d, title: e.target.value })} placeholder="발표 제목을 입력하세요" />
      </label>
      <label>
        부제목
        <input type="text" value={(d.subtitle as string) || ''} onChange={(e) => onChange({ ...d, subtitle: e.target.value })} placeholder="부제목 또는 발표자 정보" />
      </label>
    </>
  );
}

function ComparisonForm({ slide, onChange }: { slide: Slide; onChange: (data: Record<string, unknown>) => void }) {
  const d = slide.templateData;
  return (
    <>
      <label>
        태그
        <input type="text" value={(d.tag as string) || ''} onChange={(e) => onChange({ ...d, tag: e.target.value })} />
      </label>
      <label>
        제목
        <input type="text" value={(d.title as string) || ''} onChange={(e) => onChange({ ...d, title: e.target.value })} />
      </label>
      <div className="inline-row">
        <label>
          A 라벨
          <input type="text" value={(d.aLabel as string) || ''} onChange={(e) => onChange({ ...d, aLabel: e.target.value })} />
        </label>
        <label>
          B 라벨
          <input type="text" value={(d.bLabel as string) || ''} onChange={(e) => onChange({ ...d, bLabel: e.target.value })} />
        </label>
      </div>
      <label>
        A 내용
        <textarea rows={3} value={(d.aContent as string) || ''} onChange={(e) => onChange({ ...d, aContent: e.target.value })} placeholder="옵션 A의 설명" />
      </label>
      <label>
        B 내용
        <textarea rows={3} value={(d.bContent as string) || ''} onChange={(e) => onChange({ ...d, bContent: e.target.value })} placeholder="옵션 B의 설명" />
      </label>
      <div className="inline-row">
        <label>
          A 지표 값
          <input type="text" value={(d.aMetricValue as string) || ''} onChange={(e) => onChange({ ...d, aMetricValue: e.target.value })} />
        </label>
        <label>
          A 지표 라벨
          <input type="text" value={(d.aMetricLabel as string) || ''} onChange={(e) => onChange({ ...d, aMetricLabel: e.target.value })} />
        </label>
      </div>
      <div className="inline-row">
        <label>
          B 지표 값
          <input type="text" value={(d.bMetricValue as string) || ''} onChange={(e) => onChange({ ...d, bMetricValue: e.target.value })} />
        </label>
        <label>
          B 지표 라벨
          <input type="text" value={(d.bMetricLabel as string) || ''} onChange={(e) => onChange({ ...d, bMetricLabel: e.target.value })} />
        </label>
      </div>
      <label>
        승자
        <select value={(d.winner as string) || 'none'} onChange={(e) => onChange({ ...d, winner: e.target.value })}>
          <option value="none">없음</option>
          <option value="A">A</option>
          <option value="B">B</option>
        </select>
      </label>
    </>
  );
}

function ContentForm({ slide, onChange }: { slide: Slide; onChange: (data: Record<string, unknown>) => void }) {
  const d = slide.templateData;
  return (
    <>
      <label>
        태그
        <input type="text" value={(d.tag as string) || ''} onChange={(e) => onChange({ ...d, tag: e.target.value })} />
      </label>
      <label>
        제목
        <input type="text" value={(d.title as string) || ''} onChange={(e) => onChange({ ...d, title: e.target.value })} />
      </label>
      <label>
        본문
        <textarea rows={6} value={(d.body as string) || ''} onChange={(e) => onChange({ ...d, body: e.target.value })} placeholder="본문 내용을 입력하세요" />
      </label>
    </>
  );
}

function QuoteForm({ slide, onChange }: { slide: Slide; onChange: (data: Record<string, unknown>) => void }) {
  const d = slide.templateData;
  return (
    <>
      <label>
        인용문
        <textarea rows={4} value={(d.quote as string) || ''} onChange={(e) => onChange({ ...d, quote: e.target.value })} />
      </label>
      <label>
        발화자
        <input type="text" value={(d.author as string) || ''} onChange={(e) => onChange({ ...d, author: e.target.value })} />
      </label>
      <label>
        출처
        <input type="text" value={(d.source as string) || ''} onChange={(e) => onChange({ ...d, source: e.target.value })} />
      </label>
    </>
  );
}

function StatsForm({ slide, onChange }: { slide: Slide; onChange: (data: Record<string, unknown>) => void }) {
  const d = slide.templateData;
  const items = (d.items as { value: string; label: string }[]) || [];

  const updateItem = (index: number, field: string, val: string) => {
    const newItems = items.map((item, i) => (i === index ? { ...item, [field]: val } : item));
    onChange({ ...d, items: newItems });
  };

  const addItem = () => {
    onChange({ ...d, items: [...items, { value: '0', label: '라벨' }] });
  };

  const removeItem = (index: number) => {
    onChange({ ...d, items: items.filter((_, i) => i !== index) });
  };

  return (
    <>
      <label>
        태그
        <input type="text" value={(d.tag as string) || ''} onChange={(e) => onChange({ ...d, tag: e.target.value })} />
      </label>
      <label>
        제목
        <input type="text" value={(d.title as string) || ''} onChange={(e) => onChange({ ...d, title: e.target.value })} />
      </label>
      {items.map((item, i) => (
        <div key={i} className="inline-row" style={{ alignItems: 'flex-end' }}>
          <label>
            지표 값
            <input type="text" value={item.value} onChange={(e) => updateItem(i, 'value', e.target.value)} />
          </label>
          <label>
            지표 라벨
            <input type="text" value={item.label} onChange={(e) => updateItem(i, 'label', e.target.value)} />
          </label>
          <button className="btn-icon danger" onClick={() => removeItem(i)} style={{ marginBottom: 4 }}>×</button>
        </div>
      ))}
      <button className="btn-small" onClick={addItem}>+ 지표 추가</button>
    </>
  );
}

function TemplateForm({ slide, onChange }: { slide: Slide; onChange: (data: Record<string, unknown>) => void }) {
  switch (slide.template) {
    case 'title': return <TitleForm slide={slide} onChange={onChange} />;
    case 'comparison': return <ComparisonForm slide={slide} onChange={onChange} />;
    case 'content': return <ContentForm slide={slide} onChange={onChange} />;
    case 'quote': return <QuoteForm slide={slide} onChange={onChange} />;
    case 'stats': return <StatsForm slide={slide} onChange={onChange} />;
    case 'image-full': return <ContentForm slide={slide} onChange={onChange} />;
    case 'blank': return <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>빈 슬라이드 - 오버레이 오브젝트를 추가하세요</p>;
  }
}

export function ScreenPlayEditor() {
  const {
    project, addSlide, updateSlide, removeSlide, reorderSlides,
    activeSlideId, setActiveSlide, setEditorStep, addOverlay, removeOverlay,
  } = useProjectStore();

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragCounter = useRef(0);

  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: crypto.randomUUID(),
      order: project.slides.length,
      label: `슬라이드 ${project.slides.length + 1}`,
      template: 'title',
      templateData: getDefaultTemplateData('title'),
      overlays: [],
      transition: 'fade',
      contentAnimation: 'fade-up',
      duration: 5000,
      backgroundColor: '__theme__',
      backgroundEffect: { type: 'none' },
    };
    addSlide(newSlide);
    setActiveSlide(newSlide.id);
  };

  const handleTemplateChange = (slide: Slide, template: SlideTemplate) => {
    updateSlide(slide.id, {
      template,
      templateData: getDefaultTemplateData(template),
    });
  };

  const handleAddOverlay = (slideId: string, type: 'text' | 'shape' | 'image') => {
    const overlay: OverlayObject = {
      id: crypto.randomUUID(),
      type,
      x: 10,
      y: 10,
      width: type === 'text' ? 30 : 20,
      height: type === 'text' ? 10 : 20,
      content: type === 'text' ? '텍스트' : type === 'shape' ? '' : '',
      style: type === 'shape'
        ? { background: 'rgba(255,255,255,0.1)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }
        : {},
    };
    addOverlay(slideId, overlay);
  };

  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDragEnter = (index: number) => { dragCounter.current++; setDragOverIndex(index); };
  const handleDragLeave = () => { dragCounter.current--; if (dragCounter.current === 0) setDragOverIndex(null); };
  const handleDrop = (toIndex: number) => {
    if (dragIndex !== null && dragIndex !== toIndex) reorderSlides(dragIndex, toIndex);
    setDragIndex(null); setDragOverIndex(null); dragCounter.current = 0;
  };
  const handleDragEnd = () => { setDragIndex(null); setDragOverIndex(null); dragCounter.current = 0; };

  const activeSlide = project.slides.find((s) => s.id === activeSlideId);

  return (
    <div className="screenplay-fullscreen">
      {/* LEFT SIDEBAR */}
      <div className="sp-sidebar">
        <div className="sp-sidebar-header">
          <span>슬라이드 ({project.slides.length})</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn-small sp-ai-btn" title="AI 생성">AI</button>
            <button className="btn-small" onClick={handleAddSlide} title="슬라이드 추가">+</button>
          </div>
        </div>
        <div className="sp-slide-list">
          {project.slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`sp-slide-item ${slide.id === activeSlideId ? 'active' : ''} ${dragIndex === index ? 'dragging' : ''} ${dragOverIndex === index ? 'drag-over' : ''}`}
              onClick={() => setActiveSlide(slide.id)}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragLeave={handleDragLeave}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              onDragEnd={handleDragEnd}
            >
              <span className="sp-slide-num">{index + 1}</span>
              <div className="sp-slide-info">
                <span className="sp-slide-name">{slide.label}</span>
                <span className="sp-slide-type">{TEMPLATE_LABELS[slide.template]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CENTER CONFIG */}
      <div className="sp-config">
        {activeSlide ? (
          <div className="sp-config-scroll">
            <div className="sp-section-title">슬라이드 설정</div>

            <label>
              이름
              <input type="text" value={activeSlide.label} onChange={(e) => updateSlide(activeSlide.id, { label: e.target.value })} />
            </label>

            <div className="inline-row">
              <label>
                템플릿
                <select value={activeSlide.template} onChange={(e) => handleTemplateChange(activeSlide, e.target.value as SlideTemplate)}>
                  {TEMPLATES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </label>
              <label>
                진입 애니메이션
                <select value={activeSlide.contentAnimation} onChange={(e) => updateSlide(activeSlide.id, { contentAnimation: e.target.value as ContentAnimationType })}>
                  {CONTENT_ANIMATIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </label>
            </div>

            <div className="inline-row">
              <label>
                전환 효과
                <select value={activeSlide.transition} onChange={(e) => updateSlide(activeSlide.id, { transition: e.target.value as TransitionType })}>
                  {TRANSITIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </label>
              <label>
                표시 시간 (초)
                <input type="number" value={activeSlide.duration / 1000} onChange={(e) => updateSlide(activeSlide.id, { duration: Number(e.target.value) * 1000 })} min={1} max={300} step={0.5} />
              </label>
            </div>

            <div className="inline-row">
              <label>
                배경색
                <input type="text" value={activeSlide.backgroundColor === '__theme__' ? '테마 기본' : activeSlide.backgroundColor} onChange={(e) => updateSlide(activeSlide.id, { backgroundColor: e.target.value || '__theme__' })} placeholder="테마 기본" />
              </label>
              <label>
                배경 이펙트
                <select
                  value={activeSlide.backgroundEffect?.type || 'none'}
                  onChange={(e) => {
                    const preset = BACKGROUND_EFFECT_PRESETS.find((p) => p.value.type === e.target.value);
                    if (preset) updateSlide(activeSlide.id, { backgroundEffect: preset.value as BackgroundEffect });
                  }}
                >
                  {BACKGROUND_EFFECT_PRESETS.map((p) => <option key={p.label} value={p.value.type}>{p.label}</option>)}
                </select>
              </label>
            </div>

            <div className="sp-divider" />
            <div className="sp-section-title">콘텐츠 편집</div>
            <p className="sp-hint">**굵은 텍스트**로 감싸면 억센트 컬러로 강조됩니다</p>

            <TemplateForm
              slide={activeSlide}
              onChange={(data) => updateSlide(activeSlide.id, { templateData: data })}
            />

            <div className="sp-divider" />
            <div className="sp-section-title">오버레이 오브젝트</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button className="btn-small" onClick={() => handleAddOverlay(activeSlide.id, 'text')}>+ 텍스트</button>
              <button className="btn-small" onClick={() => handleAddOverlay(activeSlide.id, 'shape')}>+ 도형</button>
              <button className="btn-small" onClick={() => handleAddOverlay(activeSlide.id, 'image')}>+ 이미지</button>
            </div>
            {activeSlide.overlays.map((ov) => (
              <div key={ov.id} className="sp-overlay-item">
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{ov.type === 'text' ? 'T' : ov.type === 'shape' ? '◻' : '🖼'} {ov.content || ov.type}</span>
                <button className="btn-icon danger" onClick={() => removeOverlay(activeSlide.id, ov.id)}>×</button>
              </div>
            ))}

            <button className="sp-ai-action-btn" onClick={() => alert('AI 슬라이드 수정 기능은 추후 연동 예정입니다.')}>
              AI로 이 슬라이드 수정
            </button>
          </div>
        ) : (
          <div className="sp-config-empty">
            <p>슬라이드를 선택하거나<br />새 슬라이드를 추가하세요</p>
          </div>
        )}
      </div>

      {/* RIGHT LIVE PREVIEW */}
      <LivePreview slide={activeSlide || null} />

      {/* BOTTOM NAV */}
      <div className="sp-bottom-nav">
        <button className="btn-secondary" onClick={() => setEditorStep('keyvisual')}>← 이전</button>
        <button className="btn-primary" onClick={() => setEditorStep('preview')}><span>미리보기 →</span></button>
      </div>
    </div>
  );
}
