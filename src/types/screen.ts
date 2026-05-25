export interface ScreenSpec {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  widthPx: number;
  heightPx: number;
  aspectRatio: string;
}

export interface ScreenZone {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ScreenLayout {
  id: string;
  name: string;
  zones: ScreenZone[];
}
