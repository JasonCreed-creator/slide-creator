import { useRef, useState, useEffect } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { BackgroundRenderer } from '@/components/Effects';
import type { Slide } from '@/types';

function renderBoldText(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

function TitleSlideContent({ data, kv }: { data: Record<string, unknown>; kv: { accentColor: string; primaryColor: string; secondaryColor: string } }) {
  const tag = (data.tag as string) || '';
  const title = (data.title as string) || '';
  const subtitle = (data.subtitle as string) || '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '5%', textAlign: 'center' }}>
      {tag && (
        <div style={{ padding: '8px 24px', border: `2px solid ${kv.accentColor}`, borderRadius: 6, color: kv.accentColor, fontSize: 18, fontWeight: 700, letterSpacing: '0.15em', marginBottom: 40 }}>
          {tag}
        </div>
      )}
      <h1 style={{ fontSize: 64, fontWeight: 800, color: kv.primaryColor, lineHeight: 1.2, marginBottom: 20, letterSpacing: '-0.02em' }}>
        {renderBoldText(title)}
      </h1>
      {subtitle && (
        <p style={{ fontSize: 24, color: kv.secondaryColor, fontWeight: 400 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function ComparisonSlideContent({ data, kv }: { data: Record<string, unknown>; kv: { accentColor: string; primaryColor: string; secondaryColor: string } }) {
  const tag = (data.tag as string) || '';
  const title = (data.title as string) || '';
  const aLabel = (data.aLabel as string) || 'A';
  const bLabel = (data.bLabel as string) || 'B';
  const winner = (data.winner as string) || 'none';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '4%' }}>
      {tag && (
        <div style={{ fontSize: 16, fontWeight: 700, color: kv.accentColor, letterSpacing: '0.2em', marginBottom: 16 }}>
          {tag}
        </div>
      )}
      <h2 style={{ fontSize: 48, fontWeight: 800, color: kv.primaryColor, textAlign: 'center', marginBottom: 40, letterSpacing: '-0.02em' }}>
        {title}
      </h2>
      <div style={{ display: 'flex', flex: 1, gap: 20 }}>
        <div style={{
          flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.08)', padding: '24px', display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: kv.primaryColor }}>{aLabel}</span>
        </div>
        <div style={{
          flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 12,
          border: `1px solid ${winner === 'B' ? kv.accentColor : 'rgba(255,255,255,0.08)'}`,
          padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', position: 'relative',
        }}>
          {winner === 'B' && (
            <span style={{
              position: 'absolute', top: 12, right: 12, background: kv.accentColor,
              color: '#000', padding: '4px 12px', borderRadius: 4, fontSize: 12, fontWeight: 700,
            }}>WIN</span>
          )}
          <span style={{ fontSize: 28, fontWeight: 700, color: kv.primaryColor }}>{bLabel}</span>
        </div>
      </div>
    </div>
  );
}

function ContentSlideContent({ data, kv }: { data: Record<string, unknown>; kv: { accentColor: string; primaryColor: string; secondaryColor: string } }) {
  const tag = (data.tag as string) || '';
  const title = (data.title as string) || '';
  const body = (data.body as string) || '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '5%' }}>
      {tag && (
        <div style={{ fontSize: 14, fontWeight: 700, color: kv.accentColor, letterSpacing: '0.15em', marginBottom: 12 }}>
          {tag}
        </div>
      )}
      <h2 style={{ fontSize: 44, fontWeight: 800, color: kv.primaryColor, marginBottom: 24, letterSpacing: '-0.02em' }}>
        {title}
      </h2>
      <div style={{ fontSize: 22, color: kv.secondaryColor, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
        {renderBoldText(body)}
      </div>
    </div>
  );
}

function QuoteSlideContent({ data, kv }: { data: Record<string, unknown>; kv: { accentColor: string; primaryColor: string; secondaryColor: string } }) {
  const quote = (data.quote as string) || '';
  const author = (data.author as string) || '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '8%', textAlign: 'center' }}>
      <div style={{ fontSize: 80, color: kv.accentColor, lineHeight: 1, marginBottom: 16, opacity: 0.4 }}>"</div>
      <p style={{ fontSize: 36, fontWeight: 600, color: kv.primaryColor, lineHeight: 1.5, fontStyle: 'italic', marginBottom: 32 }}>
        {quote}
      </p>
      {author && (
        <p style={{ fontSize: 20, color: kv.secondaryColor }}>— {author}</p>
      )}
    </div>
  );
}

function StatsSlideContent({ data, kv }: { data: Record<string, unknown>; kv: { accentColor: string; primaryColor: string; secondaryColor: string } }) {
  const tag = (data.tag as string) || '';
  const title = (data.title as string) || '';
  const items = (data.items as { value: string; label: string }[]) || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '5%' }}>
      {tag && (
        <div style={{ fontSize: 14, fontWeight: 700, color: kv.accentColor, letterSpacing: '0.15em', marginBottom: 12 }}>
          {tag}
        </div>
      )}
      <h2 style={{ fontSize: 44, fontWeight: 800, color: kv.primaryColor, marginBottom: 40, letterSpacing: '-0.02em' }}>
        {title}
      </h2>
      <div style={{ display: 'flex', flex: 1, gap: 20, alignItems: 'center', justifyContent: 'center' }}>
        {items.map((item, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', padding: 20, background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: kv.accentColor, marginBottom: 8 }}>{item.value}</div>
            <div style={{ fontSize: 16, color: kv.secondaryColor }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideContentRenderer({ slide }: { slide: Slide }) {
  const kv = useProjectStore((s) => s.project.keyVisual);
  const colors = { accentColor: kv.accentColor, primaryColor: kv.primaryColor, secondaryColor: kv.secondaryColor };

  switch (slide.template) {
    case 'title':
      return <TitleSlideContent data={slide.templateData} kv={colors} />;
    case 'comparison':
      return <ComparisonSlideContent data={slide.templateData} kv={colors} />;
    case 'content':
      return <ContentSlideContent data={slide.templateData} kv={colors} />;
    case 'quote':
      return <QuoteSlideContent data={slide.templateData} kv={colors} />;
    case 'stats':
      return <StatsSlideContent data={slide.templateData} kv={colors} />;
    case 'image-full':
      return <ContentSlideContent data={slide.templateData} kv={colors} />;
    case 'blank':
      return null;
  }
}

export function LivePreview({ slide }: { slide: Slide | null }) {
  const project = useProjectStore((s) => s.project);
  const kv = project.keyVisual;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const slideW = project.screen.widthPx;
  const slideH = project.screen.heightPx;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const update = () => {
      const rect = container.getBoundingClientRect();
      const scaleX = rect.width / slideW;
      const scaleY = rect.height / slideH;
      setScale(Math.min(scaleX, scaleY));
    };

    const ro = new ResizeObserver(update);
    ro.observe(container);
    update();
    return () => ro.disconnect();
  }, [slideW, slideH]);

  const bg = slide?.backgroundColor === '__theme__' || !slide?.backgroundColor
    ? (kv.gradientCss || kv.backgroundColor)
    : slide.backgroundColor;

  const effect = slide?.backgroundEffect?.type !== 'none'
    ? slide?.backgroundEffect
    : kv.backgroundEffect;

  return (
    <div className="live-preview-panel">
      <div className="live-preview-header">
        LIVE PREVIEW (드래그로 오브젝트 이동)
      </div>
      <div className="live-preview-container" ref={containerRef}>
        <div
          className="live-preview-slide"
          style={{
            width: slideW,
            height: slideH,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            background: bg,
            color: kv.primaryColor,
            fontFamily: kv.fontFamily,
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          <BackgroundRenderer effect={effect} />
          {project.layout.zones.map((zone) => (
            <div
              key={zone.id}
              style={{
                position: 'absolute',
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: `${zone.width}%`,
                height: `${zone.height}%`,
                border: '1px dashed rgba(255,255,255,0.06)',
              }}
            />
          ))}
          {slide && <SlideContentRenderer slide={slide} />}
          {slide?.overlays.map((ov) => (
            <div
              key={ov.id}
              style={{
                position: 'absolute',
                left: `${ov.x}%`,
                top: `${ov.y}%`,
                width: `${ov.width}%`,
                height: `${ov.height}%`,
                ...Object.fromEntries(Object.entries(ov.style)),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: kv.primaryColor,
                fontSize: 18,
              }}
            >
              {ov.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { SlideContentRenderer };
