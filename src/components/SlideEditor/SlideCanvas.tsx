import { useRef, useState, useCallback, useEffect } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import type { SlideContent, TextProps, ShapeProps } from '@/types';

interface DragState {
  contentId: string;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
  mode: 'move' | 'resize';
  origW: number;
  origH: number;
}

function renderContent(content: SlideContent, isSelected: boolean, isEditing: boolean) {
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${content.x}%`,
    top: `${content.y}%`,
    width: `${content.width}%`,
    height: `${content.height}%`,
    opacity: content.opacity,
    transform: content.rotation ? `rotate(${content.rotation}deg)` : undefined,
    cursor: 'move',
    outline: isSelected ? '2px solid var(--accent)' : 'none',
    outlineOffset: '1px',
  };

  switch (content.type) {
    case 'text': {
      const p = content.props as TextProps;
      return (
        <div
          style={{
            ...baseStyle,
            display: 'flex',
            alignItems: p.textAlign === 'center' ? 'center' : 'flex-start',
            justifyContent: p.textAlign === 'center' ? 'center' : p.textAlign === 'right' ? 'flex-end' : 'flex-start',
            padding: '4%',
          }}
        >
          <div
            style={{
              fontSize: `${p.fontSize}px`,
              fontWeight: p.fontWeight,
              color: p.color,
              textAlign: p.textAlign,
              width: '100%',
              wordBreak: 'break-word',
              pointerEvents: isEditing ? 'auto' : 'none',
            }}
            contentEditable={isEditing}
            suppressContentEditableWarning
          >
            {p.text}
          </div>
        </div>
      );
    }
    case 'image': {
      const p = content.props as { src: string; objectFit: string };
      return (
        <div style={baseStyle}>
          {p.src ? (
            <img
              src={p.src}
              style={{
                width: '100%',
                height: '100%',
                objectFit: p.objectFit as 'cover' | 'contain' | 'fill',
                borderRadius: '4px',
                pointerEvents: 'none',
              }}
              draggable={false}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'var(--bg-tertiary)',
                border: '2px dashed var(--border)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: 'var(--text-secondary)',
              }}
            >
              이미지 URL 입력
            </div>
          )}
        </div>
      );
    }
    case 'shape': {
      const p = content.props as ShapeProps;
      return (
        <div
          style={{
            ...baseStyle,
            background: p.fill,
            border: p.strokeWidth ? `${p.strokeWidth}px solid ${p.strokeColor}` : 'none',
            borderRadius: p.shapeType === 'circle' ? '50%' : `${p.borderRadius}px`,
          }}
        />
      );
    }
  }
}

export function SlideCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { project, activeSlideId, selectedContentId, setSelectedContent, updateContent } =
    useProjectStore();
  const [drag, setDrag] = useState<DragState | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const activeSlide = project.slides.find((s) => s.id === activeSlideId);
  const kv = project.keyVisual;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, content: SlideContent, mode: 'move' | 'resize') => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedContent(content.id);
      setDrag({
        contentId: content.id,
        startX: e.clientX,
        startY: e.clientY,
        origX: content.x,
        origY: content.y,
        mode,
        origW: content.width,
        origH: content.height,
      });
    },
    [setSelectedContent],
  );

  useEffect(() => {
    if (!drag || !activeSlideId) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const dx = ((e.clientX - drag.startX) / rect.width) * 100;
      const dy = ((e.clientY - drag.startY) / rect.height) * 100;

      if (drag.mode === 'move') {
        updateContent(activeSlideId, drag.contentId, {
          x: Math.max(0, Math.min(100 - drag.origW, drag.origX + dx)),
          y: Math.max(0, Math.min(100 - drag.origH, drag.origY + dy)),
        });
      } else {
        updateContent(activeSlideId, drag.contentId, {
          width: Math.max(5, drag.origW + dx),
          height: Math.max(5, drag.origH + dy),
        });
      }
    };

    const handleMouseUp = () => setDrag(null);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [drag, activeSlideId, updateContent]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-zone')) {
      setSelectedContent(null);
      setEditingId(null);
    }
  };

  const handleDoubleClick = (contentId: string) => {
    const content = activeSlide?.contents.find((c) => c.id === contentId);
    if (content?.type === 'text') {
      setEditingId(contentId);
    }
  };

  const handleTextBlur = (contentId: string, newText: string) => {
    if (activeSlideId) {
      const content = activeSlide?.contents.find((c) => c.id === contentId);
      if (content) {
        updateContent(activeSlideId, contentId, {
          props: { ...content.props, text: newText } as TextProps,
        });
      }
    }
    setEditingId(null);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedContentId && activeSlideId && editingId !== selectedContentId) {
          e.preventDefault();
          useProjectStore.getState().removeContent(activeSlideId, selectedContentId);
        }
      }
      if (e.key === 'Escape') {
        setSelectedContent(null);
        setEditingId(null);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedContentId, activeSlideId, editingId, setSelectedContent]);

  if (!activeSlide) {
    return (
      <div className="canvas-empty">
        <div className="canvas-empty-icon">+</div>
        <p>슬라이드를 선택하거나 추가하세요</p>
      </div>
    );
  }

  return (
    <div className="canvas-wrapper">
      <div
        ref={canvasRef}
        className="slide-canvas"
        style={{
          aspectRatio: `${project.screen.widthPx} / ${project.screen.heightPx}`,
          background: activeSlide.backgroundColor || kv.gradientCss || kv.backgroundColor,
          fontFamily: kv.fontFamily,
          color: kv.primaryColor,
        }}
        onClick={handleCanvasClick}
      >
        {project.layout.zones.map((zone) => (
          <div
            key={zone.id}
            className="canvas-zone"
            style={{
              position: 'absolute',
              left: `${zone.x}%`,
              top: `${zone.y}%`,
              width: `${zone.width}%`,
              height: `${zone.height}%`,
            }}
          >
            <span className="canvas-zone-label">{zone.label}</span>
          </div>
        ))}

        {activeSlide.contents.map((content) => (
          <div
            key={content.id}
            onMouseDown={(e) => handleMouseDown(e, content, 'move')}
            onDoubleClick={() => handleDoubleClick(content.id)}
            onBlur={(e) => {
              if (editingId === content.id) {
                handleTextBlur(content.id, e.currentTarget.textContent || '');
              }
            }}
          >
            {renderContent(content, selectedContentId === content.id, editingId === content.id)}
            {selectedContentId === content.id && (
              <div
                className="resize-handle"
                style={{
                  position: 'absolute',
                  left: `${content.x + content.width}%`,
                  top: `${content.y + content.height}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onMouseDown={(e) => handleMouseDown(e, content, 'resize')}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
