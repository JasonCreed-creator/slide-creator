import { useState, useEffect, useCallback, useRef } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import type { Slide, KeyVisual } from '@/types';

function highlightText(text: string, accent: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, `<b style="color:${accent};font-weight:800">$1</b>`);
}

function SlideRenderer({ slide, kv }: { slide: Slide; kv: KeyVisual }) {
  const d = slide.data;
  const accent = kv.accentColor;
  const H = ({ text, size = 56 }: { text: string; size?: number }) => (
    <h1 style={{ fontSize: size, fontWeight: 800, lineHeight: 1.15, letterSpacing: -2 }} dangerouslySetInnerHTML={{ __html: highlightText(text, accent) }} />
  );
  const Tag = ({ text }: { text?: string }) => text ? (
    <div style={{ display: 'inline-block', fontSize: 13, fontWeight: 700, color: accent, letterSpacing: 5, padding: '6px 14px', border: `1px solid ${accent}66`, borderRadius: 2, background: `${accent}0d`, marginBottom: 18 }}>{text}</div>
  ) : null;

  switch (slide.template) {
    case 'title':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '0 7%' }}>
          <Tag text={d.tag} />
          <h1 style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.12, letterSpacing: -3, textAlign: 'center' }} dangerouslySetInnerHTML={{ __html: highlightText(d.title || '', accent) }} />
          {d.subtitle && <p style={{ fontSize: 18, fontWeight: 600, letterSpacing: 4, color: kv.secondaryColor, marginTop: 20, textAlign: 'center' }}>{d.subtitle}</p>}
        </div>
      );

    case 'section-cover':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 6, color: 'rgba(255,255,255,.35)' }}>{d.subtitle}</div>
          <div style={{ fontSize: 80, fontWeight: 900, letterSpacing: -4, color: accent, lineHeight: .9, textShadow: `0 0 60px ${accent}66` }}>{d.number}</div>
          <div style={{ width: 1, height: 40, background: `linear-gradient(to bottom, ${accent}, transparent)` }} />
          <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: -2, textAlign: 'center' }} dangerouslySetInnerHTML={{ __html: highlightText(d.title || '', accent) }} />
        </div>
      );

    case 'content':
      return (
        <div style={{ padding: '7%' }}>
          <Tag text={d.tag} />
          <H text={d.title || ''} />
          <p style={{ fontSize: 22, lineHeight: 1.7, fontWeight: 500, marginTop: 32, maxWidth: '60%' }} dangerouslySetInnerHTML={{ __html: highlightText(d.body || '', accent).replace(/\n/g, '<br>') }} />
        </div>
      );

    case 'two-column':
      return (
        <div style={{ padding: '7%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Tag text={d.tag} />
          <H text={d.title || ''} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 32, flex: 1 }}>
            <div style={{ padding: 28, border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.02)', borderRadius: 4, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 50, height: 3, background: accent }} />
              <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 14 }} dangerouslySetInnerHTML={{ __html: highlightText(d.leftTitle || '', accent) }} />
              <p style={{ fontSize: 18, lineHeight: 1.6, fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: highlightText(d.leftBody || '', accent).replace(/\n/g, '<br>') }} />
            </div>
            <div style={{ padding: 28, border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.02)', borderRadius: 4, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 50, height: 3, background: accent }} />
              <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 14 }} dangerouslySetInnerHTML={{ __html: highlightText(d.rightTitle || '', accent) }} />
              <p style={{ fontSize: 18, lineHeight: 1.6, fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: highlightText(d.rightBody || '', accent).replace(/\n/g, '<br>') }} />
            </div>
          </div>
        </div>
      );

    case 'comparison':
      return (
        <div style={{ padding: '7%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Tag text={d.tag} />
          <H text={d.title || ''} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginTop: 28, flex: 1 }}>
            {['left', 'right'].map((side) => {
              const isWin = d.winner === side;
              const label = side === 'left' ? d.leftLabel : d.rightLabel;
              const content = side === 'left' ? d.leftContent : d.rightContent;
              const metricV = side === 'left' ? d.leftMetricValue : d.rightMetricValue;
              const metricL = side === 'left' ? d.leftMetricLabel : d.rightMetricLabel;
              return (
                <div key={side} style={{
                  padding: 30, border: `1px solid ${isWin ? accent : 'rgba(255,255,255,.12)'}`,
                  background: isWin ? `${accent}0f` : 'rgba(255,255,255,.02)',
                  borderRadius: 4, display: 'flex', flexDirection: 'column',
                  boxShadow: isWin ? `0 0 30px ${accent}1f` : 'none',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 4, color: isWin ? accent : 'inherit', marginBottom: 16 }}>{label}</div>
                  <div style={{ fontSize: 20, lineHeight: 1.5, fontWeight: 600, flex: 1 }} dangerouslySetInnerHTML={{ __html: highlightText(content || '', accent) }} />
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 42, fontWeight: 800, color: isWin ? accent : 'inherit' }}>{metricV}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>{metricL}</span>
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
          <Tag text={d.tag} />
          <H text={d.title || ''} />
          <div style={{ display: 'flex', justifyContent: 'center', gap: 60, marginTop: 48, flex: 1, alignItems: 'center' }}>
            {(d.metrics || []).map((m, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: -3, color: accent, lineHeight: 1, textShadow: `0 0 40px ${accent}40` }}>{m.value}</div>
                <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 3, color: kv.secondaryColor, marginTop: 12 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'quote':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '0 10%' }}>
          <Tag text={d.tag} />
          <blockquote style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.25, textAlign: 'center', letterSpacing: -2, maxWidth: 1000 }} dangerouslySetInnerHTML={{ __html: highlightText(d.quote || '', accent) }} />
          {d.attribution && <div style={{ marginTop: 32, fontSize: 16, fontWeight: 600, color: kv.secondaryColor, letterSpacing: 3 }}>{d.attribution}</div>}
        </div>
      );

    case 'image-text': {
      const imgFirst = d.imagePosition !== 'right';
      return (
        <div style={{ padding: '7%', height: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center', direction: imgFirst ? undefined : 'rtl' }}>
          <div style={{ width: '100%', aspectRatio: '4/3', border: `1px solid ${accent}40`, background: 'linear-gradient(135deg,rgba(15,6,0,.8),rgba(0,0,0,.6))', borderRadius: 4, overflow: 'hidden', direction: 'ltr' }}>
            {d.imageUrl && <img src={d.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          <div style={{ direction: 'ltr' }}>
            <Tag text={d.tag} />
            <h3 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.2, marginBottom: 18, letterSpacing: -1 }} dangerouslySetInnerHTML={{ __html: highlightText(d.title || '', accent) }} />
            <p style={{ fontSize: 18, lineHeight: 1.65, fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: highlightText(d.body || '', accent).replace(/\n/g, '<br>') }} />
          </div>
        </div>
      );
    }

    case 'cards':
      return (
        <div style={{ padding: '7%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Tag text={d.tag} />
          <H text={d.title || ''} />
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min((d.cards || []).length, 4)}, 1fr)`, gap: 20, marginTop: 28, flex: 1 }}>
            {(d.cards || []).map((c, i) => (
              <div key={i} style={{
                padding: 26, border: `1px solid ${c.highlight ? accent : 'rgba(255,255,255,.1)'}`,
                background: c.highlight ? `${accent}0f` : 'rgba(255,255,255,.02)',
                borderRadius: 4, position: 'relative',
                boxShadow: c.highlight ? `0 0 30px ${accent}15` : 'none',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 3, background: accent, opacity: c.highlight ? 1 : .3 }} />
                <h4 style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.25, marginBottom: 10 }} dangerouslySetInnerHTML={{ __html: highlightText(c.title, accent) }} />
                <p style={{ fontSize: 15, lineHeight: 1.6, fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: highlightText(c.body, accent).replace(/\n/g, '<br>') }} />
              </div>
            ))}
          </div>
        </div>
      );

    case 'blank':
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: .5 }}>
          <h2>{slide.label}</h2>
        </div>
      );
  }
}

export function SlidePreview() {
  const { project, setEditorStep } = useProjectStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const slides = project.slides;
  const kv = project.keyVisual;
  const hasSlides = slides.length > 0;
  const currentSlide = hasSlides ? slides[currentIndex] : null;

  const go = useCallback((i: number) => {
    if (i < 0 || i >= slides.length) return;
    setCurrentIndex(i);
    setElapsed(0);
  }, [slides.length]);

  const goNext = useCallback(() => go(currentIndex < slides.length - 1 ? currentIndex + 1 : 0), [currentIndex, slides.length, go]);
  const goPrev = useCallback(() => go(currentIndex > 0 ? currentIndex - 1 : slides.length - 1), [currentIndex, slides.length, go]);

  useEffect(() => {
    if (!isPlaying || !hasSlides) return;
    const duration = slides[currentIndex]?.duration ?? 5000;
    setElapsed(0);
    const start = Date.now();
    const interval = setInterval(() => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      setElapsed(progress);
      if (progress >= 1) { clearInterval(interval); goNext(); }
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, hasSlides, slides, goNext]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev();
      if (e.key === ' ') { e.preventDefault(); setIsPlaying((p) => !p); }
      if (e.key === 'Escape') { if (isFullscreen) document.exitFullscreen?.(); else setEditorStep('slides'); }
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, setEditorStep, isFullscreen]);

  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    document.fullscreenElement ? document.exitFullscreen() : containerRef.current.requestFullscreen();
  };

  return (
    <div ref={containerRef} className={`preview-container ${isFullscreen ? 'preview-fullscreen' : ''}`}>
      {!isFullscreen && (
        <div className="preview-toolbar">
          <button className="btn-secondary" onClick={() => setEditorStep('slides')}>&larr; 편집으로</button>
          <div className="preview-info">
            <span className="preview-spec">{kv.name}</span>
          </div>
          <div className="preview-controls">
            <button className="btn-icon" onClick={goPrev} disabled={!hasSlides}>&#x25C0;</button>
            <button className="btn-icon play-btn" onClick={() => setIsPlaying((p) => !p)} disabled={!hasSlides}>{isPlaying ? '⏸' : '▶'}</button>
            <button className="btn-icon" onClick={goNext} disabled={!hasSlides}>&#x25B6;</button>
            {hasSlides && <span className="slide-counter">{currentIndex + 1} / {slides.length}</span>}
            <button className="btn-icon fullscreen-btn" onClick={toggleFullscreen}>&#x26F6;</button>
          </div>
        </div>
      )}

      {hasSlides && (
        <div className="preview-timeline">
          {slides.map((slide, i) => (
            <div key={slide.id} className={`timeline-segment ${i === currentIndex ? 'active' : ''} ${i < currentIndex ? 'done' : ''}`} onClick={() => go(i)} title={slide.label}>
              <div className="timeline-fill" style={{ width: i === currentIndex ? `${elapsed * 100}%` : i < currentIndex ? '100%' : '0%' }} />
              <span className="timeline-label">{i + 1}</span>
            </div>
          ))}
        </div>
      )}

      <div
        className="preview-screen"
        style={{
          aspectRatio: `${project.screen.widthPx} / ${project.screen.heightPx}`,
          background: currentSlide?.backgroundColor || kv.gradientCss || kv.backgroundColor,
          color: kv.primaryColor,
          fontFamily: kv.fontFamily,
        }}
      >
        {hasSlides && currentSlide && <SlideRenderer slide={currentSlide} kv={kv} />}
        {!hasSlides && (
          <div className="preview-empty-overlay">
            <p className="preview-empty-text">슬라이드를 추가하면 여기에 표시됩니다</p>
          </div>
        )}
      </div>

      {isFullscreen && hasSlides && (
        <div className="fullscreen-controls">
          <button className="btn-icon fs-btn" onClick={goPrev}>&#x25C0;</button>
          <button className="btn-icon fs-btn play-btn" onClick={() => setIsPlaying((p) => !p)}>{isPlaying ? '⏸' : '▶'}</button>
          <button className="btn-icon fs-btn" onClick={goNext}>&#x25B6;</button>
          <span className="fs-counter">{currentIndex + 1} / {slides.length}</span>
          <span className="fs-label">{currentSlide?.label}</span>
        </div>
      )}

      {!isFullscreen && (
        <div className="preview-shortcuts">
          <span>&larr; &rarr; 이동</span>
          <span>Space 재생/정지</span>
          <span>F 풀스크린</span>
          <span>Esc 편집으로</span>
        </div>
      )}
    </div>
  );
}
