import { useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { SCREEN_PRESETS } from '@/presets/defaults';
import { createCustomScreen } from '@/utils/screen';
import { MiniPreview } from '@/components/Preview';
import type { ScreenSpec } from '@/types';

export function ScreenConfig() {
  const { project, setScreen, setEditorStep } = useProjectStore();
  const [customMode, setCustomMode] = useState(false);
  const [customWidth, setCustomWidth] = useState(16000);
  const [customHeight, setCustomHeight] = useState(4000);
  const [customName, setCustomName] = useState('커스텀 스크린');

  const handleSelect = (preset: ScreenSpec) => {
    setScreen(preset);
  };

  const handleCustomApply = () => {
    const screen = createCustomScreen(customName, customWidth, customHeight);
    setScreen(screen);
    setCustomMode(false);
  };

  return (
    <div className="editor-panel">
      <h2>스크린 규격 설정</h2>
      <p className="panel-description">
        컨퍼런스 스크린의 물리적 크기를 설정합니다.
      </p>

      <div className="preset-grid">
        {SCREEN_PRESETS.map((preset) => (
          <button
            key={preset.id}
            className={`preset-card ${project.screen.id === preset.id ? 'active' : ''}`}
            onClick={() => handleSelect(preset)}
          >
            <div
              className="preset-preview"
              style={{
                aspectRatio: `${preset.widthPx} / ${preset.heightPx}`,
              }}
            />
            <span className="preset-name">{preset.name}</span>
            <span className="preset-detail">
              {preset.widthMm / 1000}m × {preset.heightMm / 1000}m · {preset.aspectRatio}
            </span>
          </button>
        ))}

        <button
          className={`preset-card ${customMode ? 'active' : ''}`}
          onClick={() => setCustomMode(true)}
        >
          <div className="preset-preview custom-icon">+</div>
          <span className="preset-name">커스텀</span>
        </button>
      </div>

      {customMode && (
        <div className="custom-form">
          <label>
            이름
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
          </label>
          <label>
            너비 (mm)
            <input
              type="number"
              value={customWidth}
              onChange={(e) => setCustomWidth(Number(e.target.value))}
              min={1000}
              max={50000}
            />
          </label>
          <label>
            높이 (mm)
            <input
              type="number"
              value={customHeight}
              onChange={(e) => setCustomHeight(Number(e.target.value))}
              min={1000}
              max={20000}
            />
          </label>
          <button className="btn-primary" onClick={handleCustomApply}>
            적용
          </button>
        </div>
      )}

      <MiniPreview />

      <div className="panel-actions">
        <button className="btn-primary" onClick={() => setEditorStep('layout')}>
          다음: 레이아웃 설정 →
        </button>
      </div>
    </div>
  );
}
