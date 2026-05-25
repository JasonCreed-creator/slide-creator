import { useProjectStore } from '@/stores/projectStore';
import { KEY_VISUAL_PRESETS } from '@/presets/defaults';
import { MiniPreview } from '@/components/Preview';
import type { KeyVisual } from '@/types';

export function KeyVisualEditor() {
  const { project, setKeyVisual, setEditorStep } = useProjectStore();

  const handleSelect = (kv: KeyVisual) => {
    setKeyVisual(kv);
  };

  return (
    <div className="editor-panel">
      <h2>키비주얼 설정</h2>
      <p className="panel-description">
        슬라이드의 기본 비주얼 테마를 설정합니다.
      </p>

      <div className="preset-grid">
        {KEY_VISUAL_PRESETS.map((kv) => (
          <button
            key={kv.id}
            className={`preset-card ${project.keyVisual.id === kv.id ? 'active' : ''}`}
            onClick={() => handleSelect(kv)}
          >
            <div
              className="kv-preview"
              style={{
                background: kv.gradientCss || kv.backgroundColor,
              }}
            >
              <span style={{ color: kv.primaryColor, fontFamily: kv.fontFamily }}>
                Aa
              </span>
              <div className="kv-colors">
                <span className="color-dot" style={{ background: kv.primaryColor }} />
                <span className="color-dot" style={{ background: kv.secondaryColor }} />
                <span className="color-dot" style={{ background: kv.accentColor }} />
              </div>
            </div>
            <span className="preset-name">{kv.name}</span>
          </button>
        ))}
      </div>

      <MiniPreview />

      <div className="panel-actions">
        <button className="btn-secondary" onClick={() => setEditorStep('layout')}>
          ← 이전
        </button>
        <button className="btn-primary" onClick={() => setEditorStep('slides')}>
          다음: 슬라이드 편집 →
        </button>
      </div>
    </div>
  );
}
