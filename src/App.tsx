import { useState, useRef } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import type { EditorStep } from '@/stores/projectStore';
import { ScreenConfig } from '@/components/ScreenConfig';
import { ScreenLayoutEditor } from '@/components/ScreenLayout';
import { KeyVisualEditor } from '@/components/KeyVisual';
import { ScreenPlayEditor } from '@/components/ScreenPlay';
import { SlidePreview } from '@/components/Preview';
import './styles/global.css';

const STEPS: { key: EditorStep; label: string }[] = [
  { key: 'screen', label: '스크린 규격' },
  { key: 'layout', label: '스크린 구성' },
  { key: 'keyvisual', label: '키비주얼' },
  { key: 'slides', label: '슬라이드' },
  { key: 'preview', label: '미리보기' },
];

function StepPanel() {
  const step = useProjectStore((s) => s.editorStep);
  switch (step) {
    case 'screen':
      return <ScreenConfig />;
    case 'layout':
      return <ScreenLayoutEditor />;
    case 'keyvisual':
      return <KeyVisualEditor />;
    case 'slides':
      return <ScreenPlayEditor />;
    case 'preview':
      return <SlidePreview />;
  }
}

function SaveLoadMenu() {
  const [open, setOpen] = useState(false);
  const {
    project,
    savedProjects,
    saveProject,
    loadProject,
    deleteSavedProject,
    resetProject,
    refreshSavedProjects,
    exportProjectJson,
    importProjectJson,
    setProjectName,
  } = useProjectStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    saveProject();
    setOpen(false);
  };

  const handleExportJson = () => {
    const json = exportProjectJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      importProjectJson(text);
      setOpen(false);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleOpen = () => {
    refreshSavedProjects();
    setOpen(!open);
  };

  return (
    <div className="save-load-menu">
      <button className="header-btn" onClick={handleOpen}>
        &#x2630;
      </button>
      {open && (
        <>
          <div className="menu-backdrop" onClick={() => setOpen(false)} />
          <div className="menu-dropdown">
            <div className="menu-section">
              <label className="prop-label">
                프로젝트 이름
                <input
                  type="text"
                  value={project.name}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </label>
            </div>

            <div className="menu-section">
              <button className="menu-item" onClick={handleSave}>
                <span>&#x1F4BE;</span> 현재 프로젝트 저장
              </button>
              <button className="menu-item" onClick={handleExportJson}>
                <span>&#x1F4E4;</span> JSON 내보내기
              </button>
              <button
                className="menu-item"
                onClick={() => fileInputRef.current?.click()}
              >
                <span>&#x1F4E5;</span> JSON 불러오기
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleImportJson}
              />
              <button
                className="menu-item danger"
                onClick={() => {
                  resetProject();
                  setOpen(false);
                }}
              >
                <span>&#x1F5D1;</span> 새 프로젝트
              </button>
            </div>

            {savedProjects.length > 0 && (
              <div className="menu-section">
                <span className="menu-section-title">저장된 프로젝트</span>
                {savedProjects.map((p) => (
                  <div key={p.id} className="saved-item">
                    <button
                      className="saved-item-name"
                      onClick={() => {
                        loadProject(p.id);
                        setOpen(false);
                      }}
                    >
                      {p.name}
                    </button>
                    <span className="saved-item-date">
                      {new Date(p.updatedAt).toLocaleDateString('ko')}
                    </span>
                    <button
                      className="btn-icon danger"
                      onClick={() => deleteSavedProject(p.id)}
                      title="삭제"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ExportButton() {
  const { project } = useProjectStore();
  const [exporting, setExporting] = useState(false);

  const handleExportPng = async () => {
    if (project.slides.length === 0) return;
    setExporting(true);

    try {
      for (let i = 0; i < project.slides.length; i++) {
        const slide = project.slides[i];
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = project.screen.widthPx;
        canvas.height = project.screen.heightPx;

        const bg = slide.backgroundColor || project.keyVisual.backgroundColor || '#000';
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (const content of slide.contents) {
          const cx = (content.x / 100) * canvas.width;
          const cy = (content.y / 100) * canvas.height;
          const cw = (content.width / 100) * canvas.width;
          const ch = (content.height / 100) * canvas.height;

          ctx.globalAlpha = content.opacity;

          if (content.type === 'text') {
            const p = content.props as { text: string; fontSize: number; fontWeight: number; color: string; textAlign: string };
            ctx.fillStyle = p.color;
            ctx.font = `${p.fontWeight} ${p.fontSize * (canvas.width / 1920)}px sans-serif`;
            ctx.textAlign = p.textAlign as CanvasTextAlign;
            ctx.textBaseline = 'middle';
            const tx = p.textAlign === 'center' ? cx + cw / 2 : p.textAlign === 'right' ? cx + cw : cx;
            ctx.fillText(p.text, tx, cy + ch / 2, cw);
          } else if (content.type === 'shape') {
            const p = content.props as { fill: string; strokeColor: string; strokeWidth: number; shapeType: string; borderRadius: number };
            ctx.fillStyle = p.fill;
            if (p.shapeType === 'circle') {
              ctx.beginPath();
              ctx.ellipse(cx + cw / 2, cy + ch / 2, cw / 2, ch / 2, 0, 0, Math.PI * 2);
              ctx.fill();
              if (p.strokeWidth) {
                ctx.strokeStyle = p.strokeColor;
                ctx.lineWidth = p.strokeWidth;
                ctx.stroke();
              }
            } else {
              ctx.fillRect(cx, cy, cw, ch);
              if (p.strokeWidth) {
                ctx.strokeStyle = p.strokeColor;
                ctx.lineWidth = p.strokeWidth;
                ctx.strokeRect(cx, cy, cw, ch);
              }
            }
          }

          ctx.globalAlpha = 1;
        }

        const blob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b!), 'image/png'),
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name}-slide-${i + 1}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      className="header-btn export-btn"
      onClick={handleExportPng}
      disabled={exporting || project.slides.length === 0}
      title="슬라이드를 PNG로 내보내기"
    >
      {exporting ? '...' : 'PNG 내보내기'}
    </button>
  );
}

export default function App() {
  const { editorStep, setEditorStep, project } = useProjectStore();

  return (
    <div className="app">
      <header className="app-header">
        <SaveLoadMenu />
        <h1 className="app-title">Slide Creator</h1>
        <span className="project-name">{project.name}</span>
        <div className="header-spacer" />
        <ExportButton />
      </header>

      <nav className="step-nav">
        {STEPS.map((step, index) => (
          <button
            key={step.key}
            className={`step-btn ${editorStep === step.key ? 'active' : ''}`}
            onClick={() => setEditorStep(step.key)}
          >
            <span className="step-number">{index + 1}</span>
            <span className="step-label">{step.label}</span>
          </button>
        ))}
      </nav>

      <main className={`app-main ${editorStep === 'slides' ? 'app-main-full' : ''}`}>
        <StepPanel />
      </main>
    </div>
  );
}
