import { useProjectStore } from '@/stores/projectStore';
import type { SlideContent, TextProps, ImageProps, ShapeProps } from '@/types';

function createTextContent(): SlideContent {
  return {
    id: crypto.randomUUID(),
    type: 'text',
    zoneId: 'main',
    x: 10,
    y: 10,
    width: 40,
    height: 15,
    rotation: 0,
    opacity: 1,
    props: {
      text: '텍스트를 입력하세요',
      fontSize: 32,
      fontWeight: 700,
      textAlign: 'center',
      color: '#ffffff',
    } as TextProps,
  };
}

function createImageContent(): SlideContent {
  return {
    id: crypto.randomUUID(),
    type: 'image',
    zoneId: 'main',
    x: 10,
    y: 10,
    width: 30,
    height: 50,
    rotation: 0,
    opacity: 1,
    props: {
      src: '',
      objectFit: 'cover',
    } as ImageProps,
  };
}

function createShapeContent(shapeType: 'rectangle' | 'circle'): SlideContent {
  return {
    id: crypto.randomUUID(),
    type: 'shape',
    zoneId: 'main',
    x: 10,
    y: 10,
    width: shapeType === 'circle' ? 20 : 30,
    height: shapeType === 'circle' ? 35 : 25,
    rotation: 0,
    opacity: 1,
    props: {
      shapeType,
      fill: 'rgba(79, 140, 255, 0.3)',
      strokeColor: '#4f8cff',
      strokeWidth: 2,
      borderRadius: shapeType === 'rectangle' ? 8 : 0,
    } as ShapeProps,
  };
}

export function ContentToolbar() {
  const { activeSlideId, addContent } = useProjectStore();

  if (!activeSlideId) return null;

  const add = (content: SlideContent) => {
    addContent(activeSlideId, content);
  };

  return (
    <div className="content-toolbar">
      <span className="toolbar-label">콘텐츠 추가</span>
      <button className="toolbar-btn" onClick={() => add(createTextContent())} title="텍스트">
        <span className="toolbar-icon">T</span>
        <span>텍스트</span>
      </button>
      <button className="toolbar-btn" onClick={() => add(createImageContent())} title="이미지">
        <span className="toolbar-icon">&#x1F5BC;</span>
        <span>이미지</span>
      </button>
      <button className="toolbar-btn" onClick={() => add(createShapeContent('rectangle'))} title="사각형">
        <span className="toolbar-icon">&#x25A1;</span>
        <span>사각형</span>
      </button>
      <button className="toolbar-btn" onClick={() => add(createShapeContent('circle'))} title="원형">
        <span className="toolbar-icon">&#x25CB;</span>
        <span>원형</span>
      </button>
    </div>
  );
}
