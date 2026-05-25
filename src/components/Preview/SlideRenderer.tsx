import type { Slide, KeyVisual, TemplateData } from '@/types';

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
      const raw = isMultiline
        ? e.currentTarget.innerText
        : e.currentTarget.textContent || '';
      onDataChange({ [field]: raw } as Partial<TemplateData>);
    },
  };
}

export interface SlideRendererProps {
  slide: Slide;
  kv: KeyVisual;
  onDataChange?: (patch: Partial<TemplateData>) => void;
}

export function SlideRenderer({ slide, kv, onDataChange }: SlideRendererProps) {
  const d = slide.data;
  const accent = kv.accentColor;

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
          <div style={{ fontSize: 'clamp(8px, 1vw, 13px)', fontWeight: 700, letterSpacing: 6, color: 'rgba(255,255,255,.35)' }} {...editableProps(onDataChange, 'subtitle')}>{d.subtitle}</div>
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

    case 'two-column':
      return (
        <div style={{ padding: '7%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Tag text={d.tag} accent={accent} />
          {onDataChange
            ? <h1 style={{ fontSize: 'clamp(16px, 3.5vw, 56px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: -2, marginBottom: 'clamp(8px, 2vw, 28px)' }} {...editableProps(onDataChange, 'title')}>{d.title || ''}</h1>
            : <h1 style={{ fontSize: 'clamp(16px, 3.5vw, 56px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: -2, marginBottom: 'clamp(8px, 2vw, 28px)' }} dangerouslySetInnerHTML={{ __html: hl(d.title || '', accent) }} />
          }
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(8px, 2vw, 32px)', flex: 1 }}>
            {([{ title: d.leftTitle, body: d.leftBody, titleKey: 'leftTitle' as const, bodyKey: 'leftBody' as const }, { title: d.rightTitle, body: d.rightBody, titleKey: 'rightTitle' as const, bodyKey: 'rightBody' as const }]).map((col, i) => (
              <div key={i} style={{ padding: 'clamp(10px, 2vw, 28px)', border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.02)', borderRadius: 4, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: 50, height: 3, background: accent }} />
                {onDataChange
                  ? <h3 style={{ fontSize: 'clamp(12px, 2vw, 28px)', fontWeight: 800, marginBottom: 'clamp(4px, 1vw, 14px)' }} {...editableProps(onDataChange, col.titleKey)}>{col.title || ''}</h3>
                  : <h3 style={{ fontSize: 'clamp(12px, 2vw, 28px)', fontWeight: 800, marginBottom: 'clamp(4px, 1vw, 14px)' }} dangerouslySetInnerHTML={{ __html: hl(col.title || '', accent) }} />
                }
                {onDataChange
                  ? <p style={{ fontSize: 'clamp(8px, 1.2vw, 18px)', lineHeight: 1.6, fontWeight: 500, whiteSpace: 'pre-wrap' }} {...editableProps(onDataChange, col.bodyKey, true)}>{col.body || ''}</p>
                  : <p style={{ fontSize: 'clamp(8px, 1.2vw, 18px)', lineHeight: 1.6, fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: nlbr(col.body || '', accent) }} />
                }
              </div>
            ))}
          </div>
        </div>
      );

    case 'comparison':
      return (
        <div style={{ padding: '7%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Tag text={d.tag} accent={accent} />
          {onDataChange
            ? <h1 style={{ fontSize: 'clamp(16px, 3.5vw, 56px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: -2, marginBottom: 'clamp(8px, 2vw, 24px)' }} {...editableProps(onDataChange, 'title')}>{d.title || ''}</h1>
            : <h1 style={{ fontSize: 'clamp(16px, 3.5vw, 56px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: -2, marginBottom: 'clamp(8px, 2vw, 24px)' }} dangerouslySetInnerHTML={{ __html: hl(d.title || '', accent) }} />
          }
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(8px, 2vw, 28px)', flex: 1 }}>
            {(['left', 'right'] as const).map((side) => {
              const isWin = d.winner === side;
              const labelKey = side === 'left' ? 'leftLabel' as const : 'rightLabel' as const;
              const contentKey = side === 'left' ? 'leftContent' as const : 'rightContent' as const;
              const metricValueKey = side === 'left' ? 'leftMetricValue' as const : 'rightMetricValue' as const;
              const metricLabelKey = side === 'left' ? 'leftMetricLabel' as const : 'rightMetricLabel' as const;
              return (
                <div key={side} style={{
                  padding: 'clamp(10px, 2vw, 30px)', border: `1px solid ${isWin ? accent : 'rgba(255,255,255,.12)'}`,
                  background: isWin ? `${accent}0f` : 'rgba(255,255,255,.02)',
                  borderRadius: 4, display: 'flex', flexDirection: 'column',
                  boxShadow: isWin ? `0 0 30px ${accent}1f` : 'none',
                }}>
                  <div style={{ fontSize: 'clamp(8px, 1vw, 13px)', fontWeight: 700, letterSpacing: 4, color: isWin ? accent : 'inherit', marginBottom: 'clamp(6px, 1vw, 16px)' }} {...editableProps(onDataChange, labelKey)}>{side === 'left' ? d.leftLabel : d.rightLabel}</div>
                  {onDataChange
                    ? <div style={{ fontSize: 'clamp(10px, 1.5vw, 20px)', lineHeight: 1.5, fontWeight: 600, flex: 1 }} {...editableProps(onDataChange, contentKey, true)}>{(side === 'left' ? d.leftContent : d.rightContent) || ''}</div>
                    : <div style={{ fontSize: 'clamp(10px, 1.5vw, 20px)', lineHeight: 1.5, fontWeight: 600, flex: 1 }} dangerouslySetInnerHTML={{ __html: hl((side === 'left' ? d.leftContent : d.rightContent) || '', accent) }} />
                  }
                  <div style={{ marginTop: 'clamp(6px, 1vw, 20px)', paddingTop: 'clamp(4px, 1vw, 16px)', borderTop: '1px solid rgba(255,255,255,.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 'clamp(16px, 3vw, 42px)', fontWeight: 800, color: isWin ? accent : 'inherit' }} {...editableProps(onDataChange, metricValueKey)}>{side === 'left' ? d.leftMetricValue : d.rightMetricValue}</span>
                    <span style={{ fontSize: 'clamp(7px, .8vw, 12px)', fontWeight: 700, letterSpacing: 2 }} {...editableProps(onDataChange, metricLabelKey)}>{side === 'left' ? d.leftMetricLabel : d.rightMetricLabel}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );

    case 'metrics':
      return (
        <div style={{ padding: '7%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Tag text={d.tag} accent={accent} />
          {onDataChange
            ? <h1 style={{ fontSize: 'clamp(16px, 3.5vw, 56px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: -2 }} {...editableProps(onDataChange, 'title')}>{d.title || ''}</h1>
            : <h1 style={{ fontSize: 'clamp(16px, 3.5vw, 56px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: -2 }} dangerouslySetInnerHTML={{ __html: hl(d.title || '', accent) }} />
          }
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
          {onDataChange
            ? <blockquote style={{ fontSize: 'clamp(16px, 4vw, 60px)', fontWeight: 800, lineHeight: 1.25, textAlign: 'center', letterSpacing: -2, maxWidth: 1000 }} {...editableProps(onDataChange, 'quote', true)}>{d.quote || ''}</blockquote>
            : <blockquote style={{ fontSize: 'clamp(16px, 4vw, 60px)', fontWeight: 800, lineHeight: 1.25, textAlign: 'center', letterSpacing: -2, maxWidth: 1000 }} dangerouslySetInnerHTML={{ __html: hl(d.quote || '', accent) }} />
          }
          {d.attribution && <div style={{ marginTop: 'clamp(12px, 2vw, 36px)', fontSize: 'clamp(8px, 1vw, 16px)', fontWeight: 600, color: kv.secondaryColor, letterSpacing: 3 }} {...editableProps(onDataChange, 'attribution')}>{d.attribution}</div>}
        </div>
      );

    case 'image-text': {
      const imgFirst = d.imagePosition !== 'right';
      return (
        <div style={{ padding: '7%', height: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(12px, 3vw, 48px)', alignItems: 'center', direction: imgFirst ? undefined : 'rtl' }}>
          <div style={{ width: '100%', aspectRatio: '4/3', border: `1px solid ${accent}40`, background: 'linear-gradient(135deg,rgba(15,6,0,.8),rgba(0,0,0,.6))', borderRadius: 4, overflow: 'hidden', direction: 'ltr' }}>
            {d.imageUrl ? <img src={d.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.2)', fontSize: 'clamp(8px, 1vw, 14px)' }}>IMAGE</div>}
          </div>
          <div style={{ direction: 'ltr' }}>
            <Tag text={d.tag} accent={accent} />
            {onDataChange
              ? <h3 style={{ fontSize: 'clamp(14px, 2.5vw, 38px)', fontWeight: 800, lineHeight: 1.2, marginBottom: 'clamp(6px, 1.2vw, 18px)' }} {...editableProps(onDataChange, 'title')}>{d.title || ''}</h3>
              : <h3 style={{ fontSize: 'clamp(14px, 2.5vw, 38px)', fontWeight: 800, lineHeight: 1.2, marginBottom: 'clamp(6px, 1.2vw, 18px)' }} dangerouslySetInnerHTML={{ __html: hl(d.title || '', accent) }} />
            }
            {onDataChange
              ? <p style={{ fontSize: 'clamp(8px, 1.2vw, 20px)', lineHeight: 1.65, fontWeight: 500, whiteSpace: 'pre-wrap' }} {...editableProps(onDataChange, 'body', true)}>{d.body || ''}</p>
              : <p style={{ fontSize: 'clamp(8px, 1.2vw, 20px)', lineHeight: 1.65, fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: nlbr(d.body || '', accent) }} />
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
            ? <h1 style={{ fontSize: 'clamp(16px, 3.5vw, 56px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: -2, marginBottom: 'clamp(8px, 1.5vw, 24px)' }} {...editableProps(onDataChange, 'title')}>{d.title || ''}</h1>
            : <h1 style={{ fontSize: 'clamp(16px, 3.5vw, 56px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: -2, marginBottom: 'clamp(8px, 1.5vw, 24px)' }} dangerouslySetInnerHTML={{ __html: hl(d.title || '', accent) }} />
          }
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min((d.cards || []).length, 4)}, 1fr)`, gap: 'clamp(6px, 1.5vw, 20px)', flex: 1 }}>
            {(d.cards || []).map((c, i) => (
              <div key={i} style={{
                padding: 'clamp(8px, 1.5vw, 26px)', border: `1px solid ${c.highlight ? accent : 'rgba(255,255,255,.1)'}`,
                background: c.highlight ? `${accent}0f` : 'rgba(255,255,255,.02)',
                borderRadius: 4, position: 'relative',
                boxShadow: c.highlight ? `0 0 30px ${accent}15` : 'none',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 3, background: accent, opacity: c.highlight ? 1 : .3 }} />
                <h4 style={{ fontSize: 'clamp(10px, 1.5vw, 22px)', fontWeight: 800, lineHeight: 1.25, marginBottom: 'clamp(4px, .8vw, 10px)' }} dangerouslySetInnerHTML={{ __html: hl(c.title, accent) }} />
                <p style={{ fontSize: 'clamp(7px, 1vw, 15px)', lineHeight: 1.6, fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: nlbr(c.body, accent) }} />
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
            ? <h1 style={{ fontSize: 'clamp(16px, 3.5vw, 56px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: -2, marginBottom: 'clamp(8px, 1.5vw, 24px)' }} {...editableProps(onDataChange, 'title')}>{d.title || ''}</h1>
            : <h1 style={{ fontSize: 'clamp(16px, 3.5vw, 56px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: -2, marginBottom: 'clamp(8px, 1.5vw, 24px)' }} dangerouslySetInnerHTML={{ __html: hl(d.title || '', accent) }} />
          }
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min((d.steps || []).length, 4)}, 1fr)`, gap: 'clamp(6px, 1.5vw, 20px)', flex: 1 }}>
            {(d.steps || []).map((step, i) => (
              <div key={i} style={{
                padding: 'clamp(8px, 1.5vw, 26px)', border: `1px solid ${step.highlight ? accent : 'rgba(255,255,255,.1)'}`,
                background: step.highlight ? `${accent}0f` : 'rgba(255,255,255,.02)',
                borderRadius: 4, position: 'relative', display: 'flex', flexDirection: 'column',
                boxShadow: step.highlight ? `0 0 30px ${accent}15` : 'none',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 3, background: accent, opacity: step.highlight ? 1 : .3 }} />
                <div style={{ fontSize: 'clamp(7px, .9vw, 11px)', fontWeight: 700, letterSpacing: 3, color: accent, marginBottom: 'clamp(4px, .6vw, 8px)' }}>{step.stage}</div>
                <h4 style={{ fontSize: 'clamp(10px, 1.5vw, 22px)', fontWeight: 800, lineHeight: 1.25, marginBottom: 'clamp(4px, .8vw, 10px)' }} dangerouslySetInnerHTML={{ __html: hl(step.title, accent) }} />
                <p style={{ fontSize: 'clamp(7px, 1vw, 15px)', lineHeight: 1.6, fontWeight: 500, flex: 1 }} dangerouslySetInnerHTML={{ __html: nlbr(step.detail, accent) }} />
                {step.metric && <div style={{ fontSize: 'clamp(10px, 1.4vw, 20px)', fontWeight: 800, color: accent, marginTop: 'clamp(4px, .8vw, 12px)', paddingTop: 'clamp(4px, .6vw, 10px)', borderTop: '1px solid rgba(255,255,255,.15)' }}>{step.metric}</div>}
              </div>
            ))}
          </div>
        </div>
      );

    case 'big-number':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 'clamp(8px, 1.5vw, 20px)', padding: '0 10%' }}>
          {d.subtitle && (onDataChange
            ? <div style={{ fontSize: 'clamp(8px, 1vw, 13px)', fontWeight: 700, letterSpacing: 6, color: 'rgba(255,255,255,.35)' }} {...editableProps(onDataChange, 'subtitle')}>{d.subtitle}</div>
            : <div style={{ fontSize: 'clamp(8px, 1vw, 13px)', fontWeight: 700, letterSpacing: 6, color: 'rgba(255,255,255,.35)' }}>{d.subtitle}</div>
          )}
          <div style={{ fontSize: 'clamp(48px, 12vw, 180px)', fontWeight: 900, letterSpacing: -6, color: accent, lineHeight: .9, textShadow: `0 0 80px ${accent}66` }} {...editableProps(onDataChange, 'number')}>{d.number}</div>
          <div style={{ width: 1, height: 'clamp(10px, 2vw, 30px)', background: `linear-gradient(to bottom, ${accent}, transparent)` }} />
          {onDataChange
            ? <div style={{ fontSize: 'clamp(18px, 4vw, 60px)', fontWeight: 800, letterSpacing: -2, textAlign: 'center' }} {...editableProps(onDataChange, 'title')}>{d.title || ''}</div>
            : <div style={{ fontSize: 'clamp(18px, 4vw, 60px)', fontWeight: 800, letterSpacing: -2, textAlign: 'center' }} dangerouslySetInnerHTML={{ __html: hl(d.title || '', accent) }} />
          }
          {d.body && (onDataChange
            ? <p style={{ fontSize: 'clamp(10px, 1.5vw, 22px)', lineHeight: 1.7, fontWeight: 500, textAlign: 'center', maxWidth: '70%', whiteSpace: 'pre-wrap' }} {...editableProps(onDataChange, 'body', true)}>{d.body}</p>
            : <p style={{ fontSize: 'clamp(10px, 1.5vw, 22px)', lineHeight: 1.7, fontWeight: 500, textAlign: 'center', maxWidth: '70%' }} dangerouslySetInnerHTML={{ __html: nlbr(d.body, accent) }} />
          )}
        </div>
      );

    case 'stats':
      return (
        <div style={{ padding: '7%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Tag text={d.tag} accent={accent} />
          {onDataChange
            ? <h1 style={{ fontSize: 'clamp(16px, 3.5vw, 56px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: -2 }} {...editableProps(onDataChange, 'title')}>{d.title || ''}</h1>
            : <h1 style={{ fontSize: 'clamp(16px, 3.5vw, 56px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: -2 }} dangerouslySetInnerHTML={{ __html: hl(d.title || '', accent) }} />
          }
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(16px, 4vw, 60px)', alignItems: 'center', marginTop: 'clamp(12px, 2vw, 32px)' }}>
            {(d.metrics || []).map((m, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(24px, 5vw, 80px)', fontWeight: 800, letterSpacing: -3, color: accent, lineHeight: 1, textShadow: `0 0 40px ${accent}40` }}>{m.value}</div>
                <div style={{ fontSize: 'clamp(7px, 1vw, 16px)', fontWeight: 700, letterSpacing: 3, color: kv.secondaryColor, marginTop: 12 }}>{m.label}</div>
              </div>
            ))}
          </div>
          {d.body && (onDataChange
            ? <p style={{ fontSize: 'clamp(10px, 1.6vw, 24px)', lineHeight: 1.7, fontWeight: 500, marginTop: 'clamp(12px, 2vw, 32px)', maxWidth: '70%', whiteSpace: 'pre-wrap' }} {...editableProps(onDataChange, 'body', true)}>{d.body}</p>
            : <p style={{ fontSize: 'clamp(10px, 1.6vw, 24px)', lineHeight: 1.7, fontWeight: 500, marginTop: 'clamp(12px, 2vw, 32px)', maxWidth: '70%' }} dangerouslySetInnerHTML={{ __html: nlbr(d.body, accent) }} />
          )}
        </div>
      );

    case 'video':
      return (
        <div style={{ padding: '7%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Tag text={d.tag} accent={accent} />
          {onDataChange
            ? <h1 style={{ fontSize: 'clamp(16px, 3.5vw, 56px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: -2, marginBottom: 'clamp(8px, 1.5vw, 24px)' }} {...editableProps(onDataChange, 'title')}>{d.title || ''}</h1>
            : <h1 style={{ fontSize: 'clamp(16px, 3.5vw, 56px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: -2, marginBottom: 'clamp(8px, 1.5vw, 24px)' }} dangerouslySetInnerHTML={{ __html: hl(d.title || '', accent) }} />
          }
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {d.videoUrl ? (
              <video src={d.videoUrl} controls style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 4, border: `1px solid ${accent}40` }} />
            ) : (
              <div style={{ width: '80%', aspectRatio: '16/9', border: `1px solid ${accent}40`, background: 'linear-gradient(135deg,rgba(15,6,0,.8),rgba(0,0,0,.6))', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 'clamp(24px, 4vw, 60px)', color: `${accent}66` }}>&#x25B6;</div>
              </div>
            )}
          </div>
          {d.body && (onDataChange
            ? <p style={{ fontSize: 'clamp(9px, 1.2vw, 18px)', lineHeight: 1.6, fontWeight: 500, marginTop: 'clamp(6px, 1vw, 16px)', textAlign: 'center', whiteSpace: 'pre-wrap' }} {...editableProps(onDataChange, 'body', true)}>{d.body}</p>
            : <p style={{ fontSize: 'clamp(9px, 1.2vw, 18px)', lineHeight: 1.6, fontWeight: 500, marginTop: 'clamp(6px, 1vw, 16px)', textAlign: 'center' }} dangerouslySetInnerHTML={{ __html: nlbr(d.body, accent) }} />
          )}
        </div>
      );

    case 'outro':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 'clamp(8px, 1.5vw, 24px)', padding: '0 10%' }}>
          {d.logoUrl && <img src={d.logoUrl} alt="" style={{ height: 'clamp(32px, 5vw, 80px)', objectFit: 'contain', marginBottom: 'clamp(4px, 1vw, 16px)' }} />}
          {onDataChange
            ? <h1 style={{ fontSize: 'clamp(28px, 6vw, 90px)', fontWeight: 900, letterSpacing: -3, textAlign: 'center', lineHeight: 1.1 }} {...editableProps(onDataChange, 'title')}>{d.title || 'Thank You'}</h1>
            : <h1 style={{ fontSize: 'clamp(28px, 6vw, 90px)', fontWeight: 900, letterSpacing: -3, textAlign: 'center', lineHeight: 1.1 }} dangerouslySetInnerHTML={{ __html: hl(d.title || 'Thank You', accent) }} />
          }
          {d.subtitle && (onDataChange
            ? <p style={{ fontSize: 'clamp(10px, 1.5vw, 22px)', fontWeight: 600, letterSpacing: 4, color: kv.secondaryColor, textAlign: 'center' }} {...editableProps(onDataChange, 'subtitle')}>{d.subtitle}</p>
            : <p style={{ fontSize: 'clamp(10px, 1.5vw, 22px)', fontWeight: 600, letterSpacing: 4, color: kv.secondaryColor, textAlign: 'center' }}>{d.subtitle}</p>
          )}
          <div style={{ width: 60, height: 1, background: `${accent}66`, marginTop: 'clamp(4px, .5vw, 8px)', marginBottom: 'clamp(4px, .5vw, 8px)' }} />
          {d.contactInfo && (onDataChange
            ? <p style={{ fontSize: 'clamp(9px, 1.2vw, 18px)', lineHeight: 1.8, fontWeight: 500, textAlign: 'center', color: kv.secondaryColor, whiteSpace: 'pre-wrap' }} {...editableProps(onDataChange, 'contactInfo', true)}>{d.contactInfo}</p>
            : <p style={{ fontSize: 'clamp(9px, 1.2vw, 18px)', lineHeight: 1.8, fontWeight: 500, textAlign: 'center', color: kv.secondaryColor }} dangerouslySetInnerHTML={{ __html: nlbr(d.contactInfo, accent) }} />
          )}
        </div>
      );

    case 'blank':
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: .5 }}>
          <h2 style={{ fontSize: 'clamp(14px, 2vw, 32px)' }}>{slide.label}</h2>
        </div>
      );
  }
}
