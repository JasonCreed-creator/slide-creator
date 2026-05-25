import { useState, useRef } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import type { EditorStep } from '@/stores/projectStore';
import { ScreenConfig } from '@/components/ScreenConfig';
import { ScreenLayoutEditor } from '@/components/ScreenLayout';
import { KeyVisualEditor } from '@/components/KeyVisual';
import { ScreenPlayEditor } from '@/components/ScreenPlay';
import { SlidePreview } from '@/components/Preview';
import { exportToHtml } from '@/utils/htmlExporter';
import { BG_EFFECT_LABELS } from '@/types';
import type { BackgroundEffect } from '@/types';
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
    case 'screen': return <ScreenConfig />;
    case 'layout': return <ScreenLayoutEditor />;
    case 'keyvisual': return <KeyVisualEditor />;
    case 'slides': return <ScreenPlayEditor />;
    case 'preview': return <SlidePreview />;
  }
}

function SaveLoadMenu() {
  const [open, setOpen] = useState(false);
  const {
    project, savedProjects, saveProject, loadProject, deleteSavedProject,
    resetProject, refreshSavedProjects, exportProjectJson, importProjectJson,
    setProjectName, setBackgroundEffect,
  } = useProjectStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => { saveProject(); setOpen(false); };

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
    reader.onload = (ev) => { importProjectJson(ev.target?.result as string); setOpen(false); };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="save-load-menu">
      <button className="header-btn" onClick={() => { refreshSavedProjects(); setOpen(!open); }}>&#x2630;</button>
      {open && (
        <>
          <div className="menu-backdrop" onClick={() => setOpen(false)} />
          <div className="menu-dropdown">
            <div className="menu-section">
              <label className="prop-label">
                프로젝트 이름
                <input type="text" value={project.name} onChange={(e) => setProjectName(e.target.value)} />
              </label>
              <label className="prop-label" style={{ marginTop: 8 }}>
                배경 효과
                <select value={project.backgroundEffect} onChange={(e) => setBackgroundEffect(e.target.value as BackgroundEffect)}>
                  {Object.entries(BG_EFFECT_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="menu-section">
              <button className="menu-item" onClick={handleSave}><span>&#x1F4BE;</span> 저장</button>
              <button className="menu-item" onClick={handleExportJson}><span>&#x1F4E4;</span> JSON 내보내기</button>
              <button className="menu-item" onClick={() => fileInputRef.current?.click()}><span>&#x1F4E5;</span> JSON 불러오기</button>
              <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImportJson} />
              <button className="menu-item danger" onClick={() => { resetProject(); setOpen(false); }}><span>&#x1F5D1;</span> 새 프로젝트</button>
            </div>
            {savedProjects.length > 0 && (
              <div className="menu-section">
                <span className="menu-section-title">저장된 프로젝트</span>
                {savedProjects.map((p) => (
                  <div key={p.id} className="saved-item">
                    <button className="saved-item-name" onClick={() => { loadProject(p.id); setOpen(false); }}>{p.name}</button>
                    <span className="saved-item-date">{new Date(p.updatedAt).toLocaleDateString('ko')}</span>
                    <button className="btn-icon danger" onClick={() => deleteSavedProject(p.id)}>&times;</button>
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

function ExportHtmlButton() {
  const { project } = useProjectStore();

  const handleExport = () => {
    if (project.slides.length === 0) return;
    const html = exportToHtml(project);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      className="header-btn export-btn"
      onClick={handleExport}
      disabled={project.slides.length === 0}
      title="독립 실행 HTML 프레젠테이션으로 내보내기"
    >
      HTML 내보내기
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
        <ExportHtmlButton />
      </header>
      <nav className="step-nav">
        {STEPS.map((step, index) => (
          <button key={step.key} className={`step-btn ${editorStep === step.key ? 'active' : ''}`} onClick={() => setEditorStep(step.key)}>
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
