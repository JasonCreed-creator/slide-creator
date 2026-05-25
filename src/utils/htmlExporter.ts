import type { Project, Slide, KeyVisual } from '@/types';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function highlight(text: string, accentColor: string): string {
  return esc(text).replace(/\*\*(.+?)\*\*/g, `<b style="color:${accentColor};font-weight:800">$1</b>`);
}

function nl2br(text: string, accentColor: string): string {
  return highlight(text, accentColor).replace(/\n/g, '<br>');
}

function renderSlideHtml(slide: Slide, kv: KeyVisual, index: number): string {
  const d = slide.data;
  const accent = kv.accentColor;
  const bg = slide.backgroundColor || '';
  const bgStyle = bg ? `background:${bg};` : '';
  const activeClass = index === 0 ? ' active' : '';

  const tag = (text?: string) =>
    text ? `<div class="sl-tag anim-item">${esc(text)}</div>` : '';

  switch (slide.template) {
    case 'title':
      return `<section class="slide${activeClass}" style="${bgStyle}">
  <div class="sl-center">
    ${tag(d.tag)}
    <h1 class="sl-hero-title anim-item">${highlight(d.title || '', accent)}</h1>
    ${d.subtitle ? `<p class="sl-hero-sub anim-item">${highlight(d.subtitle, accent)}</p>` : ''}
  </div>
</section>`;

    case 'section-cover':
      return `<section class="slide${activeClass}" style="${bgStyle}">
  <div class="sl-cover">
    <div class="sl-cover-label anim-item">${esc(d.subtitle || '')}</div>
    <div class="sl-cover-num anim-item">${esc(d.number || '')}</div>
    <div class="sl-cover-divider anim-item"></div>
    <div class="sl-cover-title anim-item">${highlight(d.title || '', accent)}</div>
  </div>
</section>`;

    case 'content':
      return `<section class="slide${activeClass}" style="${bgStyle}">
  <div class="sl-title-area">
    ${tag(d.tag)}
    <h1 class="sl-heading anim-item">${highlight(d.title || '', accent)}</h1>
  </div>
  <div class="sl-body-area anim-item">
    <p class="sl-body">${nl2br(d.body || '', accent)}</p>
  </div>
</section>`;

    case 'two-column':
      return `<section class="slide${activeClass}" style="${bgStyle}">
  <div class="sl-title-area">
    ${tag(d.tag)}
    <h1 class="sl-heading anim-item">${highlight(d.title || '', accent)}</h1>
  </div>
  <div class="sl-two-col">
    <div class="sl-col anim-item">
      <h3>${highlight(d.leftTitle || '', accent)}</h3>
      <p>${nl2br(d.leftBody || '', accent)}</p>
    </div>
    <div class="sl-col anim-item">
      <h3>${highlight(d.rightTitle || '', accent)}</h3>
      <p>${nl2br(d.rightBody || '', accent)}</p>
    </div>
  </div>
</section>`;

    case 'comparison':
      return `<section class="slide${activeClass}" style="${bgStyle}">
  <div class="sl-title-area">
    ${tag(d.tag)}
    <h1 class="sl-heading anim-item">${highlight(d.title || '', accent)}</h1>
  </div>
  <div class="sl-compare">
    <div class="sl-compare-card${d.winner === 'left' ? ' win' : ''} anim-item">
      <div class="sl-compare-label">${esc(d.leftLabel || '')}</div>
      <div class="sl-compare-msg">${nl2br(d.leftContent || '', accent)}</div>
      <div class="sl-compare-stat">
        <span class="sl-compare-n">${esc(d.leftMetricValue || '')}</span>
        <span class="sl-compare-l">${esc(d.leftMetricLabel || '')}</span>
      </div>
    </div>
    <div class="sl-compare-card${d.winner === 'right' ? ' win' : ''} anim-item">
      <div class="sl-compare-label">${esc(d.rightLabel || '')}</div>
      <div class="sl-compare-msg">${nl2br(d.rightContent || '', accent)}</div>
      <div class="sl-compare-stat">
        <span class="sl-compare-n">${esc(d.rightMetricValue || '')}</span>
        <span class="sl-compare-l">${esc(d.rightMetricLabel || '')}</span>
      </div>
    </div>
  </div>
</section>`;

    case 'metrics':
      return `<section class="slide${activeClass}" style="${bgStyle}">
  <div class="sl-title-area">
    ${tag(d.tag)}
    <h1 class="sl-heading anim-item">${highlight(d.title || '', accent)}</h1>
  </div>
  <div class="sl-metrics">
    ${(d.metrics || []).map((m) => `
    <div class="sl-metric anim-item">
      <div class="sl-metric-value">${esc(m.value)}</div>
      <div class="sl-metric-label">${esc(m.label)}</div>
    </div>`).join('')}
  </div>
</section>`;

    case 'quote':
      return `<section class="slide${activeClass}" style="${bgStyle}">
  <div class="sl-quote-wrap">
    ${tag(d.tag)}
    <blockquote class="sl-quote anim-item">${highlight(d.quote || '', accent)}</blockquote>
    ${d.attribution ? `<div class="sl-attribution anim-item">${esc(d.attribution)}</div>` : ''}
  </div>
</section>`;

    case 'image-text': {
      const imgFirst = d.imagePosition !== 'right';
      const imgHtml = d.imageUrl
        ? `<div class="sl-img-box anim-item"><img src="${esc(d.imageUrl)}" alt=""></div>`
        : `<div class="sl-img-box sl-img-placeholder anim-item"></div>`;
      const textHtml = `<div class="sl-img-text anim-item">
      ${tag(d.tag)}
      <h3>${highlight(d.title || '', accent)}</h3>
      <p>${nl2br(d.body || '', accent)}</p>
    </div>`;
      return `<section class="slide${activeClass}" style="${bgStyle}">
  <div class="sl-img-layout${imgFirst ? '' : ' reverse'}">
    ${imgFirst ? imgHtml + textHtml : textHtml + imgHtml}
  </div>
</section>`;
    }

    case 'cards':
      return `<section class="slide${activeClass}" style="${bgStyle}">
  <div class="sl-title-area">
    ${tag(d.tag)}
    <h1 class="sl-heading anim-item">${highlight(d.title || '', accent)}</h1>
  </div>
  <div class="sl-cards">
    ${(d.cards || []).map((c) => `
    <div class="sl-card${c.highlight ? ' featured' : ''} anim-item">
      <h4>${highlight(c.title, accent)}</h4>
      <p>${nl2br(c.body, accent)}</p>
    </div>`).join('')}
  </div>
</section>`;

    case 'blank':
      return `<section class="slide${activeClass}" style="${bgStyle}">
  <div class="sl-center anim-item">
    <h2 style="opacity:.5">${esc(slide.label)}</h2>
  </div>
</section>`;
  }
}

function generateCss(kv: KeyVisual): string {
  const accent = kv.accentColor;
  const primary = kv.primaryColor;
  const secondary = kv.secondaryColor;
  const bg = kv.backgroundColor || '#000';
  const font = kv.fontFamily || "'Pretendard Variable','Pretendard',-apple-system,sans-serif";

  return `
:root{--accent:${accent};--primary:${primary};--secondary:${secondary};--bg:${bg};--font:${font}}
*{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;font-family:var(--font)}
html,body{width:100%;height:100%;background:var(--bg);color:var(--primary);overflow:hidden}
#starCanvas{position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none}
.deck{position:relative;z-index:2;width:100vw;height:100vh;overflow:hidden}
.slide{position:absolute;inset:0;opacity:0;pointer-events:none;transition:opacity .5s ease;display:flex;flex-direction:column}
.slide.active{opacity:1;pointer-events:auto}

/* Navigation */
#dotNav{position:fixed;top:28px;left:50%;transform:translateX(-50%);z-index:10;display:flex;gap:3px;align-items:center;background:rgba(0,0,0,.5);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.1);border-radius:6px;padding:4px 6px}
.dot{width:26px;height:20px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:rgba(255,255,255,.35);cursor:pointer;border:none;background:none;border-radius:3px;font-family:var(--font);transition:all .2s}
.dot:hover{color:#fff;background:rgba(255,255,255,.1)}
.dot.active{color:#000;background:var(--accent);box-shadow:0 0 8px ${accent}80}
.nav-btns{position:fixed;bottom:24px;right:28px;z-index:10;display:flex;gap:6px}
.nav-btn{width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(0,0,0,.4);backdrop-filter:blur(8px);color:#fff;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}
.nav-btn:hover{border-color:var(--accent);color:var(--accent)}
.page-counter{position:fixed;bottom:30px;left:28px;z-index:10;font-size:12px;font-weight:700;color:rgba(255,255,255,.5);letter-spacing:3px}

/* Animations */
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes scaleIn{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
.anim-item{opacity:0;transform:translateY(24px)}

/* Tag */
.sl-tag{display:inline-block;font-size:13px;font-weight:700;color:var(--accent);letter-spacing:5px;padding:6px 14px;border:1px solid ${accent}66;border-radius:2px;background:${accent}0d;margin-bottom:18px}

/* Title Area */
.sl-title-area{position:absolute;top:7%;left:7%;right:7%;z-index:3}
.sl-heading{font-weight:800;font-size:56px;line-height:1.15;letter-spacing:-2px;color:var(--primary)}

/* Body */
.sl-body-area{position:absolute;top:28%;left:7%;right:40%;bottom:12%}
.sl-body{font-size:24px;line-height:1.7;color:var(--primary);font-weight:500}

/* Center layout */
.sl-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 7% 6%}
.sl-hero-title{font-size:78px;font-weight:800;line-height:1.12;letter-spacing:-3px;text-align:center;margin-bottom:20px}
.sl-hero-sub{font-size:20px;font-weight:600;letter-spacing:4px;color:var(--secondary);text-align:center;margin-top:16px}

/* Section Cover */
.sl-cover{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;padding-bottom:10%}
.sl-cover-label{font-size:13px;font-weight:700;letter-spacing:6px;color:rgba(255,255,255,.35)}
.sl-cover-num{font-size:100px;font-weight:900;letter-spacing:-4px;line-height:.9;color:var(--accent);text-shadow:0 0 60px ${accent}66}
.sl-cover-divider{width:1px;height:50px;background:linear-gradient(to bottom,var(--accent),transparent)}
.sl-cover-title{font-size:80px;font-weight:800;letter-spacing:-2px;line-height:1;text-align:center}

/* Two Column */
.sl-two-col{position:absolute;top:24%;left:7%;right:7%;bottom:12%;display:grid;grid-template-columns:1fr 40px 1fr;gap:20px;align-items:center}
.sl-col{padding:32px 30px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.02);backdrop-filter:blur(8px);position:relative;min-height:280px;display:flex;flex-direction:column;border-radius:4px}
.sl-col::before{content:"";position:absolute;top:0;left:0;width:50px;height:3px;background:var(--accent)}
.sl-col h3{font-size:32px;font-weight:800;line-height:1.2;margin-bottom:16px;letter-spacing:-.5px}
.sl-col p{font-size:20px;line-height:1.6;color:var(--primary);font-weight:500}

/* Comparison */
.sl-compare{position:absolute;top:24%;left:7%;right:7%;display:grid;grid-template-columns:1fr 1fr;gap:30px}
.sl-compare-card{padding:34px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.02);border-radius:4px;min-height:260px;display:flex;flex-direction:column}
.sl-compare-card.win{border-color:var(--accent);background:${accent}0f;box-shadow:0 0 40px ${accent}1f}
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
.sl-quote{font-size:60px;font-weight:800;line-height:1.25;text-align:center;letter-spacing:-2px;max-width:1200px}
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
.sl-card{padding:30px 24px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.02);border-radius:4px;position:relative;min-height:200px;display:flex;flex-direction:column}
.sl-card::before{content:"";position:absolute;top:0;left:0;width:100%;height:3px;background:var(--accent);opacity:.3}
.sl-card.featured{border-color:var(--accent);background:${accent}0f;box-shadow:0 0 30px ${accent}15}
.sl-card.featured::before{opacity:1}
.sl-card h4{font-size:24px;font-weight:800;line-height:1.25;margin-bottom:12px;letter-spacing:-.5px}
.sl-card p{font-size:17px;line-height:1.6;color:var(--primary);font-weight:500}
`;
}

function generateStarfieldJs(): string {
  return `
const canvas=document.getElementById('starCanvas');
const ctx=canvas.getContext('2d');
let stars=[],W,H,cx,cy,maxDist;
const STAR_COUNT=380;
function resizeCanvas(){W=window.innerWidth;H=window.innerHeight;canvas.width=W*devicePixelRatio;canvas.height=H*devicePixelRatio;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.scale(devicePixelRatio,devicePixelRatio);cx=W/2;cy=H/2;maxDist=Math.sqrt(cx*cx+cy*cy)*1.15;initStars()}
function mkStar(spread){const angle=Math.random()*Math.PI*2;return{angle,dist:spread?Math.random():Math.random()*0.08,speed:Math.random()*0.0005+0.0002}}
function initStars(){stars=Array.from({length:STAR_COUNT},()=>mkStar(true))}
function animate(){ctx.clearRect(0,0,W,H);stars.forEach(s=>{s.dist+=s.speed;if(s.dist>1.05){Object.assign(s,mkStar(false));return}const d=s.dist*maxDist;const sx=cx+Math.cos(s.angle)*d;const sy=cy+Math.sin(s.angle)*d;const alpha=Math.min(1,s.dist*2+.18);const size=Math.max(.3,s.dist*3);const bri=Math.floor(190+s.dist*65);if(s.dist>.06){const td=Math.max(0,(s.dist-s.speed*3))*maxDist;const px=cx+Math.cos(s.angle)*td;const py=cy+Math.sin(s.angle)*td;ctx.strokeStyle='rgba('+bri+','+(bri+6)+','+(bri+18)+','+alpha*.5+')';ctx.lineWidth=size*.55;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(sx,sy);ctx.stroke()}ctx.beginPath();ctx.arc(sx,sy,size*.5,0,Math.PI*2);ctx.fillStyle='rgba('+bri+','+(bri+6)+','+(bri+18)+','+alpha+')';ctx.fill()});requestAnimationFrame(animate)}
window.addEventListener('resize',resizeCanvas);resizeCanvas();animate();
`;
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

function resetAnimItems(slideIdx){
  const items=getAnimItems(slideIdx);
  items.forEach(function(el){el.style.opacity='0';el.style.transform='translateY(24px)';el.style.animation='none'});
}

function revealItem(el){
  el.style.animation='none';
  void el.offsetWidth;
  el.style.opacity='1';el.style.transform='translateY(0)';
  el.style.transition='opacity .5s ease, transform .5s ease';
}

function revealAllItems(slideIdx){
  const items=getAnimItems(slideIdx);
  items.forEach(function(el){el.style.opacity='1';el.style.transform='translateY(0)';el.style.transition='none';el.style.animation='none'});
}

function hideItem(el){
  el.style.opacity='0';el.style.transform='translateY(24px)';
  el.style.transition='opacity .3s ease, transform .3s ease';
}

function updateCounter(){
  if(pageCounter)pageCounter.textContent=String(cur+1).padStart(2,'0')+' / '+String(total).padStart(2,'0');
}

function goSlide(i){
  if(i<0||i>=total)return;
  if(i===cur){subStep=0;resetAnimItems(cur);return}
  slides[cur].classList.remove('active');
  cur=i;subStep=0;
  resetAnimItems(cur);
  slides[cur].classList.add('active');
  dots.forEach(function(d,j){d.classList.toggle('active',j===cur)});
  updateCounter();
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
  const starfieldCanvas = project.starfield ? '<canvas id="starCanvas"></canvas>' : '';
  const starfieldJs = project.starfield ? generateStarfieldJs() : '';
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
<script>${starfieldJs}${navJs}</script>
</body>
</html>`;
}
