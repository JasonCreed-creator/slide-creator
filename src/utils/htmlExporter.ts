import type { Project, Slide, KeyVisual, OverlayElement } from '@/types';
import type { BackgroundEffect } from '@/types';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function highlight(text: string, accentColor: string): string {
  return esc(text).replace(/\*\*(.+?)\*\*/g, `<b style="color:${accentColor};font-weight:800">$1</b>`);
}

function nl2br(text: string, accentColor: string): string {
  return highlight(text, accentColor).replace(/\n/g, '<br>');
}

function renderOverlaysHtml(overlays?: OverlayElement[]): string {
  if (!overlays || overlays.length === 0) return '';
  return overlays.map((ov) => {
    const style = `position:absolute;left:${ov.x}%;top:${ov.y}%;width:${ov.width}%;height:${ov.height}%;opacity:${ov.opacity ?? 1};z-index:10;`;
    const animAttr = ov.animation && ov.animation !== 'none' ? ` data-anim="${ov.animation}"` : '';
    const delayAttr = ov.animDelay ? ` data-anim-delay="${ov.animDelay}"` : '';
    const fxMap: Record<string, string> = { float: 'fx-float', 'float-slow': 'fx-float-slow', pulse: 'fx-pulse', glow: 'fx-glow', shimmer: 'fx-shimmer', rotate: 'fx-rotate', breathe: 'fx-breathe' };
    const fxClass = ov.continuousEffect && ov.continuousEffect !== 'none' ? ' ' + (fxMap[ov.continuousEffect] || '') : '';
    if (ov.type === 'text') {
      const fs = ov.fontSize ?? 24;
      const fw = ov.fontWeight ?? 700;
      const color = ov.color ?? '#ffffff';
      return `<div class="sl-overlay anim-item${fxClass}"${animAttr}${delayAttr} style="${style}font-size:${fs}px;font-weight:${fw};color:${color};display:flex;align-items:center;">${esc(ov.content)}</div>`;
    }
    if (ov.type === 'shape') {
      const bg = ov.backgroundColor ?? 'rgba(79,140,255,0.3)';
      const br = ov.borderRadius ?? 8;
      return `<div class="sl-overlay anim-item${fxClass}"${animAttr}${delayAttr} style="${style}background:${bg};border-radius:${br}px;"></div>`;
    }
    if (ov.type === 'image') {
      return `<div class="sl-overlay anim-item${fxClass}"${animAttr}${delayAttr} style="${style}"><img src="${esc(ov.content)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:${ov.borderRadius ?? 0}px;"></div>`;
    }
    return '';
  }).join('\n  ');
}

function renderSlideHtml(slide: Slide, kv: KeyVisual, index: number): string {
  const d = slide.data;
  const accent = kv.accentColor;
  const bg = slide.backgroundColor || '';
  const bgStyle = bg ? `background:${bg};` : '';
  const activeClass = index === 0 ? ' active' : '';
  const transAttr = ` data-transition="${slide.transition || 'fade'}"`;
  const bgEffectAttr = slide.backgroundEffect && slide.backgroundEffect !== 'none' ? ` data-bg-effect="${slide.backgroundEffect}"` : '';
  const overlaysHtml = renderOverlaysHtml(d.overlays);

  const tag = (text?: string) =>
    text ? `<div class="sl-tag anim-item" data-anim="fadeIn">${esc(text)}</div>` : '';

  let body: string;

  switch (slide.template) {
    case 'title':
      body = `<div class="sl-center">
    ${tag(d.tag)}
    <h1 class="sl-hero-title anim-item" data-anim="fadeUp">${highlight(d.title || '', accent)}</h1>
    ${d.subtitle ? `<p class="sl-hero-sub anim-item" data-anim="fadeUp">${highlight(d.subtitle, accent)}</p>` : ''}
  </div>`;
      break;

    case 'section-cover':
      body = `<div class="sl-cover">
    <div class="sl-cover-label anim-item" data-anim="fadeIn">${esc(d.subtitle || '')}</div>
    <div class="sl-cover-num anim-item" data-anim="scaleIn">${esc(d.number || '')}</div>
    <div class="sl-cover-divider anim-item" data-anim="fadeIn"></div>
    <div class="sl-cover-title anim-item" data-anim="fadeUp">${highlight(d.title || '', accent)}</div>
  </div>`;
      break;

    case 'content':
      body = `<div class="sl-title-area">
    ${tag(d.tag)}
    <h1 class="sl-heading anim-item" data-anim="fadeUp">${highlight(d.title || '', accent)}</h1>
  </div>
  <div class="sl-body-area anim-item" data-anim="fadeUp">
    <p class="sl-body">${nl2br(d.body || '', accent)}</p>
  </div>`;
      break;

    case 'two-column':
      body = `<div class="sl-title-area">
    ${tag(d.tag)}
    <h1 class="sl-heading anim-item" data-anim="fadeUp">${highlight(d.title || '', accent)}</h1>
  </div>
  <div class="sl-two-col">
    <div class="sl-col anim-item" data-anim="fadeLeft">
      <h3>${highlight(d.leftTitle || '', accent)}</h3>
      <p>${nl2br(d.leftBody || '', accent)}</p>
    </div>
    <div class="sl-col anim-item" data-anim="fadeRight">
      <h3>${highlight(d.rightTitle || '', accent)}</h3>
      <p>${nl2br(d.rightBody || '', accent)}</p>
    </div>
  </div>`;
      break;

    case 'comparison':
      body = `<div class="sl-title-area">
    ${tag(d.tag)}
    <h1 class="sl-heading anim-item" data-anim="fadeUp">${highlight(d.title || '', accent)}</h1>
  </div>
  <div class="sl-compare">
    <div class="sl-compare-card${d.winner === 'left' ? ' win' : ''} anim-item" data-anim="fadeLeft">
      <div class="sl-compare-label">${esc(d.leftLabel || '')}</div>
      <div class="sl-compare-msg">${nl2br(d.leftContent || '', accent)}</div>
      <div class="sl-compare-stat">
        <span class="sl-compare-n">${esc(d.leftMetricValue || '')}</span>
        <span class="sl-compare-l">${esc(d.leftMetricLabel || '')}</span>
      </div>
    </div>
    <div class="sl-compare-card${d.winner === 'right' ? ' win' : ''} anim-item" data-anim="fadeRight">
      <div class="sl-compare-label">${esc(d.rightLabel || '')}</div>
      <div class="sl-compare-msg">${nl2br(d.rightContent || '', accent)}</div>
      <div class="sl-compare-stat">
        <span class="sl-compare-n">${esc(d.rightMetricValue || '')}</span>
        <span class="sl-compare-l">${esc(d.rightMetricLabel || '')}</span>
      </div>
    </div>
  </div>`;
      break;

    case 'metrics':
      body = `<div class="sl-title-area">
    ${tag(d.tag)}
    <h1 class="sl-heading anim-item" data-anim="fadeUp">${highlight(d.title || '', accent)}</h1>
  </div>
  <div class="sl-metrics">
    ${(d.metrics || []).map((m) => `
    <div class="sl-metric anim-item" data-anim="scaleIn">
      <div class="sl-metric-value">${esc(m.value)}</div>
      <div class="sl-metric-label">${esc(m.label)}</div>
    </div>`).join('')}
  </div>`;
      break;

    case 'quote':
      body = `<div class="sl-quote-wrap">
    ${tag(d.tag)}
    <blockquote class="sl-quote anim-item" data-anim="fadeUp">${highlight(d.quote || '', accent)}</blockquote>
    ${d.attribution ? `<div class="sl-attribution anim-item" data-anim="fadeIn">${esc(d.attribution)}</div>` : ''}
  </div>`;
      break;

    case 'image-text': {
      const imgFirst = d.imagePosition !== 'right';
      const imgPct = d.imageSplit ?? 50;
      const imgHtml = d.imageUrl
        ? `<div class="sl-img-box anim-item" data-anim="${imgFirst ? 'fadeLeft' : 'fadeRight'}"><img src="${esc(d.imageUrl)}" alt=""></div>`
        : `<div class="sl-img-box sl-img-placeholder anim-item" data-anim="${imgFirst ? 'fadeLeft' : 'fadeRight'}"></div>`;
      const textHtml = `<div class="sl-img-text anim-item" data-anim="${imgFirst ? 'fadeRight' : 'fadeLeft'}">
      ${tag(d.tag)}
      <h3>${highlight(d.title || '', accent)}</h3>
      <p>${nl2br(d.body || '', accent)}</p>
    </div>`;
      body = `<div class="sl-img-layout${imgFirst ? '' : ' reverse'}" style="grid-template-columns:${imgPct}fr ${100-imgPct}fr">
    ${imgFirst ? imgHtml + textHtml : textHtml + imgHtml}
  </div>`;
      break;
    }

    case 'cards':
      body = `<div class="sl-title-area">
    ${tag(d.tag)}
    <h1 class="sl-heading anim-item" data-anim="fadeUp">${highlight(d.title || '', accent)}</h1>
  </div>
  <div class="sl-cards">
    ${(d.cards || []).map((c) => `
    <div class="sl-card${c.highlight ? ' featured' : ''} anim-item" data-anim="fadeUp">
      <h4>${highlight(c.title, accent)}</h4>
      <p>${nl2br(c.body, accent)}</p>
    </div>`).join('')}
  </div>`;
      break;

    case 'timeline':
      body = `<div class="sl-title-area">
    ${tag(d.tag)}
    <h1 class="sl-heading anim-item" data-anim="fadeUp">${highlight(d.title || '', accent)}</h1>
  </div>
  <div class="sl-timeline">
    ${(d.steps || []).map((step) => `
    <div class="sl-timeline-step${step.highlight ? ' featured' : ''} anim-item" data-anim="fadeUp">
      <div class="sl-timeline-stage">${esc(step.stage)}</div>
      <h4>${highlight(step.title, accent)}</h4>
      <p>${nl2br(step.detail, accent)}</p>
      ${step.metric ? `<div class="sl-timeline-metric">${esc(step.metric)}</div>` : ''}
    </div>`).join('')}
  </div>`;
      break;

    case 'big-number':
      body = `<div class="sl-big-number">
    ${d.subtitle ? `<div class="sl-big-number-label anim-item" data-anim="fadeIn">${esc(d.subtitle)}</div>` : ''}
    <div class="sl-big-number-value anim-item" data-anim="scaleIn">${esc(d.number || '')}</div>
    <div class="sl-big-number-divider anim-item" data-anim="fadeIn"></div>
    <div class="sl-big-number-title anim-item" data-anim="fadeUp">${highlight(d.title || '', accent)}</div>
    ${d.body ? `<p class="sl-big-number-body anim-item" data-anim="fadeUp">${nl2br(d.body, accent)}</p>` : ''}
  </div>`;
      break;

    case 'stats':
      body = `<div class="sl-title-area">
    ${tag(d.tag)}
    <h1 class="sl-heading anim-item" data-anim="fadeUp">${highlight(d.title || '', accent)}</h1>
  </div>
  <div class="sl-stats">
    <div class="sl-stats-metrics">
      ${(d.metrics || []).map((m) => `
      <div class="sl-metric anim-item" data-anim="scaleIn">
        <div class="sl-metric-value">${esc(m.value)}</div>
        <div class="sl-metric-label">${esc(m.label)}</div>
      </div>`).join('')}
    </div>
    ${d.body ? `<div class="sl-stats-body anim-item" data-anim="fadeUp"><p>${nl2br(d.body, accent)}</p></div>` : ''}
  </div>`;
      break;

    case 'video':
      body = `<div class="sl-title-area">
    ${tag(d.tag)}
    <h1 class="sl-heading anim-item" data-anim="fadeUp">${highlight(d.title || '', accent)}</h1>
  </div>
  <div class="sl-video">
    ${d.videoUrl
      ? `<video class="sl-video-el anim-item" data-anim="fadeIn" src="${esc(d.videoUrl)}" controls></video>`
      : `<div class="sl-video-placeholder anim-item" data-anim="fadeIn">&#x25B6;</div>`}
    ${d.body ? `<p class="sl-video-caption anim-item" data-anim="fadeUp">${nl2br(d.body, accent)}</p>` : ''}
  </div>`;
      break;

    case 'outro':
      body = `<div class="sl-outro">
    ${d.logoUrl ? `<img class="sl-outro-logo anim-item" data-anim="fadeIn" src="${esc(d.logoUrl)}" alt="">` : ''}
    <h1 class="sl-outro-title anim-item" data-anim="fadeUp">${highlight(d.title || 'Thank You', accent)}</h1>
    ${d.subtitle ? `<p class="sl-outro-sub anim-item" data-anim="fadeIn">${esc(d.subtitle)}</p>` : ''}
    <div class="sl-outro-divider anim-item" data-anim="fadeIn"></div>
    ${d.contactInfo ? `<p class="sl-outro-contact anim-item" data-anim="fadeUp">${nl2br(d.contactInfo, accent)}</p>` : ''}
  </div>`;
      break;

    case 'blank':
      body = `<div class="sl-center anim-item" data-anim="fadeIn">
    <h2 style="opacity:.5">${esc(slide.label)}</h2>
  </div>`;
      break;
  }

  return `<section class="slide${activeClass}"${transAttr}${bgEffectAttr} style="${bgStyle}">
  ${body}
  ${overlaysHtml}
</section>`;
}

function generateCss(kv: KeyVisual): string {
  const accent = kv.accentColor;
  const primary = kv.primaryColor;
  const secondary = kv.secondaryColor;
  const bg = kv.backgroundColor || '#000';
  const font = kv.fontFamily || "'Pretendard Variable','Pretendard',-apple-system,sans-serif";

  return `
@font-face{font-family:'Pretendard Variable';font-display:swap;src:local('Pretendard Variable')}
:root{--accent:${accent};--primary:${primary};--secondary:${secondary};--bg:${bg};--font:${font}}
*{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;font-family:var(--font)}
html,body{width:100%;height:100%;background:var(--bg);color:var(--primary);overflow:hidden}
.bg-image{position:fixed;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;pointer-events:none}
#starCanvas{position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none}
.deck{position:relative;z-index:2;width:100vw;height:100vh;overflow:hidden}
.slide{position:absolute;inset:0;opacity:0;pointer-events:none;display:flex;flex-direction:column;transition:opacity .6s cubic-bezier(.22,1,.36,1),transform .6s cubic-bezier(.22,1,.36,1),filter .6s cubic-bezier(.22,1,.36,1)}
.slide.active{opacity:1;pointer-events:auto;transform:none;filter:none}
.slide.exit-fade{opacity:0}
.slide.exit-dissolve{opacity:0;filter:blur(8px)}
.slide.exit-slide-left{transform:translateX(-100%)}
.slide.exit-slide-right{transform:translateX(100%)}
.slide.exit-slide-up{transform:translateY(-100%)}
.slide.exit-slide-down{transform:translateY(100%)}
.slide.exit-zoom-in{opacity:0;transform:scale(1.2)}
.slide.exit-zoom-out{opacity:0;transform:scale(0.8)}
.slide.enter-fade{opacity:0}
.slide.enter-dissolve{opacity:0;filter:blur(8px)}
.slide.enter-slide-left{transform:translateX(100%)}
.slide.enter-slide-right{transform:translateX(-100%)}
.slide.enter-slide-up{transform:translateY(100%)}
.slide.enter-slide-down{transform:translateY(-100%)}
.slide.enter-zoom-in{opacity:0;transform:scale(0.8)}
.slide.enter-zoom-out{opacity:0;transform:scale(1.2)}

/* Navigation */
#dotNav{position:fixed;top:28px;left:50%;transform:translateX(-50%);z-index:10;display:flex;gap:3px;align-items:center;background:${bg}cc;backdrop-filter:blur(12px);border:1px solid ${primary}1a;border-radius:6px;padding:4px 6px}
.dot{width:26px;height:20px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:${primary}55;cursor:pointer;border:none;background:none;border-radius:3px;font-family:var(--font);transition:all .2s}
.dot:hover{color:var(--primary);background:${primary}1a}
.dot.active{color:var(--bg);background:var(--accent);box-shadow:0 0 8px ${accent}80}
.nav-btns{position:fixed;bottom:24px;right:28px;z-index:10;display:flex;gap:6px}
.nav-btn{width:40px;height:40px;border-radius:50%;border:1px solid ${primary}33;background:${bg}99;backdrop-filter:blur(8px);color:var(--primary);font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}
.nav-btn:hover{border-color:var(--accent);color:var(--accent)}
.page-counter{position:fixed;bottom:48px;left:28px;z-index:10;font-size:12px;font-weight:700;color:${primary}88;letter-spacing:3px}

/* Animations */
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes fadeLeft{from{opacity:0;transform:translateX(-40px)}to{opacity:1;transform:translateX(0)}}
@keyframes fadeRight{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
@keyframes scaleIn{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}
@keyframes bounceIn{0%{opacity:0;transform:scale(.3)}50%{opacity:1;transform:scale(1.05)}70%{transform:scale(.95)}100%{opacity:1;transform:scale(1)}}
@keyframes typewriter{from{opacity:1;clip-path:inset(0 100% 0 0)}to{opacity:1;clip-path:inset(0 0 0 0)}}
.anim-item{opacity:0;transform:translateY(24px)}

/* Continuous dynamic effects */
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes floatSlow{0%,100%{transform:translate(0,0)}33%{transform:translate(5px,-8px)}66%{transform:translate(-4px,6px)}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
@keyframes glowPulse{0%,100%{box-shadow:0 0 20px ${accent}33}50%{box-shadow:0 0 40px ${accent}66,0 0 80px ${accent}22}}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
@keyframes rotate360{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes breathe{0%,100%{opacity:0.6}50%{opacity:1}}
.fx-float{animation:float 4s ease-in-out infinite}
.fx-float-slow{animation:floatSlow 7s ease-in-out infinite}
.fx-pulse{animation:pulse 3s ease-in-out infinite}
.fx-glow{animation:glowPulse 3s ease-in-out infinite}
.fx-shimmer{background:linear-gradient(90deg,transparent 25%,${accent}11 50%,transparent 75%);background-size:200% 100%;animation:shimmer 3s linear infinite}
.fx-rotate{animation:rotate360 20s linear infinite}
.fx-breathe{animation:breathe 4s ease-in-out infinite}

/* Overlays */
.sl-overlay{pointer-events:none}

/* Tag */
.sl-tag{display:inline-block;font-size:13px;font-weight:700;color:var(--accent);letter-spacing:5px;padding:6px 14px;border:1px solid ${accent}66;border-radius:2px;background:${accent}0d;margin-bottom:18px}

/* Title Area */
.sl-title-area{position:absolute;top:7%;left:7%;right:7%;z-index:3}
.sl-heading{font-weight:800;font-size:64px;line-height:1.12;letter-spacing:-2.5px;color:var(--primary);text-shadow:0 2px 12px rgba(0,0,0,.25)}

/* Body */
.sl-body-area{position:absolute;top:28%;left:7%;right:40%;bottom:12%}
.sl-body{font-size:24px;line-height:1.7;color:var(--primary);font-weight:500;letter-spacing:-.2px}

/* Center layout */
.sl-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 7% 6%}
.sl-hero-title{font-size:88px;font-weight:800;line-height:1.08;letter-spacing:-3.5px;text-align:center;margin-bottom:20px;text-shadow:0 4px 20px rgba(0,0,0,.3)}
.sl-hero-sub{font-size:20px;font-weight:600;letter-spacing:5px;color:var(--secondary);text-align:center;margin-top:16px}

/* Section Cover */
.sl-cover{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;padding-bottom:10%}
.sl-cover-label{font-size:13px;font-weight:700;letter-spacing:6px;color:${secondary}}
.sl-cover-num{font-size:100px;font-weight:900;letter-spacing:-4px;line-height:.9;color:var(--accent);text-shadow:0 0 60px ${accent}66}
.sl-cover-divider{width:1px;height:50px;background:linear-gradient(to bottom,var(--accent),transparent)}
.sl-cover-title{font-size:80px;font-weight:800;letter-spacing:-2px;line-height:1;text-align:center;text-shadow:0 2px 16px rgba(0,0,0,.25)}

/* Two Column */
.sl-two-col{position:absolute;top:24%;left:7%;right:7%;bottom:12%;display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center}
.sl-col{padding:32px 30px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);backdrop-filter:blur(12px);position:relative;min-height:280px;display:flex;flex-direction:column;border-radius:4px;box-shadow:0 4px 24px rgba(0,0,0,.2)}
.sl-col::before{content:"";position:absolute;top:0;left:0;width:50px;height:3px;background:var(--accent)}
.sl-col h3{font-size:32px;font-weight:800;line-height:1.2;margin-bottom:16px;letter-spacing:-.5px}
.sl-col p{font-size:20px;line-height:1.6;color:var(--primary);font-weight:500}

/* Comparison */
.sl-compare{position:absolute;top:24%;left:7%;right:7%;display:grid;grid-template-columns:1fr 1fr;gap:30px}
.sl-compare-card{padding:34px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);backdrop-filter:blur(12px);border-radius:4px;min-height:260px;display:flex;flex-direction:column;box-shadow:0 4px 24px rgba(0,0,0,.2)}
.sl-compare-card.win{border-color:var(--accent);background:${accent}0f;box-shadow:0 0 40px ${accent}1f,0 4px 24px rgba(0,0,0,.2)}
.sl-compare-label{font-size:13px;font-weight:700;letter-spacing:4px;color:var(--primary);margin-bottom:18px}
.sl-compare-card.win .sl-compare-label{color:var(--accent)}
.sl-compare-msg{font-size:22px;line-height:1.5;font-weight:600;flex:1;color:var(--primary)}
.sl-compare-stat{margin-top:22px;padding-top:18px;border-top:1px solid rgba(255,255,255,.25);display:flex;justify-content:space-between;align-items:baseline}
.sl-compare-n{font-size:48px;font-weight:800;letter-spacing:-1px}
.sl-compare-card.win .sl-compare-n{color:var(--accent)}
.sl-compare-l{font-size:12px;font-weight:700;letter-spacing:2px}

/* Metrics */
.sl-metrics{position:absolute;top:32%;left:7%;right:7%;display:flex;justify-content:center;gap:60px}
.sl-metric{text-align:center}
.sl-metric-value{font-size:80px;font-weight:800;letter-spacing:-3px;color:var(--accent);line-height:1;text-shadow:0 0 40px ${accent}40}
.sl-metric-label{font-size:16px;font-weight:700;letter-spacing:3px;color:var(--secondary);margin-top:12px}

/* Quote */
.sl-quote-wrap{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 10% 6%}
.sl-quote{font-size:60px;font-weight:800;line-height:1.25;text-align:center;letter-spacing:-2.5px;max-width:1200px;text-shadow:0 2px 16px rgba(0,0,0,.2)}
.sl-attribution{margin-top:36px;font-size:16px;font-weight:600;color:var(--secondary);letter-spacing:3px}

/* Image + Text */
.sl-img-layout{position:absolute;top:7%;left:7%;right:7%;bottom:7%;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}
.sl-img-layout.reverse{direction:rtl}
.sl-img-layout.reverse>*{direction:ltr}
.sl-img-box{width:100%;aspect-ratio:4/3;border:1px solid ${accent}40;background:linear-gradient(135deg,rgba(15,6,0,.8),rgba(0,0,0,.6));border-radius:4px;overflow:hidden}
.sl-img-box img{width:100%;height:100%;object-fit:cover}
.sl-img-placeholder{display:flex;align-items:center;justify-content:center}
.sl-img-text h3{font-size:38px;font-weight:800;line-height:1.2;margin-bottom:20px;letter-spacing:-1px}
.sl-img-text p{font-size:20px;line-height:1.65;font-weight:500}

/* Cards */
.sl-cards{position:absolute;top:24%;left:7%;right:7%;display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:22px}
.sl-card{padding:30px 24px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);backdrop-filter:blur(12px);border-radius:4px;position:relative;min-height:200px;display:flex;flex-direction:column;box-shadow:0 4px 24px rgba(0,0,0,.2)}
.sl-card::before{content:"";position:absolute;top:0;left:0;width:100%;height:3px;background:var(--accent);opacity:.3}
.sl-card.featured{border-color:var(--accent);background:${accent}0f;box-shadow:0 0 30px ${accent}15,0 4px 24px rgba(0,0,0,.2)}
.sl-card.featured::before{opacity:1}
.sl-card h4{font-size:24px;font-weight:800;line-height:1.25;margin-bottom:12px;letter-spacing:-.5px}
.sl-card p{font-size:17px;line-height:1.6;color:var(--primary);font-weight:500}

/* Timeline */
.sl-timeline{position:absolute;top:24%;left:7%;right:7%;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:22px}
.sl-timeline-step{padding:30px 24px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);backdrop-filter:blur(12px);border-radius:4px;position:relative;min-height:200px;display:flex;flex-direction:column;box-shadow:0 4px 24px rgba(0,0,0,.2)}
.sl-timeline-step::before{content:"";position:absolute;top:0;left:0;width:100%;height:3px;background:var(--accent);opacity:.3}
.sl-timeline-step.featured{border-color:var(--accent);background:${accent}0f;box-shadow:0 0 30px ${accent}15,0 4px 24px rgba(0,0,0,.2)}
.sl-timeline-step.featured::before{opacity:1}
.sl-timeline-stage{font-size:11px;font-weight:700;letter-spacing:3px;color:var(--accent);margin-bottom:8px}
.sl-timeline-step h4{font-size:24px;font-weight:800;line-height:1.25;margin-bottom:12px;letter-spacing:-.5px}
.sl-timeline-step p{font-size:17px;line-height:1.6;color:var(--primary);font-weight:500;flex:1}
.sl-timeline-metric{font-size:20px;font-weight:800;color:var(--accent);margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,.15)}

/* Big Number */
.sl-big-number{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;padding:0 10% 6%}
.sl-big-number-label{font-size:13px;font-weight:700;letter-spacing:6px;color:${secondary}}
.sl-big-number-value{font-size:180px;font-weight:900;letter-spacing:-6px;line-height:.9;color:var(--accent);text-shadow:0 0 80px ${accent}66}
.sl-big-number-divider{width:1px;height:30px;background:linear-gradient(to bottom,var(--accent),transparent)}
.sl-big-number-title{font-size:60px;font-weight:800;letter-spacing:-2px;text-align:center}
.sl-big-number-body{font-size:22px;line-height:1.7;font-weight:500;text-align:center;max-width:70%}

/* Stats */
.sl-stats{position:absolute;top:24%;left:7%;right:7%;bottom:12%;display:flex;flex-direction:column}
.sl-stats-metrics{display:flex;justify-content:center;gap:60px;margin-top:16px}
.sl-stats-body{margin-top:32px}
.sl-stats-body p{font-size:24px;line-height:1.7;color:var(--primary);font-weight:500;max-width:70%}

/* Video */
.sl-video{position:absolute;top:24%;left:7%;right:7%;bottom:7%;display:flex;flex-direction:column;align-items:center;justify-content:center}
.sl-video-el{max-width:100%;max-height:80%;border-radius:4px;border:1px solid ${accent}40}
.sl-video-placeholder{width:80%;aspect-ratio:16/9;border:1px solid ${accent}40;background:linear-gradient(135deg,rgba(15,6,0,.8),rgba(0,0,0,.6));border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:60px;color:${accent}66}
.sl-video-caption{font-size:18px;line-height:1.6;font-weight:500;text-align:center;margin-top:16px}

/* Outro */
.sl-outro{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;padding:0 10% 6%}
.sl-outro-logo{height:80px;object-fit:contain;margin-bottom:16px}
.sl-outro-title{font-size:90px;font-weight:900;letter-spacing:-3.5px;text-align:center;line-height:1.1;text-shadow:0 4px 20px rgba(0,0,0,.3)}
.sl-outro-sub{font-size:22px;font-weight:600;letter-spacing:4px;color:var(--secondary);text-align:center}
.sl-outro-divider{width:60px;height:1px;background:${accent}66}
.sl-outro-contact{font-size:18px;line-height:1.8;font-weight:500;text-align:center;color:var(--secondary)}

/* Brand Chrome */
.brand-mark{position:fixed;top:28px;left:28px;z-index:10;font-size:16px;font-weight:600;color:${primary}cc;letter-spacing:2px}
.stage-indicator{position:fixed;bottom:24px;left:28px;z-index:10;font-size:12px;font-weight:700;color:${primary}88;letter-spacing:3px}
.vignette{position:fixed;inset:0;pointer-events:none;z-index:1;background:radial-gradient(ellipse at center,transparent 50%,${bg}cc 100%)}

/* Slide background depth overlay */
.slide::after{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 30% 20%,rgba(255,255,255,.03) 0%,transparent 70%);pointer-events:none;z-index:0}
`;
}

function generateBgEffectJs(effect: BackgroundEffect, accentColor: string): string {
  if (effect === 'none') return '';

  // Parse accent color to RGB for use in JS
  const hex = accentColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const canvasSetup = `
const canvas=document.getElementById('starCanvas');
const ctx=canvas.getContext('2d');
let W,H;
function resizeCanvas(){W=window.innerWidth;H=window.innerHeight;canvas.width=W*devicePixelRatio;canvas.height=H*devicePixelRatio;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0)}
window.addEventListener('resize',resizeCanvas);resizeCanvas();
`;

  switch (effect) {
    case 'starfield':
      return canvasSetup + `
var stars=[],cx,cy,maxDist;
var STAR_COUNT=380;
function mkStar(spread){return{angle:Math.random()*Math.PI*2,dist:spread?Math.random():Math.random()*0.08,speed:Math.random()*0.0005+0.0002}}
function initStars(){cx=W/2;cy=H/2;maxDist=Math.sqrt(cx*cx+cy*cy)*1.15;stars=Array.from({length:STAR_COUNT},function(){return mkStar(true)})}
initStars();
function animate(){ctx.clearRect(0,0,W,H);cx=W/2;cy=H/2;maxDist=Math.sqrt(cx*cx+cy*cy)*1.15;stars.forEach(function(s){s.dist+=s.speed;if(s.dist>1.05){Object.assign(s,mkStar(false));return}var d=s.dist*maxDist;var sx=cx+Math.cos(s.angle)*d;var sy=cy+Math.sin(s.angle)*d;var alpha=Math.min(1,s.dist*2+.18);var size=Math.max(.3,s.dist*3);var bri=Math.floor(190+s.dist*65);if(s.dist>.06){var td=Math.max(0,(s.dist-s.speed*3))*maxDist;var px=cx+Math.cos(s.angle)*td;var py=cy+Math.sin(s.angle)*td;ctx.strokeStyle='rgba('+bri+','+(bri+6)+','+(bri+18)+','+alpha*.5+')';ctx.lineWidth=size*.55;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(sx,sy);ctx.stroke()}ctx.beginPath();ctx.arc(sx,sy,size*.5,0,Math.PI*2);ctx.fillStyle='rgba('+bri+','+(bri+6)+','+(bri+18)+','+alpha+')';ctx.fill()});requestAnimationFrame(animate)}
animate();
`;

    case 'particles':
      return canvasSetup + `
var PCOUNT=80,LDIST=120;
var particles=[];
function initP(){particles=[];for(var i=0;i<PCOUNT;i++){particles.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,r:Math.random()*2+1,a:Math.random()<.3})}}
initP();
function animate(){ctx.clearRect(0,0,W,H);
for(var i=0;i<particles.length;i++){var p=particles[i];p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1}
for(var i=0;i<particles.length;i++){for(var j=i+1;j<particles.length;j++){var dx=particles[i].x-particles[j].x,dy=particles[i].y-particles[j].y,dist=Math.sqrt(dx*dx+dy*dy);if(dist<LDIST){var al=(1-dist/LDIST)*.15;ctx.strokeStyle='rgba(${r},${g},${b},'+al+')';ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(particles[i].x,particles[i].y);ctx.lineTo(particles[j].x,particles[j].y);ctx.stroke()}}}
for(var i=0;i<particles.length;i++){var p=particles[i];ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=p.a?'rgba(${r},${g},${b},.7)':'rgba(200,200,210,.4)';ctx.fill()}
requestAnimationFrame(animate)}
animate();
`;

    case 'gradient-wave':
      return canvasSetup + `
var blobs=[];
function initBlobs(){blobs=[];for(var i=0;i<5;i++){blobs.push({x:Math.random()*W,y:Math.random()*H,r:Math.min(W,H)*(.2+Math.random()*.2),vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,op:Math.random()*.1+.05})}}
initBlobs();
function animate(){ctx.clearRect(0,0,W,H);
for(var i=0;i<blobs.length;i++){var b=blobs[i];b.x+=b.vx;b.y+=b.vy;if(b.x<-b.r)b.x=W+b.r;if(b.x>W+b.r)b.x=-b.r;if(b.y<-b.r)b.y=H+b.r;if(b.y>H+b.r)b.y=-b.r;
var g=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r);g.addColorStop(0,'rgba(${r},${g},${b},'+b.op+')');g.addColorStop(1,'rgba(${r},${g},${b},0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill()}
requestAnimationFrame(animate)}
animate();
`;

    case 'bokeh':
      return canvasSetup + `
var circles=[];
function initC(){circles=[];for(var i=0;i<25;i++){circles.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*40+10,vx:(Math.random()-.5)*.2,vy:(Math.random()-.5)*.2,al:Math.random()*.12+.03,t:Math.random()<.5})}}
initC();
function animate(){ctx.clearRect(0,0,W,H);
for(var i=0;i<circles.length;i++){var c=circles[i];c.x+=c.vx;c.y+=c.vy;if(c.x<-c.r*2)c.x=W+c.r*2;if(c.x>W+c.r*2)c.x=-c.r*2;if(c.y<-c.r*2)c.y=H+c.r*2;if(c.y>H+c.r*2)c.y=-c.r*2;
var g=ctx.createRadialGradient(c.x,c.y,0,c.x,c.y,c.r);if(c.t){g.addColorStop(0,'rgba(${r},${g},${b},'+c.al+')');g.addColorStop(1,'rgba(${r},${g},${b},0)')}else{g.addColorStop(0,'rgba(220,220,230,'+c.al+')');g.addColorStop(1,'rgba(220,220,230,0)')}
ctx.fillStyle=g;ctx.beginPath();ctx.arc(c.x,c.y,c.r,0,Math.PI*2);ctx.fill()}
requestAnimationFrame(animate)}
animate();
`;

    case 'grid':
      return canvasSetup + `
var time=0;
function animate(){ctx.clearRect(0,0,W,H);time+=.005;
var pulse=.08+Math.sin(time*.5)*.04;ctx.strokeStyle='rgba(${r},${g},${b},'+pulse+')';ctx.lineWidth=.5;
var vY=H*.35,cx2=W/2;
for(var i=0;i<=20;i++){var t2=i/20;var y=vY+(H-vY)*(t2*t2);ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
for(var i=0;i<=20;i++){var xB=(i/20)*W;ctx.beginPath();ctx.moveTo(cx2,vY);ctx.lineTo(xB,H);ctx.stroke()}
requestAnimationFrame(animate)}
animate();
`;
  }
}

function generateNavJs(total: number): string {
  return `
const slides=document.querySelectorAll('.slide');
const total=${total};
let cur=0;
let subStep=0;
const dotNav=document.getElementById('dotNav');
const pageCounter=document.getElementById('pageCounter');
for(let i=0;i<total;i++){const d=document.createElement('button');d.className='dot'+(i===0?' active':'');d.textContent=String(i+1).padStart(2,'0');d.onclick=()=>goSlide(i);dotNav.appendChild(d)}
const dots=dotNav.querySelectorAll('.dot');

function getAnimItems(slideIdx){return slides[slideIdx].querySelectorAll('.anim-item')}

function getInitialState(anim){
  switch(anim){
    case 'fadeLeft':return{opacity:'0',transform:'translateX(-40px)'};
    case 'fadeRight':return{opacity:'0',transform:'translateX(40px)'};
    case 'scaleIn':return{opacity:'0',transform:'scale(.85)'};
    case 'bounceIn':return{opacity:'0',transform:'scale(.8)'};
    case 'typewriter':return{opacity:'1',transform:'none',clipPath:'inset(0 100% 0 0)'};
    case 'fadeIn':return{opacity:'0',transform:'none'};
    case 'fadeUp':default:return{opacity:'0',transform:'translateY(24px)'};
  }
}

function resetAnimItems(slideIdx){
  const items=getAnimItems(slideIdx);
  items.forEach(function(el){
    var anim=el.dataset.anim||'fadeUp';
    var init=getInitialState(anim);
    el.style.opacity=init.opacity;el.style.transform=init.transform;
    if(init.clipPath)el.style.clipPath=init.clipPath;
    else el.style.clipPath='';
    el.style.animation='none';
  });
}

function revealItem(el){
  var anim=el.dataset.anim||'fadeUp';
  el.style.animation='none';
  void el.offsetWidth;
  if(anim==='typewriter'){
    el.style.opacity='1';el.style.transform='none';
    el.style.clipPath='inset(0 0 0 0)';
    el.style.transition='clip-path .8s steps(20,end)';
  }else if(anim==='bounceIn'){
    el.style.opacity='1';el.style.transform='scale(1)';
    el.style.transition='opacity .4s ease, transform .6s cubic-bezier(.34,1.56,.64,1)';
  }else if(anim==='scaleIn'){
    el.style.opacity='1';el.style.transform='scale(1)';
    el.style.transition='opacity .5s ease, transform .5s ease';
  }else if(anim==='fadeLeft'||anim==='fadeRight'){
    el.style.opacity='1';el.style.transform='translateX(0)';
    el.style.transition='opacity .5s ease, transform .5s ease';
  }else if(anim==='fadeIn'){
    el.style.opacity='1';el.style.transform='none';
    el.style.transition='opacity .5s ease';
  }else{
    el.style.opacity='1';el.style.transform='translateY(0)';
    el.style.transition='opacity .5s ease, transform .5s ease';
  }
}

function revealAllItems(slideIdx){
  const items=getAnimItems(slideIdx);
  items.forEach(function(el){el.style.opacity='1';el.style.transform='none';el.style.clipPath='';el.style.transition='none';el.style.animation='none'});
}

function hideItem(el){
  var anim=el.dataset.anim||'fadeUp';
  var init=getInitialState(anim);
  el.style.opacity=init.opacity;el.style.transform=init.transform;
  if(init.clipPath)el.style.clipPath=init.clipPath;
  else el.style.clipPath='';
  el.style.transition='opacity .3s ease, transform .3s ease';
}

function updateCounter(){
  if(pageCounter)pageCounter.textContent=String(cur+1).padStart(2,'0')+' / '+String(total).padStart(2,'0');
}

var stageEl=document.getElementById('stageInd');
function updateStage(slideIdx){
  if(!stageEl)return;
  var tagEl=slides[slideIdx].querySelector('.sl-tag');
  stageEl.textContent=tagEl?tagEl.textContent:'';
}
function goSlide(i){
  if(i<0||i>=total)return;
  if(i===cur){return}
  var oldSlide=slides[cur];
  var newSlide=slides[i];
  var exitTrans=oldSlide.dataset.transition||'fade';
  var enterTrans=newSlide.dataset.transition||'fade';
  oldSlide.classList.add('exit-'+exitTrans);
  newSlide.classList.add('enter-'+enterTrans);
  resetAnimItems(i);
  void newSlide.offsetWidth;
  newSlide.classList.add('active');
  newSlide.classList.remove('enter-'+enterTrans);
  setTimeout(function(){
    oldSlide.classList.remove('active','exit-'+exitTrans);
  },650);
  cur=i;subStep=0;
  dots.forEach(function(d,j){d.classList.toggle('active',j===cur)});
  updateCounter();
  updateStage(i);
}

function advance(){
  var items=getAnimItems(cur);
  if(subStep<items.length){revealItem(items[subStep]);subStep++;return}
  if(cur<total-1){goSlide(cur+1);advance()}
}

function stepBack(){
  var items=getAnimItems(cur);
  if(subStep>0){subStep--;hideItem(items[subStep]);return}
  if(cur>0){goSlide(cur-1);var prevItems=getAnimItems(cur);subStep=prevItems.length;revealAllItems(cur)}
}

/* initialise first slide: hide all anim-items */
resetAnimItems(0);
slides[0].classList.add('active');
updateStage(0);

document.getElementById('prevBtn').onclick=function(){stepBack()};
document.getElementById('nextBtn').onclick=function(){advance()};
document.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key===' '||e.key==='Enter'){e.preventDefault();advance()}else if(e.key==='ArrowLeft'){stepBack()}else if(e.key==='f'||e.key==='F'){if(!document.fullscreenElement)document.documentElement.requestFullscreen();else document.exitFullscreen()}else if(e.key==='Home'){goSlide(0)}else if(e.key==='End'){goSlide(total-1);revealAllItems(cur);subStep=getAnimItems(cur).length}});
document.addEventListener('click',function(e){if(e.target.closest('button'))return;if(e.clientX>window.innerWidth/2)advance();else stepBack()});
document.addEventListener('contextmenu',function(e){e.preventDefault();stepBack()});
`;
}

export function exportToHtml(project: Project): string {
  const kv = project.keyVisual;
  const css = generateCss(kv);
  const slidesHtml = project.slides.map((s, i) => renderSlideHtml(s, kv, i)).join('\n\n');
  const bgImage = kv.backgroundImage ? `<img class="bg-image" src="${kv.backgroundImage}" alt="">` : '';
  const hasBgEffect = project.backgroundEffect && project.backgroundEffect !== 'none';
  const starfieldCanvas = hasBgEffect ? '<canvas id="starCanvas"></canvas>' : '';
  const bgEffectJs = hasBgEffect ? generateBgEffectJs(project.backgroundEffect, kv.accentColor) : '';
  const navJs = generateNavJs(project.slides.length);

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(project.name)}</title>
<link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
<style>${css}</style>
</head>
<body>
${bgImage}
${starfieldCanvas}
<div class="deck">
${slidesHtml}
</div>
<div id="dotNav"></div>
<div class="page-counter" id="pageCounter">01 / ${String(project.slides.length).padStart(2, '0')}</div>
<div class="nav-btns">
  <button class="nav-btn" id="prevBtn">&#x25C0;</button>
  <button class="nav-btn" id="nextBtn">&#x25B6;</button>
</div>
<div class="brand-mark">${esc(project.name)}</div>
<div class="stage-indicator" id="stageInd"></div>
<div class="vignette"></div>
<script>${bgEffectJs}${navJs}</script>
</body>
</html>`;
}
