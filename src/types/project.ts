import type { ScreenSpec, ScreenLayout } from './screen';
import type { Slide } from './slide';
import type { KeyVisual } from './keyvisual';

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  screen: ScreenSpec;
  layout: ScreenLayout;
  keyVisual: KeyVisual;
  slides: Slide[];
}
