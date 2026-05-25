import { useRef } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { KEY_VISUAL_PRESETS } from '@/presets/defaults';
import { MiniPreview } from '@/components/Preview';
import type { KeyVisual } from '@/types';

export function KeyVisualEditor() {
  const { project, setKeyVisual, setEditorStep } = useProjectStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (kv: KeyVisual) => {
    setKeyVisual({ ...kv, backgroundImage: project.keyVisual.backgroundImage });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setKeyVisual({ ...project.keyVisual, backgroundImage: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setKeyVisual({ ...project.keyVisual, backgroundImage: undefined });
  };

  return (
    <div className="editor-panel">
      <h2>키비주얼 설정</h2>
      <p className="panel-description">
        슬라이드의 기본 비주얼 테마를 설정합니다.
      </p>

      <div className="preset-grid kv-preset-grid">
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

      <div className="kv-bg-image-section">
        <span className="te-section-title">배경 이미지 (선택사항)</span>
        <div className="kv-bg-image-controls">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
          <button
            className="btn-upload"
            onClick={() => fileInputRef.current?.click()}
          >
            이미지 업로드
          </button>
          {project.keyVisual.backgroundImage && (
            <button className="btn-small" onClick={handleRemoveImage}>
              제거
            </button>
          )}
        </div>
        {project.keyVisual.backgroundImage && (
          <div className="kv-bg-image-preview">
            <img src={project.keyVisual.backgroundImage} alt="배경 이미지" />
          </div>
        )}
      </div>

      <MiniPreview />

      <div className="panel-actions">
        <button className="btn-secondary" onClick={() => setEditorStep('layout')}>
          &larr; 이전
        </button>
        <button className="btn-primary" onClick={() => setEditorStep('slides')}>
          다음: 슬라이드 편집 &rarr;
        </button>
      </div>
    </div>
  );
}
