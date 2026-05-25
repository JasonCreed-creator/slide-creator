import { useState, useCallback, useEffect } from 'react';
import type { Slide, KeyVisual, TemplateData, OverlayElement } from '@/types';

function hl(text: string, accent: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, `<b style="color:${accent};font-weight:800">$1</b>`);
}

function nlbr(text: string, accent: string): string {
  return hl(text, accent).replace(/\n/g, '<br>');
}

function Tag({ text, accent }: { text?: string; accent: string }) {
  if (!text) return null;
  return (
    <div style={{
      display: 'inline-block', fontSize: 'clamp(8px, 1.2vw, 13px)', fontWeight: 700,
      color: accent, letterSpacing: 5, padding: '6px 14px',
      border: `1px solid ${accent}66`, borderRadius: 2, background: `${accent}0d`, marginBottom: 18,
    }}>{text}</div>
  );
}

function editableProps(
  onDataChange: ((patch: Partial<TemplateData>) => void) | undefined,
  field: keyof TemplateData,
  isMultiline?: boolean,
) {
  if (!onDataChange) return {};
  return {
    contentEditable: true,
    suppressContentEditableWarning: true,
    className: 'sr-editable',
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      const raw = isMultiline ? e.currentTarget.innerText : e.currentTarget.textContent || '';
      onDataChange({ [field]: raw } as Partial<TemplateData>);
    },
  };
}

interface DragState {
  id: string;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
}

function DraggableOverlay({
  ov, onDataChange, overlays, containerRef,
}: {
  ov: OverlayElement;
  onDataChange?: (patch: Partial<TemplateData>) => void;
  overlays: OverlayElement[];
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const [pos, setPos] = useState({ x: ov.x, y: ov.y });
  const [selected, setSelected] = useState(false);

  useEffect(() => { setPos({ x: ov.x, y: ov.y }); }, [ov.x, ov.y]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!onDataChange) return;
    e.preventDefault();
    e.stopPropagation();
    setSelected(true);
    setDrag({ id: ov.id, startX: e.clientX, startY: e.clientY, origX: ov.x, origY: ov.y });
  }, [onDataChange, ov.id, ov.x, ov.y]);

  useEffect(() => {
    if (!drag) return;
    const handleMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dx = ((e.clientX - drag.startX) / rect.width) * 100;
      const dy = ((e.clientY - drag.startY) / rect.height) * 100;
      setPos({
        x: Math.max(0, Math.min(100 - ov.width, drag.origX + dx)),
        y: Math.max(0, Math.min(100 - ov.height, drag.origY + dy)),
      });
    };
    const handleUp = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dx = ((e.clientX - drag.startX) / rect.width) * 100;
      const dy = ((e.clientY - drag.startY) / rect.height) * 100;
      const newX = Math.max(0, Math.min(100 - ov.width, drag.origX + dx));
      const newY = Math.max(0, Math.min(100 - ov.height, drag.origY + dy));
      if (onDataChange) {
        onDataChange({
          overlays: overlays.map((o) => o.id === ov.id ? { ...o, x: newX, y: newY } : o),
        });
      }
      setDrag(null);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [drag, ov.id, ov.width, ov.height, onDataChange, overlays, containerRef]);

  const base: React.CSSProperties = {
    position: 'absolute',
    left: `${pos.x}%`,
    top: `${pos.y}%`,
    width: `${ov.width}%`,
    height: `${ov.height}%`,
    opacity: ov.opacity ?? 1,
    zIndex: 10,
    cursor: onDataChange ? (drag ? 'grabbing' : 'grab') : 'default',
    outline: selected && onDataChange ? '2px solid var(--accent, #4f8cff)' : 'none',
    outlineOffset: 2,
    userSelect: 'none',
  };

  useEffect(() => {
    if (!selected) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(`[data-overlay-id="${ov.id}"]`)) setSelected(false);
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [selected, ov.id]);

  if (ov.type === 'text') {
    const updateContent = onDataChange
      ? (e: React.FocusEvent<HTMLDivElement>) => {
          onDataChange({ overlays: overlays.map((o) => o.id === ov.id ? { ...o, content: e.currentTarget.textContent || '' } : o) });
        }
      : undefined;
    return (
      <div
        data-overlay-id={ov.id}
        onMouseDown={handleMouseDown}
        style={{
          ...base,
          fontSize: ov.fontSize ?? 24,
          fontWeight: ov.fontWeight ?? 700,
          color: ov.color ?? '#ffffff',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          contentEditable={!!onDataChange && !drag}
          suppressContentEditableWarning
          onBlur={updateContent}
          className={onDataChange ? 'sr-editable' : undefined}
          style={{ width: '100%', pointerEvents: drag ? 'none' : 'auto' }}
        >
          {ov.content}
        </div>
      </div>
    );
  }

  if (ov.type === 'shape') {
    return (
      <div
        data-overlay-id={ov.id}
        onMouseDown={handleMouseDown}
        style={{
          ...base,
          backgroundColor: ov.backgroundColor ?? 'rgba(79,140,255,0.3)',
          borderRadius: ov.borderRadius ?? 8,
        }}
      />
    );
  }

  if (ov.type === 'image') {
    return (
      <div data-overlay-id={ov.id} onMouseDown={handleMouseDown} style={base}>
        {ov.content ? (
          <img src={ov.content} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: ov.borderRadius ?? 0, pointerEvents: 'none' }} draggable={false} />
        ) : (
          <div style={{ width: '100%', height: '100%', border: '1px dashed rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'rgba(255,255,255,.3)' }}>IMAGE</div>
        )}
      </div>
    );
  }

  return null;
}

function OverlayLayer({ overlays, onDataChange, containerRef }: {
  overlays?: OverlayElement[];
  onDataChange?: (patch: Partial<TemplateData>) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  if (!overlays || overlays.length === 0) return null;
  return (
    <>
      {overlays.map((ov) => (
        <DraggableOverlay key={ov.id} ov={ov} onDataChange={onDataChange} overlays={overlays} containerRef={containerRef} />
      ))}
    </>
  );
}

export interface SlideRendererProps {
  slide: Slide;
  kv: KeyVisual;
  onDataChange?: (patch: Partial<TemplateData>) => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export function SlideRenderer({ slide, kv, onDataChange, containerRef }: SlideRendererProps) {
  const d = slide.data;
  const accent = kv.accentColor;
  const overlays = d.overlays;
  const dummyRef = { current: null };
  const cRef = containerRef || dummyRef;

  const templateContent = (() => {
  switch (slide.template) {
    case 'title':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '0 7%' }}>
          <Tag text={d.tag} accent={accent} />
          {onDataChange
            ? <h1 style={{ fontSize: 'clamp(24px, 5vw, 78px)', fontWeight: 800, lineHeight: 1.12, letterSpacing: -3, textAlign: 'center' }} {...editableProps(onDataChange, 'title')}>{d.title || ''}</h1>
            : <h1 style={{ fontSize: 'clamp(24px, 5vw, 78px)', fontWeight: 800, lineHeight: 1.12, letterSpacing: -3, textAlign: 'center' }} dangerouslySetInnerHTML={{ __html: hl(d.title || '', accent) }} />
          }
          {d.subtitle && (onDataChange
            ? <p style={{ fontSize: 'clamp(10px, 1.5vw, 20px)', fontWeight: 600, letterSpacing: 4, color: kv.secondaryColor, marginTop: 20, textAlign: 'center' }} {...editableProps(onDataChange, 'subtitle')}>{d.subtitle}</p>
            : <p style={{ fontSize: 'clamp(10px, 1.5vw, 20px)', fontWeight: 600, letterSpacing: 4, color: kv.secondaryColor, marginTop: 20, textAlign: 'center' }}>{d.subtitle}</p>
          )}
        </div>
      );

    case 'section-cover':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 'clamp(8px, 1.5vw, 20px)' }}>
          <div style={{ fontSize: 'clamp(8px, 1vw, 13px)', fontWeight: 700, letterSpacing: 6, color: kv.secondaryColor }} {...editableProps(onDataChange, 'subtitle')}>{d.subtitle}</div>
          <div style={{ fontSize: 'clamp(32px, 7vw, 100px)', fontWeight: 900, letterSpacing: -4, color: accent, lineHeight: .9, textShadow: `0 0 60px ${accent}66` }} {...editableProps(onDataChange, 'number')}>{d.number}</div>
          <div style={{ width: 1, height: 'clamp(16px, 3vw, 50px)', background: `linear-gradient(to bottom, ${accent}, transparent)` }} />
          {onDataChange
            ? <div style={{ fontSize: 'clamp(20px, 5vw, 80px)', fontWeight: 800, letterSpacing: -2, textAlign: 'center' }} {...editableProps(onDataChange, 'title')}>{d.title || ''}</div>
            : <div style={{ fontSize: 'clamp(20px, 5vw, 80px)', fontWeight: 800, letterSpacing: -2, textAlign: 'center' }} dangerouslySetInnerHTML={{ __html: hl(d.title || '', accent) }} />
          }
        </div>
      );

    case 'content':
      return (
        <div style={{ padding: '7%' }}>
          <Tag text={d.tag} accent={accent} />
          {onDataChange
            ? <h1 style={{ fontSize: 'clamp(18px, 4vw, 56px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: -2 }} {...editableProps(onDataChange, 'title')}>{d.title || ''}</h1>
            : <h1 style={{ fontSize: 'clamp(18px, 4vw, 56px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: -2 }} dangerouslySetInnerHTML={{ __html: hl(d.title || '', accent) }} />
          }
          {onDataChange
            ? <p style={{ fontSize: 'clamp(10px, 1.6vw, 24px)', lineHeight: 1.7, fontWeight: 500, marginTop: 'clamp(12px, 2vw, 32px)', maxWidth: '70%', whiteSpace: 'pre-wrap' }} {...editableProps(onDataChange, 'body', true)}>{d.body || ''}</p>
            : <p style={{ fontSize: 'clamp(10px, 1.6vw, 24px)', lineHeight: 1.7, fontWeight: 500, marginTop: 'clamp(12px, 2vw, 32px)', maxWidth: '70%' }} dangerouslySetInnerHTML={{ __html: nlbr(d.body || '', accent) }} />
          }
        </div>
      );

    case 'metrics':
      return (
        <div style={{ padding: '7%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Tag text={d.tag} accent={accent} />
          <h1 style={{ fontSize: 'clamp(16px, 3.5vw, 56px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: -2 }} dangerouslySetInnerHTML={{ __html: hl(d.title || '', accent) }} />
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(16px, 4vw, 60px)', flex: 1, alignItems: 'center' }}>
            {(d.metrics || []).map((m, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(24px, 5vw, 80px)', fontWeight: 800, letterSpacing: -3, color: accent, lineHeight: 1, textShadow: `0 0 40px ${accent}40` }}>{m.value}</div>
                <div style={{ fontSize: 'clamp(7px, 1vw, 16px)', fontWeight: 700, letterSpacing: 3, color: kv.secondaryColor, marginTop: 12 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'quote':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '0 10%' }}>
          <Tag text={d.tag} accent={accent} />
          <blockquote style={{ fontSize: 'clamp(16px, 4vw, 60px)', fontWeight: 800, lineHeight: 1.25, textAlign: 'center', letterSpacing: -2, maxWidth: 1000 }} dangerouslySetInnerHTML={{ __html: hl(d.quote || '', accent) }} />
          {d.attribution && <div style={{ marginTop: 'clamp(12px, 2vw, 36px)', fontSize: 'clamp(8px, 1vw, 16px)', fontWeight: 600, color: kv.secondaryColor, letterSpacing: 3 }}>{d.attribution}</div>}
        </div>
      );

    case 'big-number':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 'clamp(8px, 1.5vw, 20px)', padding: '0 10%' }}>
          <div style={{ fontSize: 'clamp(48px, 12vw, 180px)', fontWeight: 900, letterSpacing: -6, color: accent, lineHeight: .9, textShadow: `0 0 80px ${accent}66` }} {...editableProps(onDataChange, 'number')}>{d.number}</div>
          <div style={{ width: 1, height: 'clamp(10px, 2vw, 30px)', background: `linear-gradient(to bottom, ${accent}, transparent)` }} />
          {onDataChange
            ? <div style={{ fontSize: 'clamp(18px, 4vw, 60px)', fontWeight: 800, letterSpacing: -2, textAlign: 'center' }} {...editableProps(onDataChange, 'title')}>{d.title || ''}</div>
            : <div style={{ fontSize: 'clamp(18px, 4vw, 60px)', fontWeight: 800, letterSpacing: -2, textAlign: 'center' }} dangerouslySetInnerHTML={{ __html: hl(d.title || '', accent) }} />
          }
          {d.body && <p style={{ fontSize: 'clamp(10px, 1.5vw, 22px)', lineHeight: 1.6, fontWeight: 500, textAlign: 'center', color: kv.secondaryColor, maxWidth: '80%' }} dangerouslySetInnerHTML={{ __html: nlbr(d.body, accent) }} />}
        </div>
      );

    case 'outro':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 'clamp(8px, 1.5vw, 24px)', padding: '0 10%' }}>
          {onDataChange
            ? <h1 style={{ fontSize: 'clamp(28px, 6vw, 90px)', fontWeight: 900, letterSpacing: -3, textAlign: 'center' }} {...editableProps(onDataChange, 'title')}>{d.title || 'Thank You'}</h1>
            : <h1 style={{ fontSize: 'clamp(28px, 6vw, 90px)', fontWeight: 900, letterSpacing: -3, textAlign: 'center' }} dangerouslySetInnerHTML={{ __html: hl(d.title || 'Thank You', accent) }} />
          }
          {d.subtitle && <p style={{ fontSize: 'clamp(10px, 1.5vw, 22px)', fontWeight: 600, letterSpacing: 4, color: kv.secondaryColor, textAlign: 'center' }}>{d.subtitle}</p>}
          <div style={{ width: 60, height: 1, background: `${accent}66` }} />
          {d.contactInfo && <p style={{ fontSize: 'clamp(9px, 1.2vw, 18px)', lineHeight: 1.8, fontWeight: 500, textAlign: 'center', color: kv.secondaryColor }} dangerouslySetInnerHTML={{ __html: nlbr(d.contactInfo, accent) }} />}
        </div>
      );

    default:
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: .5 }}>
          <h2 style={{ fontSize: 'clamp(14px, 2vw, 32px)' }}>{slide.label}</h2>
        </div>
      );
  }
  })();

  return (
    <div ref={onDataChange ? cRef as React.RefObject<HTMLDivElement> : undefined} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {templateContent}
      <OverlayLayer overlays={overlays} onDataChange={onDataChange} containerRef={cRef} />
    </div>
  );
}
