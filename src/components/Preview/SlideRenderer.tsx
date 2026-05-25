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

  const fxAnims: Record<string, string> = {
    float: 'float 4s ease-in-out infinite',
    'float-slow': 'floatSlow 7s ease-in-out infinite',
    pulse: 'pulse 3s ease-in-out infinite',
    glow: 'glowPulse 3s ease-in-out infinite',
    breathe: 'breathe 4s ease-in-out infinite',
    rotate: 'rotate360 20s linear infinite',
  };

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
    animation: ov.continuousEffect && ov.continuousEffect !== 'none' ? fxAnims[ov.continuousEffect] : undefined,
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
            ? <h1 style={{ fontSize: 'clamp(24px, 5vw, 78px)', fontWeight: 800, lineHeight: 1.12, letterSpacing: -3, textAlign: 'center', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }} {...editableProps(onDataChange, 'title')}>{d.title || ''}</h1>
            : <h1 style={{ fontSize: 'clamp(24px, 5vw, 78px)', fontWeight: 800, lineHeight: 1.12, letterSpacing: -3, textAlign: 'center', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }} dangerouslySetInnerHTML={{ __html: hl(d.title || '', accent) }} />
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
          <div style={{ fontSize: 'clamp(32px, 7vw, 100px)', fontWeight: 900, letterSpacing: -4, color: accent, lineHeight: .9, textShadow: `0 0 60px ${accent}66, 0 2px 12px rgba(0,0,0,0.3)` }} {...editableProps(onDataChange, 'number')}>{d.number}</div>
          <div style={{ width: 1, height: 'clamp(16px, 3vw, 50px)', background: `linear-gradient(to bottom, ${accent}, transparent)` }} />
          {onDataChange
            ? <div style={{ fontSize: 'clamp(20px, 5vw, 80px)', fontWeight: 800, letterSpacing: -2, textAlign: 'center', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }} {...editableProps(onDataChange, 'title')}>{d.title || ''}</div>
            : <div style={{ fontSize: 'clamp(20px, 5vw, 80px)', fontWeight: 800, letterSpacing: -2, textAlign: 'center', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }} dangerouslySetInnerHTML={{ __html: hl(d.title || '', accent) }} />
          }
        </div>
      );

    case 'content':
      return (
        <div style={{ padding: '7%' }}>
          <Tag text={d.tag} accent={accent} />
          {onDataChange
            ? <h1 style={{ fontSize: 'clamp(18px, 4vw, 56px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: -2, textShadow: '0 2px 12px rgba(0,0,0,0.3)' }} {...editableProps(onDataChange, 'title')}>{d.title || ''}</h1>
            : <h1 style={{ fontSize: 'clamp(18px, 4vw, 56px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: -2, textShadow: '0 2px 12px rgba(0,0,0,0.3)' }} dangerouslySetInnerHTML={{ __html: hl(d.title || '', accent) }} />
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
          <h1 style={{ fontSize: 'clamp(16px, 3.5vw, 56px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: -2, textShadow: '0 2px 12px rgba(0,0,0,0.3)' }} dangerouslySetInnerHTML={{ __html: hl(d.title || '', accent) }} />
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(16px, 4vw, 60px)', flex: 1, alignItems: 'center' }}>
            {(d.metrics || []).map((m, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(24px, 5vw, 80px)', fontWeight: 800, letterSpacing: -3, color: accent, lineHeight: 1, textShadow: `0 0 60px ${accent}66, 0 4px 20px ${accent}40, 0 2px 12px rgba(0,0,0,0.3)` }}>{m.value}</div>
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
          <blockquote style={{ fontSize: 'clamp(16px, 4vw, 60px)', fontWeight: 800, lineHeight: 1.25, textAlign: 'center', letterSpacing: -2, maxWidth: 1000, textShadow: '0 2px 12px rgba(0,0,0,0.3)' }} dangerouslySetInnerHTML={{ __html: hl(d.quote || '', accent) }} />
          {d.attribution && <div style={{ marginTop: 'clamp(12px, 2vw, 36px)', fontSize: 'clamp(8px, 1vw, 16px)', fontWeight: 600, color: kv.secondaryColor, letterSpacing: 3 }}>{d.attribution}</div>}
        </div>
      );

    case 'big-number':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 'clamp(8px, 1.5vw, 20px)', padding: '0 10%' }}>
          <div style={{ fontSize: 'clamp(48px, 12vw, 180px)', fontWeight: 900, letterSpacing: -6, color: accent, lineHeight: .9, textShadow: `0 0 80px ${accent}66, 0 4px 20px ${accent}40, 0 2px 12px rgba(0,0,0,0.3)` }} {...editableProps(onDataChange, 'number')}>{d.number}</div>
          <div style={{ width: 1, height: 'clamp(10px, 2vw, 30px)', background: `linear-gradient(to bottom, ${accent}, transparent)` }} />
          {onDataChange
            ? <div style={{ fontSize: 'clamp(18px, 4vw, 60px)', fontWeight: 800, letterSpacing: -2, textAlign: 'center', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }} {...editableProps(onDataChange, 'title')}>{d.title || ''}</div>
            : <div style={{ fontSize: 'clamp(18px, 4vw, 60px)', fontWeight: 800, letterSpacing: -2, textAlign: 'center', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }} dangerouslySetInnerHTML={{ __html: hl(d.title || '', accent) }} />
          }
          {d.body && <p style={{ fontSize: 'clamp(10px, 1.5vw, 22px)', lineHeight: 1.6, fontWeight: 500, textAlign: 'center', color: kv.secondaryColor, maxWidth: '80%' }} dangerouslySetInnerHTML={{ __html: nlbr(d.body, accent) }} />}
        </div>
      );

    case 'outro':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 'clamp(8px, 1.5vw, 24px)', padding: '0 10%' }}>
          {onDataChange
            ? <h1 style={{ fontSize: 'clamp(28px, 6vw, 90px)', fontWeight: 900, letterSpacing: -3, textAlign: 'center', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }} {...editableProps(onDataChange, 'title')}>{d.title || 'Thank You'}</h1>
            : <h1 style={{ fontSize: 'clamp(28px, 6vw, 90px)', fontWeight: 900, letterSpacing: -3, textAlign: 'center', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }} dangerouslySetInnerHTML={{ __html: hl(d.title || 'Thank You', accent) }} />
          }
          {d.subtitle && <p style={{ fontSize: 'clamp(10px, 1.5vw, 22px)', fontWeight: 600, letterSpacing: 4, color: kv.secondaryColor, textAlign: 'center' }}>{d.subtitle}</p>}
          <div style={{ width: 60, height: 1, background: `${accent}66` }} />
          {d.contactInfo && <p style={{ fontSize: 'clamp(9px, 1.2vw, 18px)', lineHeight: 1.8, fontWeight: 500, textAlign: 'center', color: kv.secondaryColor }} dangerouslySetInnerHTML={{ __html: nlbr(d.contactInfo, accent) }} />}
        </div>
      );

    case 'two-column':
      return (
        <div style={{ padding: '7%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Tag text={d.tag} accent={accent} />
          {onDataChange
            ? <h1 style={{ fontSize: 'clamp(16px, 3.5vw, 48px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: -2, marginBottom: 'clamp(12px, 2vw, 32px)', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }} {...editableProps(onDataChange, 'title')}>{d.title || ''}</h1>
            : <h1 style={{ fontSize: 'clamp(16px, 3.5vw, 48px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: -2, marginBottom: 'clamp(12px, 2vw, 32px)', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }} dangerouslySetInnerHTML={{ __html: hl(d.title || '', accent) }} />
          }
          <div style={{ display: 'flex', gap: 'clamp(12px, 3vw, 40px)', flex: 1, alignItems: 'stretch' }}>
            <div style={{ flex: 1, background: `${accent}0a`, border: `1px solid ${accent}22`, borderRadius: 12, padding: 'clamp(12px, 2vw, 28px)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
              {onDataChange
                ? <h3 style={{ fontSize: 'clamp(12px, 2vw, 28px)', fontWeight: 700, color: accent, marginBottom: 'clamp(6px, 1vw, 14px)', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }} {...editableProps(onDataChange, 'leftTitle')}>{d.leftTitle || ''}</h3>
                : <h3 style={{ fontSize: 'clamp(12px, 2vw, 28px)', fontWeight: 700, color: accent, marginBottom: 'clamp(6px, 1vw, 14px)', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }} dangerouslySetInnerHTML={{ __html: hl(d.leftTitle || '', accent) }} />
              }
              {onDataChange
                ? <p style={{ fontSize: 'clamp(9px, 1.3vw, 18px)', lineHeight: 1.7, fontWeight: 500, whiteSpace: 'pre-wrap' }} {...editableProps(onDataChange, 'leftBody', true)}>{d.leftBody || ''}</p>
                : <p style={{ fontSize: 'clamp(9px, 1.3vw, 18px)', lineHeight: 1.7, fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: nlbr(d.leftBody || '', accent) }} />
              }
            </div>
            <div style={{ flex: 1, background: `${accent}0a`, border: `1px solid ${accent}22`, borderRadius: 12, padding: 'clamp(12px, 2vw, 28px)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
              {onDataChange
                ? <h3 style={{ fontSize: 'clamp(12px, 2vw, 28px)', fontWeight: 700, color: accent, marginBottom: 'clamp(6px, 1vw, 14px)', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }} {...editableProps(onDataChange, 'rightTitle')}>{d.rightTitle || ''}</h3>
                : <h3 style={{ fontSize: 'clamp(12px, 2vw, 28px)', fontWeight: 700, color: accent, marginBottom: 'clamp(6px, 1vw, 14px)', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }} dangerouslySetInnerHTML={{ __html: hl(d.rightTitle || '', accent) }} />
              }
              {onDataChange
                ? <p style={{ fontSize: 'clamp(9px, 1.3vw, 18px)', lineHeight: 1.7, fontWeight: 500, whiteSpace: 'pre-wrap' }} {...editableProps(onDataChange, 'rightBody', true)}>{d.rightBody || ''}</p>
                : <p style={{ fontSize: 'clamp(9px, 1.3vw, 18px)', lineHeight: 1.7, fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: nlbr(d.rightBody || '', accent) }} />
              }
            </div>
          </div>
        </div>
      );

    case 'comparison': {
      const isLeftWin = d.winner === 'left';
      const isRightWin = d.winner === 'right';
      const winGlow = (active: boolean): React.CSSProperties => active
        ? { boxShadow: `0 0 30px ${accent}44, 0 0 60px ${accent}22`, border: `2px solid ${accent}88`, animation: 'comparison-pulse 2s ease-in-out infinite' }
        : {};
      return (
        <div style={{ padding: '7%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Tag text={d.tag} accent={accent} />
          {onDataChange
            ? <h1 style={{ fontSize: 'clamp(16px, 3vw, 44px)', fontWeight: 800, letterSpacing: -2, marginBottom: 'clamp(12px, 2vw, 28px)', textAlign: 'center', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }} {...editableProps(onDataChange, 'title')}>{d.title || ''}</h1>
            : <h1 style={{ fontSize: 'clamp(16px, 3vw, 44px)', fontWeight: 800, letterSpacing: -2, marginBottom: 'clamp(12px, 2vw, 28px)', textAlign: 'center', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }} dangerouslySetInnerHTML={{ __html: hl(d.title || '', accent) }} />
          }
          <div style={{ display: 'flex', gap: 'clamp(12px, 2.5vw, 32px)', flex: 1, alignItems: 'stretch' }}>
            <div style={{
              flex: 1, background: `${accent}0a`, border: `1px solid ${accent}22`, borderRadius: 14,
              padding: 'clamp(12px, 2vw, 28px)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              display: 'flex', flexDirection: 'column', position: 'relative', transition: 'box-shadow 0.3s ease',
              ...winGlow(isLeftWin),
            }}>
              {isLeftWin && <div style={{ position: 'absolute', top: 'clamp(6px, 1vw, 12px)', right: 'clamp(6px, 1vw, 12px)', fontSize: 'clamp(7px, 0.8vw, 11px)', fontWeight: 700, color: accent, background: `${accent}1a`, padding: '3px 10px', borderRadius: 20, letterSpacing: 1 }}>WIN</div>}
              <div style={{ fontSize: 'clamp(10px, 1.6vw, 22px)', fontWeight: 700, color: accent, marginBottom: 'clamp(6px, 1vw, 12px)', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }} {...editableProps(onDataChange, 'leftLabel')}>{d.leftLabel || 'Option A'}</div>
              {onDataChange
                ? <p style={{ fontSize: 'clamp(8px, 1.2vw, 16px)', lineHeight: 1.7, fontWeight: 500, flex: 1, whiteSpace: 'pre-wrap' }} {...editableProps(onDataChange, 'leftContent', true)}>{d.leftContent || ''}</p>
                : <p style={{ fontSize: 'clamp(8px, 1.2vw, 16px)', lineHeight: 1.7, fontWeight: 500, flex: 1 }} dangerouslySetInnerHTML={{ __html: nlbr(d.leftContent || '', accent) }} />
              }
              {d.leftMetricValue && (
                <div style={{ marginTop: 'clamp(8px, 1vw, 16px)', paddingTop: 'clamp(8px, 1vw, 16px)', borderTop: `1px solid ${accent}22`, textAlign: 'center' }}>
                  <div style={{ fontSize: 'clamp(16px, 3vw, 42px)', fontWeight: 800, color: accent, textShadow: `0 0 40px ${accent}44, 0 2px 12px rgba(0,0,0,0.3)` }}>{d.leftMetricValue}</div>
                  {d.leftMetricLabel && <div style={{ fontSize: 'clamp(7px, 0.8vw, 12px)', fontWeight: 600, color: kv.secondaryColor, letterSpacing: 2, marginTop: 4 }}>{d.leftMetricLabel}</div>}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: 'clamp(12px, 1.5vw, 22px)', fontWeight: 700, color: kv.secondaryColor }}>VS</div>
            <div style={{
              flex: 1, background: `${accent}0a`, border: `1px solid ${accent}22`, borderRadius: 14,
              padding: 'clamp(12px, 2vw, 28px)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              display: 'flex', flexDirection: 'column', position: 'relative', transition: 'box-shadow 0.3s ease',
              ...winGlow(isRightWin),
            }}>
              {isRightWin && <div style={{ position: 'absolute', top: 'clamp(6px, 1vw, 12px)', right: 'clamp(6px, 1vw, 12px)', fontSize: 'clamp(7px, 0.8vw, 11px)', fontWeight: 700, color: accent, background: `${accent}1a`, padding: '3px 10px', borderRadius: 20, letterSpacing: 1 }}>WIN</div>}
              <div style={{ fontSize: 'clamp(10px, 1.6vw, 22px)', fontWeight: 700, color: accent, marginBottom: 'clamp(6px, 1vw, 12px)', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }} {...editableProps(onDataChange, 'rightLabel')}>{d.rightLabel || 'Option B'}</div>
              {onDataChange
                ? <p style={{ fontSize: 'clamp(8px, 1.2vw, 16px)', lineHeight: 1.7, fontWeight: 500, flex: 1, whiteSpace: 'pre-wrap' }} {...editableProps(onDataChange, 'rightContent', true)}>{d.rightContent || ''}</p>
                : <p style={{ fontSize: 'clamp(8px, 1.2vw, 16px)', lineHeight: 1.7, fontWeight: 500, flex: 1 }} dangerouslySetInnerHTML={{ __html: nlbr(d.rightContent || '', accent) }} />
              }
              {d.rightMetricValue && (
                <div style={{ marginTop: 'clamp(8px, 1vw, 16px)', paddingTop: 'clamp(8px, 1vw, 16px)', borderTop: `1px solid ${accent}22`, textAlign: 'center' }}>
                  <div style={{ fontSize: 'clamp(16px, 3vw, 42px)', fontWeight: 800, color: accent, textShadow: `0 0 40px ${accent}44, 0 2px 12px rgba(0,0,0,0.3)` }}>{d.rightMetricValue}</div>
                  {d.rightMetricLabel && <div style={{ fontSize: 'clamp(7px, 0.8vw, 12px)', fontWeight: 600, color: kv.secondaryColor, letterSpacing: 2, marginTop: 4 }}>{d.rightMetricLabel}</div>}
                </div>
              )}
            </div>
          </div>
          <style>{`@keyframes comparison-pulse { 0%, 100% { box-shadow: 0 0 30px ${accent}44, 0 0 60px ${accent}22; } 50% { box-shadow: 0 0 40px ${accent}66, 0 0 80px ${accent}33; } }`}</style>
        </div>
      );
    }

    case 'image-text': {
      const imgPct = d.imageSplit ?? 50;
      return (
        <div style={{ display: 'flex', flexDirection: d.imagePosition === 'right' ? 'row-reverse' : 'row', height: '100%' }}>
          <div style={{ flex: `0 0 ${imgPct}%`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: `${accent}08` }}>
            {d.imageUrl ? (
              <img src={d.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: kv.secondaryColor }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
                <div style={{ fontSize: 'clamp(8px, 1vw, 13px)', fontWeight: 600, letterSpacing: 2 }}>IMAGE</div>
              </div>
            )}
          </div>
          <div style={{ flex: `0 0 ${100 - imgPct}%`, padding: '7%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Tag text={d.tag} accent={accent} />
            {onDataChange
              ? <h1 style={{ fontSize: 'clamp(16px, 3.5vw, 48px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: -2, textShadow: '0 2px 12px rgba(0,0,0,0.3)' }} {...editableProps(onDataChange, 'title')}>{d.title || ''}</h1>
              : <h1 style={{ fontSize: 'clamp(16px, 3.5vw, 48px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: -2, textShadow: '0 2px 12px rgba(0,0,0,0.3)' }} dangerouslySetInnerHTML={{ __html: hl(d.title || '', accent) }} />
            }
            {onDataChange
              ? <p style={{ fontSize: 'clamp(9px, 1.3vw, 18px)', lineHeight: 1.7, fontWeight: 500, marginTop: 'clamp(10px, 1.5vw, 24px)', whiteSpace: 'pre-wrap' }} {...editableProps(onDataChange, 'body', true)}>{d.body || ''}</p>
              : <p style={{ fontSize: 'clamp(9px, 1.3vw, 18px)', lineHeight: 1.7, fontWeight: 500, marginTop: 'clamp(10px, 1.5vw, 24px)' }} dangerouslySetInnerHTML={{ __html: nlbr(d.body || '', accent) }} />
            }
          </div>
        </div>
      );
    }

    case 'cards':
      return (
        <div style={{ padding: '7%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Tag text={d.tag} accent={accent} />
          {onDataChange
            ? <h1 style={{ fontSize: 'clamp(16px, 3vw, 44px)', fontWeight: 800, letterSpacing: -2, marginBottom: 'clamp(12px, 2vw, 28px)', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }} {...editableProps(onDataChange, 'title')}>{d.title || ''}</h1>
            : <h1 style={{ fontSize: 'clamp(16px, 3vw, 44px)', fontWeight: 800, letterSpacing: -2, marginBottom: 'clamp(12px, 2vw, 28px)', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }} dangerouslySetInnerHTML={{ __html: hl(d.title || '', accent) }} />
          }
          <div style={{ display: 'flex', gap: 'clamp(8px, 1.5vw, 20px)', flex: 1, alignItems: 'stretch' }}>
            {(d.cards || []).map((card, i) => (
              <div key={i} style={{
                flex: 1, background: card.highlight ? `${accent}14` : `${accent}08`,
                border: `1px solid ${card.highlight ? `${accent}44` : `${accent}1a`}`,
                borderRadius: 14, padding: 'clamp(12px, 2vw, 28px)',
                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                display: 'flex', flexDirection: 'column',
                boxShadow: card.highlight ? `0 0 30px ${accent}22, 0 4px 20px rgba(0,0,0,0.15)` : '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'box-shadow 0.3s ease',
              }}>
                <div style={{ fontSize: 'clamp(10px, 1.5vw, 22px)', fontWeight: 700, color: accent, marginBottom: 'clamp(6px, 1vw, 14px)', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>{card.title}</div>
                <p style={{ fontSize: 'clamp(8px, 1.1vw, 15px)', lineHeight: 1.7, fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: nlbr(card.body || '', accent) }} />
              </div>
            ))}
          </div>
        </div>
      );

    case 'timeline':
      return (
        <div style={{ padding: '7%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Tag text={d.tag} accent={accent} />
          {onDataChange
            ? <h1 style={{ fontSize: 'clamp(16px, 3vw, 44px)', fontWeight: 800, letterSpacing: -2, marginBottom: 'clamp(12px, 2vw, 28px)', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }} {...editableProps(onDataChange, 'title')}>{d.title || ''}</h1>
            : <h1 style={{ fontSize: 'clamp(16px, 3vw, 44px)', fontWeight: 800, letterSpacing: -2, marginBottom: 'clamp(12px, 2vw, 28px)', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }} dangerouslySetInnerHTML={{ __html: hl(d.title || '', accent) }} />
          }
          <div style={{ display: 'flex', gap: 'clamp(4px, 0.8vw, 12px)', flex: 1, alignItems: 'stretch', position: 'relative' }}>
            {(d.steps || []).map((step, i) => {
              const total = (d.steps || []).length;
              return (
                <div key={i} style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  position: 'relative',
                }}>
                  {/* connector line */}
                  {i < total - 1 && (
                    <div style={{
                      position: 'absolute', top: 'clamp(10px, 1.5vw, 22px)',
                      left: '50%', right: '-50%', height: 2,
                      background: `linear-gradient(to right, ${accent}66, ${accent}22)`, zIndex: 0,
                    }} />
                  )}
                  {/* stage dot */}
                  <div style={{
                    width: 'clamp(20px, 3vw, 44px)', height: 'clamp(20px, 3vw, 44px)',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 'clamp(8px, 1vw, 14px)', fontWeight: 800, zIndex: 1,
                    background: step.highlight ? accent : `${accent}22`,
                    color: step.highlight ? '#fff' : accent,
                    boxShadow: step.highlight ? `0 0 20px ${accent}44, 0 0 40px ${accent}22` : 'none',
                  }}>{step.stage}</div>
                  {/* content card */}
                  <div style={{
                    marginTop: 'clamp(6px, 1vw, 14px)', textAlign: 'center', flex: 1,
                    background: step.highlight ? `${accent}14` : `${accent}08`,
                    border: `1px solid ${step.highlight ? `${accent}44` : `${accent}1a`}`,
                    borderRadius: 10, padding: 'clamp(6px, 1vw, 14px)',
                    backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                    boxShadow: step.highlight ? `0 0 24px ${accent}1a` : 'none',
                  }}>
                    <div style={{ fontSize: 'clamp(8px, 1.2vw, 16px)', fontWeight: 700, color: accent, marginBottom: 4, textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>{step.title}</div>
                    <div style={{ fontSize: 'clamp(7px, 0.9vw, 12px)', lineHeight: 1.5, fontWeight: 500 }}>{step.detail}</div>
                    {step.metric && <div style={{ fontSize: 'clamp(10px, 1.5vw, 20px)', fontWeight: 800, color: accent, marginTop: 6, textShadow: `0 0 20px ${accent}33` }}>{step.metric}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );

    case 'stats':
      return (
        <div style={{ padding: '7%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Tag text={d.tag} accent={accent} />
          {onDataChange
            ? <h1 style={{ fontSize: 'clamp(16px, 3vw, 44px)', fontWeight: 800, letterSpacing: -2, marginBottom: 'clamp(12px, 2vw, 28px)', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }} {...editableProps(onDataChange, 'title')}>{d.title || ''}</h1>
            : <h1 style={{ fontSize: 'clamp(16px, 3vw, 44px)', fontWeight: 800, letterSpacing: -2, marginBottom: 'clamp(12px, 2vw, 28px)', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }} dangerouslySetInnerHTML={{ __html: hl(d.title || '', accent) }} />
          }
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min((d.metrics || []).length, 3)}, 1fr)`, gap: 'clamp(8px, 1.5vw, 20px)', flex: 1, alignContent: 'center' }}>
            {(d.metrics || []).map((m, i) => (
              <div key={i} style={{
                background: `${accent}0a`, border: `1px solid ${accent}22`, borderRadius: 14,
                padding: 'clamp(14px, 2.5vw, 36px)', textAlign: 'center',
                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              }}>
                <div style={{ fontSize: 'clamp(20px, 4vw, 56px)', fontWeight: 800, letterSpacing: -2, color: accent, lineHeight: 1, textShadow: `0 0 60px ${accent}66, 0 4px 20px ${accent}40, 0 2px 12px rgba(0,0,0,0.3)` }}>{m.value}</div>
                <div style={{ fontSize: 'clamp(7px, 0.9vw, 13px)', fontWeight: 700, letterSpacing: 3, color: kv.secondaryColor, marginTop: 'clamp(6px, 1vw, 14px)' }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'video':
      return (
        <div style={{ padding: '7%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Tag text={d.tag} accent={accent} />
          {onDataChange
            ? <h1 style={{ fontSize: 'clamp(16px, 3vw, 44px)', fontWeight: 800, letterSpacing: -2, marginBottom: 'clamp(12px, 2vw, 24px)', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }} {...editableProps(onDataChange, 'title')}>{d.title || ''}</h1>
            : <h1 style={{ fontSize: 'clamp(16px, 3vw, 44px)', fontWeight: 800, letterSpacing: -2, marginBottom: 'clamp(12px, 2vw, 24px)', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }} dangerouslySetInnerHTML={{ __html: hl(d.title || '', accent) }} />
          }
          <div style={{
            flex: 1, borderRadius: 14, overflow: 'hidden',
            background: `${accent}08`, border: `1px solid ${accent}22`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {d.videoUrl ? (
              <iframe
                src={d.videoUrl}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="autoplay; encrypted-media"
                allowFullScreen
                title="video"
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: kv.secondaryColor }}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                <div style={{ fontSize: 'clamp(8px, 1vw, 13px)', fontWeight: 600, letterSpacing: 2 }}>VIDEO</div>
              </div>
            )}
          </div>
        </div>
      );

    case 'blank':
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }} />
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
      {slide.backgroundVideo && (
        <video
          src={slide.backgroundVideo}
          autoPlay loop muted playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, pointerEvents: 'none' }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
        {templateContent}
      </div>
      <OverlayLayer overlays={overlays} onDataChange={onDataChange} containerRef={cRef} />
    </div>
  );
}
