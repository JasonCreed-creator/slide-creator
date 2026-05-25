import { useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import type { EditorStep } from '@/stores/projectStore';
import { ScreenConfig } from '@/components/ScreenConfig';
import { ScreenLayoutEditor } from '@/components/ScreenLayout';
import { KeyVisualEditor } from '@/components/KeyVisual';
import { ScreenPlayEditor } from '@/components/ScreenPlay';
import { SlidePreview } from '@/components/Preview';
import { downloadHtml } from '@/utils/export';
import './styles/global.css';

const STEPS: { key: EditorStep; label: string }[] = [
  { key: 'screen', label: '스크린 규격' },
  { key: 'layout', label: '스크린 구성' },
  { key: 'keyvisual', label: '키비주얼' },
  { key: 'slides', label: '슬라이드' },
  { key: 'preview', label: '미리보기' },
];

function HamburgerMenu({ onClose }: { onClose: () => void }) {
  const { project, setProjectName, savedProjects, saveProject, loadProject, deleteProject, newProject } = useProjectStore();
  const [name, setName] = useState(project.name);

  const handleSave = () => {
    setProjectName(name);
    saveProject();
  };

  return (
    <>
      <div className="menu-backdrop" onClick={onClose} />
      <div className="hamburger-dropdown">
        <div className="hb-section">
          <span className="hb-section-title">프로젝트 이름</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <button className="btn-small" onClick={handleSave}>저장</button>
            <button className="btn-small" onClick={() => { newProject(); onClose(); }}>새 프로젝트</button>
          </div>
        </div>
        {savedProjects.length > 0 && (
          <div className="hb-section">
            <span className="hb-section-title">저장된 프로젝트</span>
            {savedProjects.map((p) => (
              <div key={p.id} className="hb-project-item">
                <span className="hb-project-name" onClick={() => { loadProject(p.id); onClose(); }}>{p.name}</span>
                <button className="btn-icon danger" onClick={() => deleteProject(p.id)}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

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

export default function App() {
  const { editorStep, setEditorStep, project } = useProjectStore();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app">
      <header className="app-header">
        <div style={{ position: 'relative' }}>
          <button className="btn-icon hamburger-btn" onClick={() => setMenuOpen(!menuOpen)}>≡</button>
          {menuOpen && <HamburgerMenu onClose={() => setMenuOpen(false)} />}
        </div>
        <h1 className="app-title">Slide Creator</h1>
        <span className="project-name">{project.name}</span>
        <div style={{ flex: 1 }} />
        <button className="btn-export" onClick={() => downloadHtml(project)}>
          HTML 내보내기
        </button>
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

      <main className={`app-main ${editorStep === 'slides' ? 'app-main-flush' : ''}`}>
        <StepPanel />
      </main>
    </div>
  );
}
