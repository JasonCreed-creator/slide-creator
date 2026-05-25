import { useRef } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import type { Slide, SlideTemplate, EntryAnimation, TransitionType, TemplateData } from '@/types';
import { TEMPLATE_LABELS } from '@/types';

const TRANSITIONS: { value: TransitionType; label: string }[] = [
  { value: 'none', label: '없음' },
  { value: 'fade', label: '페이드' },
  { value: 'slide-left', label: '슬라이드 좌' },
  { value: 'slide-right', label: '슬라이드 우' },
  { value: 'zoom-in', label: '줌 인' },
  { value: 'dissolve', label: '디졸브' },
];

const ANIMATIONS: { value: EntryAnimation; label: string }[] = [
  { value: 'fadeUp', label: '아래에서 위로' },
  { value: 'fadeIn', label: '페이드 인' },
  { value: 'scaleIn', label: '스케일 인' },
  { value: 'none', label: '없음' },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="prop-label">
      {label}
      {children}
    </label>
  );
}

function TextArea({ value, onChange, rows = 2 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return <textarea className="prop-textarea" value={value} onChange={(e) => onChange(e.target.value)} rows={rows} />;
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />;
}

export function TemplateEditor({ slide }: { slide: Slide }) {
  const { updateSlide, updateSlideData } = useProjectStore();
  const d = slide.data;
  const setData = (patch: Record<string, unknown>) => updateSlideData(slide.id, patch);

  return (
    <div className="template-editor">
      <div className="te-section">
        <span className="te-section-title">슬라이드 설정</span>
        <Field label="이름">
          <Input value={slide.label} onChange={(v) => updateSlide(slide.id, { label: v })} />
        </Field>
        <div className="property-row">
          <Field label="템플릿">
            <select
              value={slide.template}
              onChange={(e) => updateSlide(slide.id, { template: e.target.value as SlideTemplate })}
            >
              {Object.entries(TEMPLATE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="진입 애니메이션">
            <select
              value={slide.entryAnimation}
              onChange={(e) => updateSlide(slide.id, { entryAnimation: e.target.value as EntryAnimation })}
            >
              {ANIMATIONS.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="property-row">
          <Field label="전환 효과">
            <select
              value={slide.transition}
              onChange={(e) => updateSlide(slide.id, { transition: e.target.value as TransitionType })}
            >
              {TRANSITIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>
          <Field label="표시 시간 (초)">
            <input
              type="number"
              value={slide.duration / 1000}
              onChange={(e) => updateSlide(slide.id, { duration: Number(e.target.value) * 1000 })}
              min={1}
              max={300}
            />
          </Field>
        </div>
        <Field label="배경색 (비워두면 테마 기본)">
          <Input
            value={slide.backgroundColor || ''}
            onChange={(v) => updateSlide(slide.id, { backgroundColor: v || undefined })}
            placeholder="#000000"
          />
        </Field>
      </div>

      <div className="te-section">
        <span className="te-section-title">콘텐츠 편집</span>
        <p className="te-hint">**굵은 텍스트**로 감싸면 악센트 컬러로 강조됩니다</p>
        <TemplateFields template={slide.template} data={d} setData={setData} />
      </div>
    </div>
  );
}

function TemplateFields({
  template, data: d, setData,
}: {
  template: SlideTemplate;
  data: TemplateData;
  setData: (patch: Partial<TemplateData>) => void;
}) {
  switch (template) {
    case 'title':
      return (
        <>
          <Field label="태그"><Input value={(d.tag as string) || ''} onChange={(v) => setData({ tag: v })} placeholder="KEYNOTE" /></Field>
          <Field label="제목"><TextArea value={(d.title as string) || ''} onChange={(v) => setData({ title: v })} rows={2} /></Field>
          <Field label="부제목"><Input value={(d.subtitle as string) || ''} onChange={(v) => setData({ subtitle: v })} /></Field>
        </>
      );

    case 'section-cover':
      return (
        <>
          <Field label="번호"><Input value={(d.number as string) || ''} onChange={(v) => setData({ number: v })} placeholder="01" /></Field>
          <Field label="제목"><Input value={(d.title as string) || ''} onChange={(v) => setData({ title: v })} /></Field>
          <Field label="설명"><Input value={(d.subtitle as string) || ''} onChange={(v) => setData({ subtitle: v })} /></Field>
        </>
      );

    case 'content':
      return (
        <>
          <Field label="태그"><Input value={(d.tag as string) || ''} onChange={(v) => setData({ tag: v })} /></Field>
          <Field label="제목"><TextArea value={(d.title as string) || ''} onChange={(v) => setData({ title: v })} /></Field>
          <Field label="본문"><TextArea value={(d.body as string) || ''} onChange={(v) => setData({ body: v })} rows={5} /></Field>
        </>
      );

    case 'two-column':
      return (
        <>
          <Field label="태그"><Input value={(d.tag as string) || ''} onChange={(v) => setData({ tag: v })} /></Field>
          <Field label="제목"><Input value={(d.title as string) || ''} onChange={(v) => setData({ title: v })} /></Field>
          <div className="property-row">
            <Field label="좌측 제목"><Input value={(d.leftTitle as string) || ''} onChange={(v) => setData({ leftTitle: v })} /></Field>
            <Field label="우측 제목"><Input value={(d.rightTitle as string) || ''} onChange={(v) => setData({ rightTitle: v })} /></Field>
          </div>
          <Field label="좌측 본문"><TextArea value={(d.leftBody as string) || ''} onChange={(v) => setData({ leftBody: v })} /></Field>
          <Field label="우측 본문"><TextArea value={(d.rightBody as string) || ''} onChange={(v) => setData({ rightBody: v })} /></Field>
        </>
      );

    case 'comparison':
      return (
        <>
          <Field label="태그"><Input value={(d.tag as string) || ''} onChange={(v) => setData({ tag: v })} /></Field>
          <Field label="제목"><Input value={(d.title as string) || ''} onChange={(v) => setData({ title: v })} /></Field>
          <div className="property-row">
            <Field label="A 라벨"><Input value={(d.leftLabel as string) || ''} onChange={(v) => setData({ leftLabel: v })} /></Field>
            <Field label="B 라벨"><Input value={(d.rightLabel as string) || ''} onChange={(v) => setData({ rightLabel: v })} /></Field>
          </div>
          <Field label="A 내용"><TextArea value={(d.leftContent as string) || ''} onChange={(v) => setData({ leftContent: v })} /></Field>
          <Field label="B 내용"><TextArea value={(d.rightContent as string) || ''} onChange={(v) => setData({ rightContent: v })} /></Field>
          <div className="property-row">
            <Field label="A 지표 값"><Input value={(d.leftMetricValue as string) || ''} onChange={(v) => setData({ leftMetricValue: v })} /></Field>
            <Field label="A 지표 라벨"><Input value={(d.leftMetricLabel as string) || ''} onChange={(v) => setData({ leftMetricLabel: v })} /></Field>
          </div>
          <div className="property-row">
            <Field label="B 지표 값"><Input value={(d.rightMetricValue as string) || ''} onChange={(v) => setData({ rightMetricValue: v })} /></Field>
            <Field label="B 지표 라벨"><Input value={(d.rightMetricLabel as string) || ''} onChange={(v) => setData({ rightMetricLabel: v })} /></Field>
          </div>
          <Field label="승자">
            <select value={(d.winner as string) || 'none'} onChange={(e) => setData({ winner: e.target.value as 'left' | 'right' | 'none' })}>
              <option value="none">없음</option>
              <option value="left">A</option>
              <option value="right">B</option>
            </select>
          </Field>
        </>
      );

    case 'metrics': {
      const metrics = (d.metrics as Array<{ value: string; label: string }>) || [];
      return (
        <>
          <Field label="태그"><Input value={(d.tag as string) || ''} onChange={(v) => setData({ tag: v })} /></Field>
          <Field label="제목"><Input value={(d.title as string) || ''} onChange={(v) => setData({ title: v })} /></Field>
          {metrics.map((m, i) => (
            <div key={i} className="property-row">
              <Field label={`지표 ${i + 1} 값`}>
                <Input value={m.value} onChange={(v) => {
                  const newMetrics = [...metrics];
                  newMetrics[i] = { ...m, value: v };
                  setData({ metrics: newMetrics });
                }} />
              </Field>
              <Field label={`지표 ${i + 1} 라벨`}>
                <div style={{ display: 'flex', gap: 4 }}>
                  <Input value={m.label} onChange={(v) => {
                    const newMetrics = [...metrics];
                    newMetrics[i] = { ...m, label: v };
                    setData({ metrics: newMetrics });
                  }} />
                  <button className="btn-icon danger" onClick={() => setData({ metrics: metrics.filter((_, j) => j !== i) })}>&times;</button>
                </div>
              </Field>
            </div>
          ))}
          <button className="btn-small" onClick={() => setData({ metrics: [...metrics, { value: '0', label: '라벨' }] })}>+ 지표 추가</button>
        </>
      );
    }

    case 'quote':
      return (
        <>
          <Field label="태그"><Input value={(d.tag as string) || ''} onChange={(v) => setData({ tag: v })} /></Field>
          <Field label="인용문"><TextArea value={(d.quote as string) || ''} onChange={(v) => setData({ quote: v })} rows={4} /></Field>
          <Field label="출처"><Input value={(d.attribution as string) || ''} onChange={(v) => setData({ attribution: v })} /></Field>
        </>
      );

    case 'image-text':
      return <ImageTextFields data={d} setData={setData} />;

    case 'cards': {
      const cards = (d.cards as Array<{ title: string; body: string; highlight?: boolean }>) || [];
      return (
        <>
          <Field label="태그"><Input value={(d.tag as string) || ''} onChange={(v) => setData({ tag: v })} /></Field>
          <Field label="제목"><Input value={(d.title as string) || ''} onChange={(v) => setData({ title: v })} /></Field>
          {cards.map((c, i) => (
            <div key={i} className="te-card-edit">
              <div className="te-card-header">
                <span>카드 {i + 1}</span>
                <label style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                  <input type="checkbox" checked={c.highlight || false} onChange={(e) => {
                    const newCards = [...cards];
                    newCards[i] = { ...c, highlight: e.target.checked };
                    setData({ cards: newCards });
                  }} /> 강조
                </label>
                <button className="btn-icon danger" onClick={() => setData({ cards: cards.filter((_, j) => j !== i) })}>&times;</button>
              </div>
              <Input value={c.title} onChange={(v) => {
                const newCards = [...cards];
                newCards[i] = { ...c, title: v };
                setData({ cards: newCards });
              }} />
              <TextArea value={c.body} onChange={(v) => {
                const newCards = [...cards];
                newCards[i] = { ...c, body: v };
                setData({ cards: newCards });
              }} rows={2} />
            </div>
          ))}
          <button className="btn-small" onClick={() => setData({ cards: [...cards, { title: '새 카드', body: '내용', highlight: false }] })}>+ 카드 추가</button>
        </>
      );
    }

    case 'blank':
      return <p className="te-hint">자유 편집 모드입니다. 미리보기에서 슬라이드 이름이 표시됩니다.</p>;
  }
}

function ImageTextFields({ data: d, setData }: { data: TemplateData; setData: (patch: Partial<TemplateData>) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setData({ imageUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <Field label="태그"><Input value={(d.tag as string) || ''} onChange={(v) => setData({ tag: v })} /></Field>
      <Field label="제목"><Input value={(d.title as string) || ''} onChange={(v) => setData({ title: v })} /></Field>
      <Field label="본문"><TextArea value={(d.body as string) || ''} onChange={(v) => setData({ body: v })} rows={3} /></Field>
      <Field label="이미지">
        <div className="image-upload-group">
          <Input value={(d.imageUrl as string) || ''} onChange={(v) => setData({ imageUrl: v })} placeholder="https://... 또는 파일 업로드" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
          <button className="btn-upload" onClick={() => fileInputRef.current?.click()}>파일 업로드</button>
        </div>
        {d.imageUrl && (
          <div className="image-upload-thumb">
            <img src={d.imageUrl} alt="미리보기" />
            <button className="btn-icon danger" onClick={() => setData({ imageUrl: '' })}>&times;</button>
          </div>
        )}
      </Field>
      <Field label="이미지 위치">
        <select value={(d.imagePosition as string) || 'left'} onChange={(e) => setData({ imagePosition: e.target.value as 'left' | 'right' })}>
          <option value="left">왼쪽</option>
          <option value="right">오른쪽</option>
        </select>
      </Field>
    </>
  );
}
