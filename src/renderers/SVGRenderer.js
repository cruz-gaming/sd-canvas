/**
 * SVG Vector Renderer
 * Stacks Development (SD)
 * Design Once. Render Everywhere.
 */

import { Renderer } from './Renderer.js';
import { RenderError } from '../errors/index.js';
import { defaultImageManager } from '../images/ImageManager.js';
import { isGradient, calculateLinearGradientCoords, normalizeStops } from '../utils/color.js';

export class SVGRenderer extends Renderer {
  /**
   * @param {object} [options={}]
   * @param {import('../images/ImageManager.js').ImageManager} [options.imageManager]
   */
  constructor(options = {}) {
    super();
    this.imageManager = options.imageManager || defaultImageManager;
    this.gradientCounter = 0;
    this.clipCounter = 0;
    this.filterCounter = 0;
  }

  /**
   * Render layout to SVG string or Buffer
   * @param {object} layout
   * @param {object} [options={}]
   * @param {boolean} [options.asBuffer=false]
   * @returns {Promise<string | Buffer>}
   */
  async render(layout, options = {}) {
    try {
      this.gradientCounter = 0;
      this.clipCounter = 0;
      this.filterCounter = 0;

      const width = Math.max(1, Math.round(layout.width || 1200));
      const height = Math.max(1, Math.round(layout.height || 500));

      const defs = [];
      const bodyElements = [];

      // 1. Render background
      await this.renderBackground(layout.background, width, height, defs, bodyElements);

      // 2. Sort elements
      const sortedElements = this.sortElements(layout.elements);

      // 3. Render each element
      for (const el of sortedElements) {
        await this.renderElement(el, defs, bodyElements);
      }

      const defsBlock = defs.length > 0 ? `  <defs>\n${defs.join('\n')}\n  </defs>\n` : '';

      const svg = [
        `<?xml version="1.0" encoding="UTF-8"?>`,
        `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`,
        defsBlock,
        bodyElements.join('\n'),
        `</svg>`
      ].filter(Boolean).join('\n');

      if (options.asBuffer || options.format === 'buffer') {
        return Buffer.from(svg, 'utf-8');
      }

      return svg;
    } catch (err) {
      if (err instanceof RenderError) throw err;
      throw new RenderError(`SVGRenderer failed to render SVG: ${err.message}`, { cause: err });
    }
  }

  /**
   * Render background
   */
  async renderBackground(bg, width, height, defs, bodyElements) {
    if (!bg) return;

    if (typeof bg === 'string') {
      bodyElements.push(`  <rect width="${width}" height="${height}" fill="${escapeXml(bg)}" />`);
    } else if (typeof bg === 'object') {
      if (bg.type === 'gradient' || bg.type === 'linear' || bg.type === 'radial' || bg.colors || bg.stops) {
        const gradId = this.createGradientDef(bg, { x: 0, y: 0, width, height }, defs);
        bodyElements.push(`  <rect width="${width}" height="${height}" fill="url(#${gradId})" />`);
      } else if (bg.type === 'image' && bg.src) {
        const href = await this.resolveImageHref(bg.src);
        bodyElements.push(`  <image href="${escapeXml(href)}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" />`);
      } else if (bg.color) {
        bodyElements.push(`  <rect width="${width}" height="${height}" fill="${escapeXml(bg.color)}" />`);
      }
    }
  }

  /**
   * Render single element
   */
  async renderElement(el, defs, bodyElements) {
    const type = (el.type || '').toLowerCase();
    const opacityAttr = el.opacity != null && el.opacity < 1 ? ` opacity="${el.opacity}"` : '';

    // Transform (rotation)
    let transformAttr = '';
    if (el.rotation) {
      const cx = el.x + (el.width || 0) / 2;
      const cy = el.y + (el.height || 0) / 2;
      transformAttr = ` transform="rotate(${el.rotation}, ${cx}, ${cy})"`;
    }

    // Shadow filter
    let filterAttr = '';
    if (el.shadowColor) {
      const filterId = this.createShadowFilter(el, defs);
      filterAttr = ` filter="url(#${filterId})"`;
    }

    const commonAttrs = `${opacityAttr}${transformAttr}${filterAttr}`;

    switch (type) {
      case 'text':
        await this.renderText(el, defs, bodyElements, commonAttrs);
        break;
      case 'image':
        await this.renderImage(el, defs, bodyElements, commonAttrs);
        break;
      case 'rectangle':
      case 'rect':
        this.renderRectangle(el, defs, bodyElements, commonAttrs);
        break;
      case 'circle':
        this.renderCircle(el, defs, bodyElements, commonAttrs);
        break;
      case 'line':
        this.renderLine(el, bodyElements, commonAttrs);
        break;
      case 'gradient':
        this.renderGradientElement(el, defs, bodyElements, commonAttrs);
        break;
      case 'shape':
      case 'path':
        this.renderShape(el, defs, bodyElements, commonAttrs);
        break;
    }
  }

  /**
   * Text rendering with multi-line support
   */
  async renderText(el, defs, bodyElements, commonAttrs) {
    const text = el.text != null ? String(el.text) : '';
    if (!text) return;

    let fillAttr = ' fill="#ffffff"';
    if (isGradient(el.color)) {
      const gradId = this.createGradientDef(el.color, {
        x: el.x,
        y: el.y,
        width: el.maxWidth || 200,
        height: el.fontSize || 24
      }, defs);
      fillAttr = ` fill="url(#${gradId})"`;
    } else if (el.color) {
      fillAttr = ` fill="${escapeXml(el.color)}"`;
    }

    let strokeAttr = '';
    if (el.strokeColor && el.strokeWidth > 0) {
      strokeAttr = ` stroke="${escapeXml(el.strokeColor)}" stroke-width="${el.strokeWidth}"`;
    }

    // Alignment
    let anchor = 'start';
    if (el.align === 'center') anchor = 'middle';
    else if (el.align === 'right') anchor = 'end';

    const fontSize = el.fontSize || 16;
    const fontFamily = el.fontFamily || 'sans-serif';
    const fontWeight = el.fontWeight || 'normal';
    const fontStyle = el.fontStyle || 'normal';
    const letterSpacing = el.letterSpacing ? ` letter-spacing="${el.letterSpacing}px"` : '';

    // Dominant baseline
    let dominantBaseline = 'hanging';
    if (el.baseline === 'middle') dominantBaseline = 'central';
    else if (el.baseline === 'bottom') dominantBaseline = 'auto';

    // Break lines if needed
    const lines = text.split('\n');
    const lineHeight = el.lineHeight ?? fontSize * 1.25;

    if (lines.length === 1) {
      bodyElements.push(
        `  <text x="${el.x}" y="${el.y}" font-family="${escapeXml(fontFamily)}" font-size="${fontSize}px" font-weight="${fontWeight}" font-style="${fontStyle}" text-anchor="${anchor}" dominant-baseline="${dominantBaseline}"${fillAttr}${strokeAttr}${letterSpacing}${commonAttrs}>${escapeXml(text)}</text>`
      );
    } else {
      const tspans = lines.map((line, idx) => {
        const dy = idx === 0 ? 0 : lineHeight;
        return `<tspan x="${el.x}" dy="${dy}">${escapeXml(line)}</tspan>`;
      }).join('');

      bodyElements.push(
        `  <text x="${el.x}" y="${el.y}" font-family="${escapeXml(fontFamily)}" font-size="${fontSize}px" font-weight="${fontWeight}" font-style="${fontStyle}" text-anchor="${anchor}" dominant-baseline="${dominantBaseline}"${fillAttr}${strokeAttr}${letterSpacing}${commonAttrs}>${tspans}</text>`
      );
    }
  }

  /**
   * Image rendering with clip-path for round corners / circles
   */
  async renderImage(el, defs, bodyElements, commonAttrs) {
    if (!el.src) return;

    const href = await this.resolveImageHref(el.src);
    const x = el.x;
    const y = el.y;
    const w = el.width || 100;
    const h = el.height || 100;

    let clipAttr = '';

    if (el.circle) {
      const clipId = `clip-circle-${++this.clipCounter}`;
      const radius = Math.min(w, h) / 2;
      defs.push(`    <clipPath id="${clipId}">\n      <circle cx="${x + w / 2}" cy="${y + h / 2}" r="${radius}" />\n    </clipPath>`);
      clipAttr = ` clip-path="url(#${clipId})"`;
    } else if (el.radius) {
      const clipId = `clip-rect-${++this.clipCounter}`;
      defs.push(`    <clipPath id="${clipId}">\n      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${el.radius}" ry="${el.radius}" />\n    </clipPath>`);
      clipAttr = ` clip-path="url(#${clipId})"`;
    }

    let aspect = 'none';
    if (el.fit === 'cover') aspect = 'xMidYMid slice';
    else if (el.fit === 'contain') aspect = 'xMidYMid meet';

    bodyElements.push(`  <image href="${escapeXml(href)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="${aspect}"${clipAttr}${commonAttrs} />`);

    // Image border
    if (el.borderColor && el.borderWidth > 0) {
      if (el.circle) {
        const radius = Math.min(w, h) / 2;
        bodyElements.push(`  <circle cx="${x + w / 2}" cy="${y + h / 2}" r="${radius}" fill="none" stroke="${escapeXml(el.borderColor)}" stroke-width="${el.borderWidth}" />`);
      } else if (el.radius) {
        bodyElements.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${el.radius}" ry="${el.radius}" fill="none" stroke="${escapeXml(el.borderColor)}" stroke-width="${el.borderWidth}" />`);
      } else {
        bodyElements.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${escapeXml(el.borderColor)}" stroke-width="${el.borderWidth}" />`);
      }
    }
  }

  /**
   * Rectangle rendering
   */
  renderRectangle(el, defs, bodyElements, commonAttrs) {
    let fillAttr = ' fill="none"';
    if (isGradient(el.fill)) {
      const gradId = this.createGradientDef(el.fill, { x: el.x, y: el.y, width: el.width, height: el.height }, defs);
      fillAttr = ` fill="url(#${gradId})"`;
    } else if (el.fill && el.fill !== 'none' && el.fill !== 'transparent') {
      fillAttr = ` fill="${escapeXml(el.fill)}"`;
    }

    let strokeAttr = '';
    if (el.stroke && el.strokeWidth > 0) {
      strokeAttr = ` stroke="${escapeXml(el.stroke)}" stroke-width="${el.strokeWidth}"`;
    }

    const rx = el.radius ? ` rx="${el.radius}" ry="${el.radius}"` : '';

    bodyElements.push(`  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}"${rx}${fillAttr}${strokeAttr}${commonAttrs} />`);
  }

  /**
   * Circle rendering
   */
  renderCircle(el, defs, bodyElements, commonAttrs) {
    const radius = el.radius ?? (el.width ? el.width / 2 : 25);
    const cx = el.cx ?? (el.x != null ? el.x + radius : radius);
    const cy = el.cy ?? (el.y != null ? el.y + radius : radius);

    let fillAttr = ' fill="none"';
    if (isGradient(el.fill)) {
      const gradId = this.createGradientDef(el.fill, { x: cx - radius, y: cy - radius, width: radius * 2, height: radius * 2 }, defs);
      fillAttr = ` fill="url(#${gradId})"`;
    } else if (el.fill && el.fill !== 'none' && el.fill !== 'transparent') {
      fillAttr = ` fill="${escapeXml(el.fill)}"`;
    }

    let strokeAttr = '';
    if (el.stroke && el.strokeWidth > 0) {
      strokeAttr = ` stroke="${escapeXml(el.stroke)}" stroke-width="${el.strokeWidth}"`;
    }

    bodyElements.push(`  <circle cx="${cx}" cy="${cy}" r="${radius}"${fillAttr}${strokeAttr}${commonAttrs} />`);
  }

  /**
   * Line rendering
   */
  renderLine(el, bodyElements, commonAttrs) {
    const x1 = el.x1 ?? el.from?.x ?? 0;
    const y1 = el.y1 ?? el.from?.y ?? 0;
    const x2 = el.x2 ?? el.to?.x ?? 0;
    const y2 = el.y2 ?? el.to?.y ?? 0;

    const strokeColor = el.color || el.stroke || '#ffffff';
    const strokeWidth = el.width || 1;
    const strokeCap = el.cap ? ` stroke-linecap="${el.cap}"` : '';
    const dash = el.dash && Array.isArray(el.dash) ? ` stroke-dasharray="${el.dash.join(' ')}"` : '';

    bodyElements.push(`  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${escapeXml(strokeColor)}" stroke-width="${strokeWidth}"${strokeCap}${dash}${commonAttrs} />`);
  }

  /**
   * Gradient element rendering
   */
  renderGradientElement(el, defs, bodyElements, commonAttrs) {
    const x = el.x ?? 0;
    const y = el.y ?? 0;
    const width = el.width ?? 100;
    const height = el.height ?? 100;

    const gradId = this.createGradientDef(el, { x, y, width, height }, defs);
    const rx = el.radius ? ` rx="${el.radius}" ry="${el.radius}"` : '';

    bodyElements.push(`  <rect x="${x}" y="${y}" width="${width}" height="${height}"${rx} fill="url(#${gradId})"${commonAttrs} />`);
  }

  /**
   * Path / custom shape rendering
   */
  renderShape(el, defs, bodyElements, commonAttrs) {
    if (!el.path) return;

    let fillAttr = ' fill="none"';
    if (isGradient(el.fill)) {
      const gradId = this.createGradientDef(el.fill, { x: el.x || 0, y: el.y || 0, width: el.width || 100, height: el.height || 100 }, defs);
      fillAttr = ` fill="url(#${gradId})"`;
    } else if (el.fill && el.fill !== 'none') {
      fillAttr = ` fill="${escapeXml(el.fill)}"`;
    }

    let strokeAttr = '';
    if (el.stroke && el.strokeWidth > 0) {
      strokeAttr = ` stroke="${escapeXml(el.stroke)}" stroke-width="${el.strokeWidth}"`;
    }

    bodyElements.push(`  <path d="${escapeXml(el.path)}"${fillAttr}${strokeAttr}${commonAttrs} />`);
  }

  /**
   * Create SVG linear or radial gradient definition
   */
  createGradientDef(grad, bounds, defs) {
    const gradId = `grad-${++this.gradientCounter}`;
    const isRadial = grad.type === 'radial' || grad.gradientType === 'radial';

    const stops = normalizeStops(grad.stops || grad.colors);
    const stopTags = stops.map(s => {
      const offsetPercent = Math.round(s.offset * 100);
      return `      <stop offset="${offsetPercent}%" stop-color="${escapeXml(s.color)}" />`;
    }).join('\n');

    if (isRadial) {
      defs.push([
        `    <radialGradient id="${gradId}" cx="50%" cy="50%" r="50%">`,
        stopTags,
        `    </radialGradient>`
      ].join('\n'));
    } else {
      const coords = calculateLinearGradientCoords(grad, bounds);
      const x1Pct = Math.round(((coords.x1 - bounds.x) / (bounds.width || 1)) * 100);
      const y1Pct = Math.round(((coords.y1 - bounds.y) / (bounds.height || 1)) * 100);
      const x2Pct = Math.round(((coords.x2 - bounds.x) / (bounds.width || 1)) * 100);
      const y2Pct = Math.round(((coords.y2 - bounds.y) / (bounds.height || 1)) * 100);

      defs.push([
        `    <linearGradient id="${gradId}" x1="${x1Pct}%" y1="${y1Pct}%" x2="${x2Pct}%" y2="${y2Pct}%">`,
        stopTags,
        `    </linearGradient>`
      ].join('\n'));
    }

    return gradId;
  }

  /**
   * Create drop shadow filter def
   */
  createShadowFilter(el, defs) {
    const filterId = `shadow-${++this.filterCounter}`;
    const dx = el.shadowOffsetX || 0;
    const dy = el.shadowOffsetY || 0;
    const blur = (el.shadowBlur || 0) / 2;
    const color = el.shadowColor || 'rgba(0,0,0,0.5)';

    defs.push([
      `    <filter id="${filterId}" x="-50%" y="-50%" width="200%" height="200%">`,
      `      <feDropShadow dx="${dx}" dy="${dy}" stdDeviation="${blur}" flood-color="${escapeXml(color)}" />`,
      `    </filter>`
    ].join('\n'));

    return filterId;
  }

  /**
   * Convert image source to Data URI if local/buffer to ensure self-contained SVG
   */
  async resolveImageHref(src) {
    if (typeof src === 'string' && src.startsWith('data:image/')) {
      return src;
    }

    try {
      const { buffer } = await this.imageManager.load(src);
      // Guess mime type from buffer magic bytes
      let mime = 'image/png';
      if (buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        mime = 'image/jpeg';
      } else if (buffer.length > 3 && buffer.toString('ascii', 0, 4) === 'RIFF') {
        mime = 'image/webp';
      }
      return `data:${mime};base64,${buffer.toString('base64')}`;
    } catch {
      // Fallback to raw string if load fails
      return String(src);
    }
  }
}

function escapeXml(unsafe) {
  if (unsafe == null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default SVGRenderer;
