import { useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { LivePreview } from '@/components/Preview';
import { BACKGROUND_EFFECT_PRESETS } from '@/types/effects';
import { TEMPLATE_LABELS, TEMPLATE_ICONS, getDefaultTemplateData, createSlide } from '@/types/slide';
import type {
  Slide,
  SlideTemplate,
  TransitionType,
  ContentAnimationType,
  OverlayObject,
} from '@/types';

/* ─── Constant option lists ─── */

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

const OVERLAY_ANIMATIONS: { value: string; label: string }[] = [
  { value: 'none', label: '없음' },
  { value: 'fade-up', label: '아래에서 위로' },
  { value: 'fade-down', label: '위에서 아래로' },
  { value: 'scale-pop', label: '스케일 팝' },
  { value: 'blur-in', label: '블러 인' },
  { value: 'slide-in-left', label: '좌측에서' },
  { value: 'slide-in-right', label: '우측에서' },
  { value: 'bounce-in', label: '바운스' },
  { value: 'rotate-in', label: '회전' },
];

const TEMPLATES: { value: SlideTemplate; label: string; icon: string }[] = (
  Object.entries(TEMPLATE_LABELS) as [SlideTemplate, string][]
).map(([value, label]) => ({ value, label, icon: TEMPLATE_ICONS[value] }));

/* ─── Template‑specific form components ─── */

type FormProps = { slide: Slide; onChange: (data: Record<string, unknown>) => void };

function TitleForm({ slide, onChange }: FormProps) {
  const d = slide.data;
  return (
    <>
      <label>태그<input type="text" value={(d.tag as string) ?? ''} onChange={(e) => onChange({ ...d, tag: e.target.value })} /></label>
      <label>제목<textarea rows={3} value={(d.title as string) ?? ''} onChange={(e) => onChange({ ...d, title: e.target.value })} placeholder="발표 제목을 입력하세요" /></label>
      <label>부제목<input type="text" value={(d.subtitle as string) ?? ''} onChange={(e) => onChange({ ...d, subtitle: e.target.value })} placeholder="부제목 또는 발표자 정보" /></label>
    </>
  );
}

function SectionCoverForm({ slide, onChange }: FormProps) {
  const d = slide.data;
  return (
    <>
      <label>번호<input type="text" value={(d.number as string) ?? ''} onChange={(e) => onChange({ ...d, number: e.target.value })} placeholder="01" /></label>
      <label>제목<input type="text" value={(d.title as string) ?? ''} onChange={(e) => onChange({ ...d, title: e.target.value })} /></label>
      <label>부제목<input type="text" value={(d.subtitle as string) ?? ''} onChange={(e) => onChange({ ...d, subtitle: e.target.value })} /></label>
    </>
  );
}

function ContentForm({ slide, onChange }: FormProps) {
  const d = slide.data;
  return (
    <>
      <label>태그<input type="text" value={(d.tag as string) ?? ''} onChange={(e) => onChange({ ...d, tag: e.target.value })} /></label>
      <label>제목<input type="text" value={(d.title as string) ?? ''} onChange={(e) => onChange({ ...d, title: e.target.value })} /></label>
      <label>본문<textarea rows={6} value={(d.body as string) ?? ''} onChange={(e) => onChange({ ...d, body: e.target.value })} placeholder="본문 내용을 입력하세요" /></label>
    </>
  );
}

function TwoColumnForm({ slide, onChange }: FormProps) {
  const d = slide.data;
  return (
    <>
      <label>태그<input type="text" value={(d.tag as string) ?? ''} onChange={(e) => onChange({ ...d, tag: e.target.value })} /></label>
      <label>제목<input type="text" value={(d.title as string) ?? ''} onChange={(e) => onChange({ ...d, title: e.target.value })} /></label>
      <div className="inline-row">
        <label>왼쪽 제목<input type="text" value={(d.leftTitle as string) ?? ''} onChange={(e) => onChange({ ...d, leftTitle: e.target.value })} /></label>
        <label>오른쪽 제목<input type="text" value={(d.rightTitle as string) ?? ''} onChange={(e) => onChange({ ...d, rightTitle: e.target.value })} /></label>
      </div>
      <label>왼쪽 본문<textarea rows={3} value={(d.leftBody as string) ?? ''} onChange={(e) => onChange({ ...d, leftBody: e.target.value })} /></label>
      <label>오른쪽 본문<textarea rows={3} value={(d.rightBody as string) ?? ''} onChange={(e) => onChange({ ...d, rightBody: e.target.value })} /></label>
    </>
  );
}

function ComparisonForm({ slide, onChange }: FormProps) {
  const d = slide.data;
  return (
    <>
      <label>태그<input type="text" value={(d.tag as string) ?? ''} onChange={(e) => onChange({ ...d, tag: e.target.value })} /></label>
      <label>제목<input type="text" value={(d.title as string) ?? ''} onChange={(e) => onChange({ ...d, title: e.target.value })} /></label>
      <div className="inline-row">
        <label>왼쪽 라벨<input type="text" value={(d.leftLabel as string) ?? ''} onChange={(e) => onChange({ ...d, leftLabel: e.target.value })} /></label>
        <label>오른쪽 라벨<input type="text" value={(d.rightLabel as string) ?? ''} onChange={(e) => onChange({ ...d, rightLabel: e.target.value })} /></label>
      </div>
      <label>왼쪽 내용<textarea rows={3} value={(d.leftContent as string) ?? ''} onChange={(e) => onChange({ ...d, leftContent: e.target.value })} /></label>
      <label>오른쪽 내용<textarea rows={3} value={(d.rightContent as string) ?? ''} onChange={(e) => onChange({ ...d, rightContent: e.target.value })} /></label>
      <div className="inline-row">
        <label>왼쪽 지표 값<input type="text" value={(d.leftMetricValue as string) ?? ''} onChange={(e) => onChange({ ...d, leftMetricValue: e.target.value })} /></label>
        <label>왼쪽 지표 라벨<input type="text" value={(d.leftMetricLabel as string) ?? ''} onChange={(e) => onChange({ ...d, leftMetricLabel: e.target.value })} /></label>
      </div>
      <div className="inline-row">
        <label>오른쪽 지표 값<input type="text" value={(d.rightMetricValue as string) ?? ''} onChange={(e) => onChange({ ...d, rightMetricValue: e.target.value })} /></label>
        <label>오른쪽 지표 라벨<input type="text" value={(d.rightMetricLabel as string) ?? ''} onChange={(e) => onChange({ ...d, rightMetricLabel: e.target.value })} /></label>
      </div>
      <label>
        승자
        <select value={(d.winner as string) ?? 'none'} onChange={(e) => onChange({ ...d, winner: e.target.value })}>
          <option value="none">없음</option>
          <option value="left">왼쪽</option>
          <option value="right">오른쪽</option>
        </select>
      </label>
    </>
  );
}

function MetricsForm({ slide, onChange }: FormProps) {
  const d = slide.data;
  const metrics = (d.metrics as { value: string; label: string }[]) || [];
  const updateMetric = (i: number, field: string, val: string) => {
    const next = metrics.map((m, idx) => (idx === i ? { ...m, [field]: val } : m));
    onChange({ ...d, metrics: next });
  };
  const addMetric = () => onChange({ ...d, metrics: [...metrics, { value: '0', label: '라벨' }] });
  const removeMetric = (i: number) => onChange({ ...d, metrics: metrics.filter((_, idx) => idx !== i) });
  return (
    <>
      <label>태그<input type="text" value={(d.tag as string) ?? ''} onChange={(e) => onChange({ ...d, tag: e.target.value })} /></label>
      <label>제목<input type="text" value={(d.title as string) ?? ''} onChange={(e) => onChange({ ...d, title: e.target.value })} /></label>
      {metrics.map((m, i) => (
        <div key={i} className="inline-row" style={{ alignItems: 'flex-end' }}>
          <label>값<input type="text" value={m.value} onChange={(e) => updateMetric(i, 'value', e.target.value)} /></label>
          <label>라벨<input type="text" value={m.label} onChange={(e) => updateMetric(i, 'label', e.target.value)} /></label>
          <button className="btn-icon danger" onClick={() => removeMetric(i)} style={{ marginBottom: 4 }}>×</button>
        </div>
      ))}
      <button className="btn-small" onClick={addMetric}>+ 지표 추가</button>
    </>
  );
}

function QuoteForm({ slide, onChange }: FormProps) {
  const d = slide.data;
  return (
    <>
      <label>태그<input type="text" value={(d.tag as string) ?? ''} onChange={(e) => onChange({ ...d, tag: e.target.value })} /></label>
      <label>인용문<textarea rows={4} value={(d.quote as string) ?? ''} onChange={(e) => onChange({ ...d, quote: e.target.value })} /></label>
      <label>출처<input type="text" value={(d.attribution as string) ?? ''} onChange={(e) => onChange({ ...d, attribution: e.target.value })} /></label>
    </>
  );
}

function ImageTextForm({ slide, onChange }: FormProps) {
  const d = slide.data;
  return (
    <>
      <label>태그<input type="text" value={(d.tag as string) ?? ''} onChange={(e) => onChange({ ...d, tag: e.target.value })} /></label>
      <label>제목<input type="text" value={(d.title as string) ?? ''} onChange={(e) => onChange({ ...d, title: e.target.value })} /></label>
      <label>본문<textarea rows={4} value={(d.body as string) ?? ''} onChange={(e) => onChange({ ...d, body: e.target.value })} /></label>
      <label>이미지 URL<input type="text" value={(d.imageUrl as string) ?? ''} onChange={(e) => onChange({ ...d, imageUrl: e.target.value })} placeholder="https://..." /></label>
      <label>
        이미지 위치
        <select value={(d.imagePosition as string) ?? 'left'} onChange={(e) => onChange({ ...d, imagePosition: e.target.value })}>
          <option value="left">왼쪽</option>
          <option value="right">오른쪽</option>
        </select>
      </label>
    </>
  );
}

function CardsForm({ slide, onChange }: FormProps) {
  const d = slide.data;
  const cards = (d.cards as { title: string; body: string; highlight: boolean }[]) || [];
  const updateCard = (i: number, field: string, val: unknown) => {
    const next = cards.map((c, idx) => (idx === i ? { ...c, [field]: val } : c));
    onChange({ ...d, cards: next });
  };
  const addCard = () => onChange({ ...d, cards: [...cards, { title: '새 카드', body: '설명을 입력하세요', highlight: false }] });
  const removeCard = (i: number) => onChange({ ...d, cards: cards.filter((_, idx) => idx !== i) });
  return (
    <>
      <label>태그<input type="text" value={(d.tag as string) ?? ''} onChange={(e) => onChange({ ...d, tag: e.target.value })} /></label>
      <label>제목<input type="text" value={(d.title as string) ?? ''} onChange={(e) => onChange({ ...d, title: e.target.value })} /></label>
      {cards.map((c, i) => (
        <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 10, marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>카드 {i + 1}</span>
            <button className="btn-icon danger" onClick={() => removeCard(i)}>×</button>
          </div>
          <label>카드 제목<input type="text" value={c.title} onChange={(e) => updateCard(i, 'title', e.target.value)} /></label>
          <label>카드 본문<textarea rows={2} value={c.body} onChange={(e) => updateCard(i, 'body', e.target.value)} /></label>
          <label style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={c.highlight} onChange={(e) => updateCard(i, 'highlight', e.target.checked)} style={{ width: 'auto' }} />
            강조 표시
          </label>
        </div>
      ))}
      <button className="btn-small" onClick={addCard}>+ 카드 추가</button>
    </>
  );
}

function TimelineForm({ slide, onChange }: FormProps) {
  const d = slide.data;
  const steps = (d.steps as { stage: string; title: string; detail: string; metric: string; highlight: boolean }[]) || [];
  const updateStep = (i: number, field: string, val: unknown) => {
    const next = steps.map((s, idx) => (idx === i ? { ...s, [field]: val } : s));
    onChange({ ...d, steps: next });
  };
  const addStep = () => onChange({ ...d, steps: [...steps, { stage: `STEP ${String(steps.length + 1).padStart(2, '0')}`, title: '단계', detail: '설명', metric: '', highlight: false }] });
  const removeStep = (i: number) => onChange({ ...d, steps: steps.filter((_, idx) => idx !== i) });
  return (
    <>
      <label>태그<input type="text" value={(d.tag as string) ?? ''} onChange={(e) => onChange({ ...d, tag: e.target.value })} /></label>
      <label>제목<input type="text" value={(d.title as string) ?? ''} onChange={(e) => onChange({ ...d, title: e.target.value })} /></label>
      {steps.map((s, i) => (
        <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 10, marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>단계 {i + 1}</span>
            <button className="btn-icon danger" onClick={() => removeStep(i)}>×</button>
          </div>
          <div className="inline-row">
            <label>스테이지<input type="text" value={s.stage} onChange={(e) => updateStep(i, 'stage', e.target.value)} /></label>
            <label>제목<input type="text" value={s.title} onChange={(e) => updateStep(i, 'title', e.target.value)} /></label>
          </div>
          <label>상세<input type="text" value={s.detail} onChange={(e) => updateStep(i, 'detail', e.target.value)} /></label>
          <div className="inline-row">
            <label>지표<input type="text" value={s.metric} onChange={(e) => updateStep(i, 'metric', e.target.value)} /></label>
            <label style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={s.highlight} onChange={(e) => updateStep(i, 'highlight', e.target.checked)} style={{ width: 'auto' }} />
              강조
            </label>
          </div>
        </div>
      ))}
      <button className="btn-small" onClick={addStep}>+ 단계 추가</button>
    </>
  );
}

function BigNumberForm({ slide, onChange }: FormProps) {
  const d = slide.data;
  return (
    <>
      <label>태그<input type="text" value={(d.tag as string) ?? ''} onChange={(e) => onChange({ ...d, tag: e.target.value })} /></label>
      <label>숫자<input type="text" value={(d.number as string) ?? ''} onChange={(e) => onChange({ ...d, number: e.target.value })} placeholder="320%" /></label>
      <label>제목<input type="text" value={(d.title as string) ?? ''} onChange={(e) => onChange({ ...d, title: e.target.value })} /></label>
      <label>본문<textarea rows={3} value={(d.body as string) ?? ''} onChange={(e) => onChange({ ...d, body: e.target.value })} /></label>
    </>
  );
}

function StatsForm({ slide, onChange }: FormProps) {
  const d = slide.data;
  const metrics = (d.metrics as { value: string; label: string }[]) || [];
  const updateMetric = (i: number, field: string, val: string) => {
    const next = metrics.map((m, idx) => (idx === i ? { ...m, [field]: val } : m));
    onChange({ ...d, metrics: next });
  };
  const addMetric = () => onChange({ ...d, metrics: [...metrics, { value: '0', label: '라벨' }] });
  const removeMetric = (i: number) => onChange({ ...d, metrics: metrics.filter((_, idx) => idx !== i) });
  return (
    <>
      <label>태그<input type="text" value={(d.tag as string) ?? ''} onChange={(e) => onChange({ ...d, tag: e.target.value })} /></label>
      <label>제목<input type="text" value={(d.title as string) ?? ''} onChange={(e) => onChange({ ...d, title: e.target.value })} /></label>
      {metrics.map((m, i) => (
        <div key={i} className="inline-row" style={{ alignItems: 'flex-end' }}>
          <label>값<input type="text" value={m.value} onChange={(e) => updateMetric(i, 'value', e.target.value)} /></label>
          <label>라벨<input type="text" value={m.label} onChange={(e) => updateMetric(i, 'label', e.target.value)} /></label>
          <button className="btn-icon danger" onClick={() => removeMetric(i)} style={{ marginBottom: 4 }}>×</button>
        </div>
      ))}
      <button className="btn-small" onClick={addMetric}>+ 지표 추가</button>
      <label>본문<textarea rows={3} value={(d.body as string) ?? ''} onChange={(e) => onChange({ ...d, body: e.target.value })} /></label>
    </>
  );
}

function VideoForm({ slide, onChange }: FormProps) {
  const d = slide.data;
  return (
    <>
      <label>태그<input type="text" value={(d.tag as string) ?? ''} onChange={(e) => onChange({ ...d, tag: e.target.value })} /></label>
      <label>제목<input type="text" value={(d.title as string) ?? ''} onChange={(e) => onChange({ ...d, title: e.target.value })} /></label>
      <label>비디오 URL<input type="text" value={(d.videoUrl as string) ?? ''} onChange={(e) => onChange({ ...d, videoUrl: e.target.value })} placeholder="https://...mp4" /></label>
      <label>본문<textarea rows={3} value={(d.body as string) ?? ''} onChange={(e) => onChange({ ...d, body: e.target.value })} /></label>
    </>
  );
}

function OutroForm({ slide, onChange }: FormProps) {
  const d = slide.data;
  return (
    <>
      <label>제목<input type="text" value={(d.title as string) ?? ''} onChange={(e) => onChange({ ...d, title: e.target.value })} placeholder="Thank You" /></label>
      <label>부제목<input type="text" value={(d.subtitle as string) ?? ''} onChange={(e) => onChange({ ...d, subtitle: e.target.value })} /></label>
      <label>연락처<input type="text" value={(d.contactInfo as string) ?? ''} onChange={(e) => onChange({ ...d, contactInfo: e.target.value })} placeholder="name@company.com" /></label>
      <label>로고 URL<input type="text" value={(d.logoUrl as string) ?? ''} onChange={(e) => onChange({ ...d, logoUrl: e.target.value })} placeholder="https://..." /></label>
    </>
  );
}

function TemplateForm({ slide, onChange }: FormProps) {
  switch (slide.template) {
    case 'title': return <TitleForm slide={slide} onChange={onChange} />;
    case 'section-cover': return <SectionCoverForm slide={slide} onChange={onChange} />;
    case 'content': return <ContentForm slide={slide} onChange={onChange} />;
    case 'two-column': return <TwoColumnForm slide={slide} onChange={onChange} />;
    case 'comparison': return <ComparisonForm slide={slide} onChange={onChange} />;
    case 'metrics': return <MetricsForm slide={slide} onChange={onChange} />;
    case 'quote': return <QuoteForm slide={slide} onChange={onChange} />;
    case 'image-text': return <ImageTextForm slide={slide} onChange={onChange} />;
    case 'cards': return <CardsForm slide={slide} onChange={onChange} />;
    case 'timeline': return <TimelineForm slide={slide} onChange={onChange} />;
    case 'big-number': return <BigNumberForm slide={slide} onChange={onChange} />;
    case 'stats': return <StatsForm slide={slide} onChange={onChange} />;
    case 'video': return <VideoForm slide={slide} onChange={onChange} />;
    case 'outro': return <OutroForm slide={slide} onChange={onChange} />;
    case 'blank':
      return <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>빈 슬라이드 — 오버레이 오브젝트를 추가하세요</p>;
    default: return null;
  }
}

/* ─── Overlay property editor ─── */

function OverlayEditor({
  overlay,
  onUpdate,
  onRemove,
}: {
  overlay: OverlayObject;
  onUpdate: (patch: Partial<OverlayObject>) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const typeIcon = overlay.type === 'text' ? 'T' : overlay.type === 'shape' ? '◻' : '◩';
  const typeLabel = overlay.type === 'text' ? '텍스트' : overlay.type === 'shape' ? '도형' : '이미지';

  return (
    <div className="sp-overlay-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {typeIcon} {overlay.content || typeLabel}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="btn-icon" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }} style={{ fontSize: 10 }}>{expanded ? '▲' : '▼'}</button>
          <button className="btn-icon danger" onClick={(e) => { e.stopPropagation(); onRemove(); }}>×</button>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label>내용{overlay.type === 'image'
            ? <input type="text" value={overlay.content} onChange={(e) => onUpdate({ content: e.target.value })} placeholder="이미지 URL" />
            : <textarea rows={2} value={overlay.content} onChange={(e) => onUpdate({ content: e.target.value })} />
          }</label>

          <div className="inline-row">
            <label>글꼴 크기<input type="number" value={overlay.fontSize} onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })} min={8} max={200} /></label>
            <label>
              글꼴 굵기
              <select value={overlay.fontWeight} onChange={(e) => onUpdate({ fontWeight: Number(e.target.value) })}>
                <option value={300}>Light (300)</option>
                <option value={400}>Normal (400)</option>
                <option value={500}>Medium (500)</option>
                <option value={600}>SemiBold (600)</option>
                <option value={700}>Bold (700)</option>
                <option value={800}>ExtraBold (800)</option>
                <option value={900}>Black (900)</option>
              </select>
            </label>
          </div>

          <div className="inline-row">
            <label>글자색<input type="text" value={overlay.color} onChange={(e) => onUpdate({ color: e.target.value })} placeholder="#ffffff" /></label>
            <label>배경색<input type="text" value={overlay.backgroundColor} onChange={(e) => onUpdate({ backgroundColor: e.target.value })} placeholder="transparent" /></label>
          </div>

          <div className="inline-row">
            <label>Border Radius<input type="number" value={overlay.borderRadius} onChange={(e) => onUpdate({ borderRadius: Number(e.target.value) })} min={0} max={999} /></label>
            <label>투명도<input type="number" value={overlay.opacity} onChange={(e) => onUpdate({ opacity: Number(e.target.value) })} min={0} max={1} step={0.05} /></label>
          </div>

          <div className="inline-row">
            <label>너비 (%)<input type="number" value={overlay.width} onChange={(e) => onUpdate({ width: Number(e.target.value) })} min={1} max={100} /></label>
            <label>높이 (%)<input type="number" value={overlay.height} onChange={(e) => onUpdate({ height: Number(e.target.value) })} min={1} max={100} /></label>
          </div>

          <div className="inline-row">
            <label>
              애니메이션
              <select value={overlay.animation} onChange={(e) => onUpdate({ animation: e.target.value })}>
                {OVERLAY_ANIMATIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </label>
            <label>딜레이 (ms)<input type="number" value={overlay.animDelay} onChange={(e) => onUpdate({ animDelay: Number(e.target.value) })} min={0} max={10000} step={50} /></label>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main editor component ─── */

export function ScreenPlayEditor() {
  const {
    project,
    addSlideFromTemplate,
    updateSlide,
    updateSlideData,
    removeSlide,
    reorderSlides,
    duplicateSlide,
    activeSlideId,
    setActiveSlide,
    setEditorStep,
    addOverlay,
    updateOverlay,
    removeOverlay,
  } = useProjectStore();

  const [addDropdownOpen, setAddDropdownOpen] = useState(false);
  const [aiPromptOpen, setAiPromptOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  const slides = project.slides;
  const activeSlide = slides.find((s) => s.id === activeSlideId) ?? null;

  /* ── Slide management handlers ── */

  const handleAddSlide = (template: SlideTemplate) => {
    addSlideFromTemplate(template);
    setAddDropdownOpen(false);
  };

  const handleTemplateChange = (slide: Slide, template: SlideTemplate) => {
    updateSlide(slide.id, {
      template,
      data: getDefaultTemplateData(template),
    });
  };

  const handleMoveSlide = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= slides.length) return;
    reorderSlides(index, target);
  };

  /* ── Overlay creation ── */

  const handleAddOverlay = (slideId: string, type: 'text' | 'shape' | 'image') => {
    const overlay: OverlayObject = {
      id: crypto.randomUUID(),
      type,
      x: 10,
      y: 10,
      width: type === 'text' ? 30 : 20,
      height: type === 'text' ? 10 : 20,
      content: type === 'text' ? '텍스트' : '',
      fontSize: type === 'text' ? 24 : 16,
      fontWeight: 400,
      color: '#ffffff',
      backgroundColor: type === 'shape' ? 'rgba(255,255,255,0.1)' : 'transparent',
      borderRadius: type === 'shape' ? 8 : 0,
      opacity: 1,
      animation: 'none',
      animDelay: 0,
    };
    addOverlay(slideId, overlay);
  };

  return (
    <div className="screenplay-fullscreen">
      {/* ────────── LEFT SIDEBAR ────────── */}
      <div className="sp-sidebar">
        <div className="sp-sidebar-header">
          <span>슬라이드 ({slides.length})</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn-small sp-ai-btn" title="AI 생성">AI</button>
            <div style={{ position: 'relative' }}>
              <button
                className="btn-small"
                title="슬라이드 추가"
                onClick={() => setAddDropdownOpen((p) => !p)}
              >+</button>
              {addDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 4,
                    width: 200,
                    background: 'var(--bg-secondary, #1e1e2e)',
                    border: '1px solid var(--border, #333)',
                    borderRadius: 8,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    zIndex: 100,
                    padding: '4px 0',
                    maxHeight: 400,
                    overflowY: 'auto',
                  }}
                >
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => handleAddSlide(t.value)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        width: '100%',
                        padding: '8px 12px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-primary, #eee)',
                        fontSize: 13,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--hover, rgba(255,255,255,0.06))'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
                    >
                      <span style={{ width: 20, textAlign: 'center', flexShrink: 0 }}>{t.icon}</span>
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sp-slide-list">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`sp-slide-item${slide.id === activeSlideId ? ' active' : ''}`}
              onClick={() => setActiveSlide(slide.id)}
            >
              <span className="sp-slide-num">{index + 1}</span>
              <div className="sp-slide-info">
                <span className="sp-slide-name">{slide.label}</span>
                <span className="sp-slide-type">{TEMPLATE_LABELS[slide.template]}</span>
              </div>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 2, marginLeft: 'auto', flexShrink: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', gap: 2 }}>
                  <button
                    className="btn-icon"
                    title="위로"
                    onClick={() => handleMoveSlide(index, -1)}
                    disabled={index === 0}
                    style={{ fontSize: 9, padding: '1px 3px' }}
                  >▲</button>
                  <button
                    className="btn-icon"
                    title="아래로"
                    onClick={() => handleMoveSlide(index, 1)}
                    disabled={index === slides.length - 1}
                    style={{ fontSize: 9, padding: '1px 3px' }}
                  >▼</button>
                </div>
                <div style={{ display: 'flex', gap: 2 }}>
                  <button
                    className="btn-icon"
                    title="복제"
                    onClick={() => duplicateSlide(slide.id)}
                    style={{ fontSize: 10, padding: '1px 3px' }}
                  >⎘</button>
                  <button
                    className="btn-icon danger"
                    title="삭제"
                    onClick={() => {
                      removeSlide(slide.id);
                    }}
                    style={{ fontSize: 10, padding: '1px 3px' }}
                  >×</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ────────── CENTER CONFIG ────────── */}
      <div className="sp-config">
        {activeSlide ? (
          <div className="sp-config-scroll">
            {/* -- Slide settings -- */}
            <div className="sp-section-title">슬라이드 설정</div>

            <label>
              이름
              <input
                type="text"
                value={activeSlide.label}
                onChange={(e) => updateSlide(activeSlide.id, { label: e.target.value })}
              />
            </label>

            <label>
              템플릿
              <select
                value={activeSlide.template}
                onChange={(e) => handleTemplateChange(activeSlide, e.target.value as SlideTemplate)}
              >
                {TEMPLATES.map((t) => (
                  <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                ))}
              </select>
            </label>

            <label>
              진입 애니메이션
              <select
                value={activeSlide.entryAnimation}
                onChange={(e) => updateSlide(activeSlide.id, { entryAnimation: e.target.value as ContentAnimationType })}
              >
                {CONTENT_ANIMATIONS.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </label>

            <div className="inline-row">
              <label>
                전환 효과
                <select
                  value={activeSlide.transition}
                  onChange={(e) => updateSlide(activeSlide.id, { transition: e.target.value as TransitionType })}
                >
                  {TRANSITIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </label>
              <label>
                표시 시간 (초)
                <input
                  type="number"
                  value={activeSlide.duration / 1000}
                  onChange={(e) => updateSlide(activeSlide.id, { duration: Number(e.target.value) * 1000 })}
                  min={1}
                  max={300}
                  step={0.5}
                />
              </label>
            </div>

            <div className="inline-row">
              <label>
                배경색
                <input
                  type="text"
                  value={activeSlide.backgroundColor || ''}
                  onChange={(e) => updateSlide(activeSlide.id, { backgroundColor: e.target.value })}
                  placeholder="테마 기본"
                />
              </label>
              <label>
                배경 이펙트
                <select
                  value={activeSlide.backgroundEffect || 'none'}
                  onChange={(e) => {
                    updateSlide(activeSlide.id, { backgroundEffect: e.target.value });
                  }}
                >
                  {BACKGROUND_EFFECT_PRESETS.map((p) => (
                    <option key={p.value.type} value={p.value.type}>{p.label}</option>
                  ))}
                </select>
              </label>
            </div>

            {/* -- Content editing -- */}
            <div className="sp-divider" />
            <div className="sp-section-title">콘텐츠 편집</div>
            <p className="sp-hint">**굵은 텍스트**로 감싸면 액센트 컬러로 강조됩니다</p>

            <TemplateForm
              slide={activeSlide}
              onChange={(data) => updateSlideData(activeSlide.id, data)}
            />

            {/* -- Overlay objects -- */}
            <div className="sp-divider" />
            <div className="sp-section-title">오버레이 오브제</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button className="btn-small" onClick={() => handleAddOverlay(activeSlide.id, 'text')}>+ 텍스트</button>
              <button className="btn-small" onClick={() => handleAddOverlay(activeSlide.id, 'shape')}>+ 도형</button>
              <button className="btn-small" onClick={() => handleAddOverlay(activeSlide.id, 'image')}>+ 이미지</button>
            </div>

            {activeSlide.overlays.map((ov) => (
              <OverlayEditor
                key={ov.id}
                overlay={ov}
                onUpdate={(patch) => updateOverlay(activeSlide.id, ov.id, patch)}
                onRemove={() => removeOverlay(activeSlide.id, ov.id)}
              />
            ))}

            {/* -- AI modification button -- */}
            <div className="sp-divider" />
            <button
              className="sp-ai-action-btn"
              onClick={() => setAiPromptOpen((p) => !p)}
            >
              AI로 이 슬라이드 수정
            </button>

            {aiPromptOpen && (
              <div style={{ marginTop: 8 }}>
                <textarea
                  rows={3}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="수정할 내용을 설명하세요... (예: 제목을 더 임팩트있게 바꿔줘)"
                  style={{ width: '100%', marginBottom: 8 }}
                />
                <button
                  className="btn-small"
                  onClick={() => {
                    alert('AI 슬라이드 수정 기능은 추후 연동 예정입니다.');
                    setAiPrompt('');
                    setAiPromptOpen(false);
                  }}
                  style={{ width: '100%' }}
                >
                  전송
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="sp-config-empty">
            <p>슬라이드를 선택하거나<br />새 슬라이드를 추가하세요</p>
          </div>
        )}
      </div>

      {/* ────────── RIGHT LIVE PREVIEW ────────── */}
      <LivePreview slide={activeSlide} />

      {/* ────────── BOTTOM NAV ────────── */}
      <div className="sp-bottom-nav">
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
