/**
 * SD Canvas - Universal Rendering Engine
 * Stacks Development (SD)
 * Design Once. Render Everywhere.
 *
 * @module sd-canvas
 */

import { Canvas } from './Canvas.js';
import { Layout } from './Layout.js';
import { Renderer, NodeRenderer, SVGRenderer } from './renderers/index.js';
import { validateLayout } from './validation/validateLayout.js';
import { FontManager, defaultFontManager, registerFont } from './fonts/FontManager.js';
import { ImageManager, defaultImageManager } from './images/ImageManager.js';
import { interpolate } from './templates/interpolate.js';
import {
  registerPreset,
  getPreset,
  hasPreset,
  listPresets,
  createPresetLayout,
  welcomePreset,
  profilePreset,
  levelupPreset,
  rankPreset,
  achievementPreset
} from './presets/index.js';
import {
  SDCanvasError,
  LayoutError,
  RenderError,
  ImageLoadError,
  FontError,
  ValidationError
} from './errors/index.js';
import {
  Element,
  TextElement,
  ImageElement,
  RectangleElement,
  CircleElement,
  LineElement,
  GradientElement,
  ShapeElement,
  createElement
} from './elements/index.js';

export const presets = {
  welcome: welcomePreset,
  profile: profilePreset,
  levelup: levelupPreset,
  rank: rankPreset,
  achievement: achievementPreset
};

export const errors = {
  SDCanvasError,
  LayoutError,
  RenderError,
  ImageLoadError,
  FontError,
  ValidationError
};

export {
  Canvas,
  Layout,
  Renderer,
  NodeRenderer,
  SVGRenderer,
  validateLayout,
  registerFont,
  FontManager,
  defaultFontManager,
  ImageManager,
  defaultImageManager,
  interpolate,
  registerPreset,
  getPreset,
  hasPreset,
  listPresets,
  createPresetLayout,
  SDCanvasError,
  LayoutError,
  RenderError,
  ImageLoadError,
  FontError,
  ValidationError,
  Element,
  TextElement,
  ImageElement,
  RectangleElement,
  CircleElement,
  LineElement,
  GradientElement,
  ShapeElement,
  createElement
};

export default Canvas;
