import { useProjectStore } from '@/stores/projectStore';

export function MiniPreview() {
  const { project } = useProjectStore();
  const kv = project.keyVisual;

  return (
    <div className="mini-preview-wrapper">
      <h3 className="mini-preview-title">현재 설정 미리보기</h3>
      <div
        className="mini-preview-screen"
        style={{
          aspectRatio: `${project.screen.widthPx} / ${project.screen.heightPx}`,
          background: kv.gradientCss || kv.backgroundColor,
          color: kv.primaryColor,
          fontFamily: kv.fontFamily,
        }}
      >
        {project.layout.zones.map((zone) => (
          <div
            key={zone.id}
            className="mini-preview-zone"
            style={{
              position: 'absolute',
              left: `${zone.x}%`,
              top: `${zone.y}%`,
              width: `${zone.width}%`,
              height: `${zone.height}%`,
            }}
          >
            <span className="mini-zone-label">{zone.label}</span>
          </div>
        ))}
      </div>
      <div className="mini-preview-meta">
        <span>{project.screen.widthMm / 1000}m × {project.screen.heightMm / 1000}m</span>
        <span>{project.screen.aspectRatio}</span>
        <span>{project.layout.zones.length}개 영역</span>
      </div>
    </div>
  );
}
