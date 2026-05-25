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

export default function App() {
  const { editorStep, setEditorStep, project } = useProjectStore();

  return (
    <div className="app">
      <header className="app-header">
        <button className="btn-icon hamburger-btn" title="메뉴">≡</button>
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
