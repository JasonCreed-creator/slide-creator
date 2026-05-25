import { useProjectStore } from '@/stores/projectStore';
import { LAYOUT_PRESETS } from '@/presets/defaults';
import { MiniPreview } from '@/components/Preview';
import type { ScreenLayout } from '@/types';

export function ScreenLayoutEditor() {
  const { project, setLayout, setEditorStep } = useProjectStore();

  const handleSelect = (layout: ScreenLayout) => {
    setLayout(layout);
  };

  return (
    <div className="editor-panel">
      <h2>스크린 구성 설정</h2>
      <p className="panel-description">
        스크린을 어떤 영역으로 나눌지 설정합니다. 각 영역에 독립적인 콘텐츠를 배치할 수 있습니다.
      </p>

      <div className="preset-grid">
        {LAYOUT_PRESETS.map((layout) => (
          <button
            key={layout.id}
            className={`preset-card ${project.layout.id === layout.id ? 'active' : ''}`}
            onClick={() => handleSelect(layout)}
          >
            <div className="layout-preview">
              {layout.zones.map((zone) => (
                <div
                  key={zone.id}
                  className="layout-zone"
                  style={{
                    position: 'absolute',
                    left: `${zone.x}%`,
                    top: `${zone.y}%`,
                    width: `${zone.width}%`,
                    height: `${zone.height}%`,
                  }}
                >
                  {zone.label}
                </div>
              ))}
            </div>
            <span className="preset-name">{layout.name}</span>
            <span className="preset-detail">{layout.zones.length}개 영역</span>
          </button>
        ))}
      </div>

      <MiniPreview />

      <div className="panel-actions">
        <button className="btn-secondary" onClick={() => setEditorStep('screen')}>
          ← 이전
        </button>
        <button className="btn-primary" onClick={() => setEditorStep('keyvisual')}>
          <span>다음: 키비주얼 →</span>
        </button>
      </div>
    </div>
  );
}
