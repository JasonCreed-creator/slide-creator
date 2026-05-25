import { useProjectStore } from '@/stores/projectStore';
import { KEY_VISUAL_PRESETS } from '@/presets/defaults';
import { BACKGROUND_EFFECT_PRESETS } from '@/types/effects';
import { MiniPreview } from '@/components/Preview';
import type { KeyVisual, BackgroundEffect } from '@/types';

export function KeyVisualEditor() {
  const { project, setKeyVisual, setEditorStep } = useProjectStore();

  const handleSelect = (kv: KeyVisual) => {
    setKeyVisual(kv);
  };

  const handleEffectChange = (effect: BackgroundEffect) => {
    setKeyVisual({ ...project.keyVisual, backgroundEffect: effect });
  };

  return (
    <div className="editor-panel">
      <h2>키비주얼 설정</h2>
      <p className="panel-description">
        슬라이드의 기본 비주얼 테마와 배경 이펙트를 설정합니다.
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
              {kv.backgroundEffect && kv.backgroundEffect.type !== 'none' && (
                <span className="kv-effect-indicator">
                  FX: {kv.backgroundEffect.type}
                </span>
              )}
            </div>
            <span className="preset-name">{kv.name}</span>
          </button>
        ))}
      </div>

      <div className="section-divider">배경 이펙트</div>

      <div className="custom-form">
        <span className="config-section-title">글로벌 배경 이펙트</span>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
          모든 슬라이드의 기본 배경 이펙트입니다. 개별 슬라이드에서 덮어쓸 수 있습니다.
        </p>
        <div className="effect-selector">
          {BACKGROUND_EFFECT_PRESETS.map((preset) => (
            <button
              key={preset.label}
              className={`effect-chip ${project.keyVisual.backgroundEffect?.type === preset.value.type ? 'active' : ''}`}
              onClick={() => handleEffectChange(preset.value)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <MiniPreview />

      <div className="panel-actions">
        <button className="btn-secondary" onClick={() => setEditorStep('layout')}>
          ← 이전
        </button>
        <button className="btn-primary" onClick={() => setEditorStep('slides')}>
          <span>다음: 슬라이드 편집 →</span>
        </button>
      </div>
    </div>
  );
}
