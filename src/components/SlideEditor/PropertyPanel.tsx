import { useProjectStore } from '@/stores/projectStore';
import type { TextProps, ImageProps, ShapeProps } from '@/types';

export function PropertyPanel() {
  const { project, activeSlideId, selectedContentId, updateContent, removeContent } =
    useProjectStore();

  const activeSlide = project.slides.find((s) => s.id === activeSlideId);
  const content = activeSlide?.contents.find((c) => c.id === selectedContentId);

  if (!content || !activeSlideId) {
    return (
      <div className="property-panel">
        <div className="property-empty">
          <p>콘텐츠를 선택하면</p>
          <p>속성을 편집할 수 있습니다</p>
        </div>
      </div>
    );
  }

  const update = (patch: Record<string, unknown>) => {
    updateContent(activeSlideId, content.id, patch);
  };

  const updateProps = (propsPatch: Record<string, unknown>) => {
    updateContent(activeSlideId, content.id, {
      props: { ...content.props, ...propsPatch },
    });
  };

  return (
    <div className="property-panel">
      <div className="property-header">
        <span className="property-type-badge">
          {content.type === 'text' ? '텍스트' : content.type === 'image' ? '이미지' : '도형'}
        </span>
        <button
          className="btn-icon danger"
          onClick={() => removeContent(activeSlideId, content.id)}
          title="삭제"
        >
          &times;
        </button>
      </div>

      <div className="property-section">
        <span className="property-section-title">위치 / 크기</span>
        <div className="property-row">
          <label className="prop-label">
            X (%)
            <input
              type="number"
              value={Math.round(content.x)}
              onChange={(e) => update({ x: Number(e.target.value) })}
              min={0}
              max={100}
            />
          </label>
          <label className="prop-label">
            Y (%)
            <input
              type="number"
              value={Math.round(content.y)}
              onChange={(e) => update({ y: Number(e.target.value) })}
              min={0}
              max={100}
            />
          </label>
        </div>
        <div className="property-row">
          <label className="prop-label">
            너비 (%)
            <input
              type="number"
              value={Math.round(content.width)}
              onChange={(e) => update({ width: Number(e.target.value) })}
              min={1}
              max={100}
            />
          </label>
          <label className="prop-label">
            높이 (%)
            <input
              type="number"
              value={Math.round(content.height)}
              onChange={(e) => update({ height: Number(e.target.value) })}
              min={1}
              max={100}
            />
          </label>
        </div>
        <label className="prop-label">
          투명도
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={content.opacity}
            onChange={(e) => update({ opacity: Number(e.target.value) })}
          />
        </label>
      </div>

      {content.type === 'text' && <TextProperties props={content.props as TextProps} updateProps={updateProps} />}
      {content.type === 'image' && <ImageProperties props={content.props as ImageProps} updateProps={updateProps} />}
      {content.type === 'shape' && <ShapeProperties props={content.props as ShapeProps} updateProps={updateProps} />}
    </div>
  );
}

function TextProperties({ props, updateProps }: { props: TextProps; updateProps: (p: Record<string, unknown>) => void }) {
  return (
    <div className="property-section">
      <span className="property-section-title">텍스트</span>
      <label className="prop-label">
        내용
        <textarea
          className="prop-textarea"
          value={props.text}
          onChange={(e) => updateProps({ text: e.target.value })}
          rows={3}
        />
      </label>
      <div className="property-row">
        <label className="prop-label">
          크기 (px)
          <input
            type="number"
            value={props.fontSize}
            onChange={(e) => updateProps({ fontSize: Number(e.target.value) })}
            min={8}
            max={200}
          />
        </label>
        <label className="prop-label">
          굵기
          <select
            value={props.fontWeight}
            onChange={(e) => updateProps({ fontWeight: Number(e.target.value) })}
          >
            <option value={300}>Light</option>
            <option value={400}>Regular</option>
            <option value={600}>Semi Bold</option>
            <option value={700}>Bold</option>
            <option value={900}>Black</option>
          </select>
        </label>
      </div>
      <div className="property-row">
        <label className="prop-label">
          정렬
          <select
            value={props.textAlign}
            onChange={(e) => updateProps({ textAlign: e.target.value })}
          >
            <option value="left">왼쪽</option>
            <option value="center">가운데</option>
            <option value="right">오른쪽</option>
          </select>
        </label>
        <label className="prop-label">
          색상
          <input
            type="color"
            value={props.color}
            onChange={(e) => updateProps({ color: e.target.value })}
          />
        </label>
      </div>
    </div>
  );
}

function ImageProperties({ props, updateProps }: { props: ImageProps; updateProps: (p: Record<string, unknown>) => void }) {
  return (
    <div className="property-section">
      <span className="property-section-title">이미지</span>
      <label className="prop-label">
        URL
        <input
          type="text"
          value={props.src}
          onChange={(e) => updateProps({ src: e.target.value })}
          placeholder="https://example.com/image.jpg"
        />
      </label>
      <label className="prop-label">
        맞춤
        <select
          value={props.objectFit}
          onChange={(e) => updateProps({ objectFit: e.target.value })}
        >
          <option value="cover">채우기 (Cover)</option>
          <option value="contain">맞추기 (Contain)</option>
          <option value="fill">늘리기 (Fill)</option>
        </select>
      </label>
    </div>
  );
}

function ShapeProperties({ props, updateProps }: { props: ShapeProps; updateProps: (p: Record<string, unknown>) => void }) {
  return (
    <div className="property-section">
      <span className="property-section-title">도형</span>
      <label className="prop-label">
        종류
        <select
          value={props.shapeType}
          onChange={(e) => updateProps({ shapeType: e.target.value })}
        >
          <option value="rectangle">사각형</option>
          <option value="circle">원형</option>
        </select>
      </label>
      <div className="property-row">
        <label className="prop-label">
          채우기
          <input
            type="color"
            value={props.fill.startsWith('rgba') ? '#4f8cff' : props.fill}
            onChange={(e) => updateProps({ fill: e.target.value })}
          />
        </label>
        <label className="prop-label">
          테두리
          <input
            type="color"
            value={props.strokeColor}
            onChange={(e) => updateProps({ strokeColor: e.target.value })}
          />
        </label>
      </div>
      <div className="property-row">
        <label className="prop-label">
          테두리 두께
          <input
            type="number"
            value={props.strokeWidth}
            onChange={(e) => updateProps({ strokeWidth: Number(e.target.value) })}
            min={0}
            max={20}
          />
        </label>
        {props.shapeType === 'rectangle' && (
          <label className="prop-label">
            라운드
            <input
              type="number"
              value={props.borderRadius}
              onChange={(e) => updateProps({ borderRadius: Number(e.target.value) })}
              min={0}
              max={100}
            />
          </label>
        )}
      </div>
    </div>
  );
}
