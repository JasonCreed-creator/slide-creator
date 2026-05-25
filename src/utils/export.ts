import type { Project } from '@/types';

export function exportToHtml(project: Project): string {
  const kv = project.keyVisual;
  const bg = kv.gradientCss || kv.backgroundColor || '#0a0a1a';

  const slidesJson = JSON.stringify(project.slides.map((s) => ({
    label: s.label,
    template: s.template,
    templateData: s.templateData,
    transition: s.transition,
    duration: s.duration,
    backgroundColor: s.backgroundColor,
  })));

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${project.name} - Slide Creator</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{height:100%;overflow:hidden}
body{font-family:'Pretendard',-apple-system,sans-serif;background:#000;color:${kv.primaryColor}}
.slide-wrapper{position:relative;width:100vw;height:100vh;display:flex;align-items:center;justify-content:center}
.slide{position:absolute;width:${project.screen.widthPx}px;height:${project.screen.heightPx}px;background:${bg};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:5%;transition:opacity 0.7s,transform 0.7s}
.slide.hidden{opacity:0;pointer-events:none}
.tag{padding:8px 24px;border:2px solid ${kv.accentColor};border-radius:6px;color:${kv.accentColor};font-size:18px;font-weight:700;letter-spacing:0.15em;margin-bottom:40px}
.title{font-size:64px;font-weight:800;line-height:1.2;margin-bottom:20px;letter-spacing:-0.02em}
.subtitle{font-size:24px;color:${kv.secondaryColor};font-weight:400}
.controls{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);display:flex;gap:8px;padding:10px 20px;background:rgba(0,0,0,0.6);backdrop-filter:blur(12px);border-radius:40px;border:1px solid rgba(255,255,255,0.1);opacity:0;transition:opacity 0.3s;z-index:100}
body:hover .controls{opacity:1}
.controls button{background:none;border:none;color:rgba(255,255,255,0.7);font-size:18px;cursor:pointer;padding:4px 8px;border-radius:4px}
.controls button:hover{color:#fff;background:rgba(255,255,255,0.1)}
.counter{color:rgba(255,255,255,0.5);font-size:13px;display:flex;align-items:center;margin:0 8px}
</style>
</head>
<body>
<div class="slide-wrapper" id="wrapper"></div>
<div class="controls">
<button onclick="prev()">◀</button>
<button onclick="toggle()">▶</button>
<button onclick="next()">▶</button>
<span class="counter" id="counter"></span>
</div>
<script>
const slides=${slidesJson};
let idx=0,playing=false,timer=null;
const wrapper=document.getElementById('wrapper');
const counter=document.getElementById('counter');

function render(s){
  const d=s.templateData||{};
  let html='';
  if(d.tag)html+='<div class="tag">'+d.tag+'</div>';
  if(d.title)html+='<div class="title">'+d.title+'</div>';
  if(d.subtitle)html+='<div class="subtitle">'+d.subtitle+'</div>';
  if(d.quote)html+='<div class="title" style="font-style:italic;font-size:36px">"'+d.quote+'"</div>';
  if(d.author)html+='<div class="subtitle">— '+d.author+'</div>';
  return html;
}

function show(){
  wrapper.innerHTML='';
  slides.forEach((s,i)=>{
    const div=document.createElement('div');
    div.className='slide'+(i!==idx?' hidden':'');
    const scale=Math.min(window.innerWidth/${project.screen.widthPx},window.innerHeight/${project.screen.heightPx});
    div.style.transform='scale('+scale+')';
    div.style.transformOrigin='center center';
    div.innerHTML=render(s);
    wrapper.appendChild(div);
  });
  counter.textContent=(idx+1)+' / '+slides.length;
}

function next(){idx=(idx+1)%slides.length;show()}
function prev(){idx=(idx-1+slides.length)%slides.length;show()}
function toggle(){playing=!playing;if(playing)autoPlay();else clearTimeout(timer)}
function autoPlay(){timer=setTimeout(()=>{next();if(playing)autoPlay()},slides[idx].duration||5000)}

document.addEventListener('keydown',e=>{
  if(e.key==='ArrowRight')next();
  if(e.key==='ArrowLeft')prev();
  if(e.key===' '){e.preventDefault();toggle()}
});

window.addEventListener('resize',show);
show();
</script>
</body>
</html>`;
}

export function downloadHtml(project: Project) {
  const html = exportToHtml(project);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
