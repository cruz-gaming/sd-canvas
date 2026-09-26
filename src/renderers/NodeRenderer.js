/**
 * Node.js Canvas 2D Renderer
 * Stacks Development (SD)
 * Design Once. Render Everywhere.
 */

import { createCanvas, Path2D } from '@napi-rs/canvas';
import { Renderer } from './Renderer.js';
import { RenderError } from '../errors/index.js';
import { defaultImageManager } from '../images/ImageManager.js';
import { buildFontString, wrapText, applyEllipsis } from '../utils/textMeasure.js';
import { isGradient, calculateLinearGradientCoords, normalizeStops } from '../utils/color.js';

export class NodeRenderer extends Renderer {
  /**
   * @param {object} [options={}]
   * @param {import('../images/ImageManager.js').ImageManager} [options.imageManager]
   */
  constructor(options = {}) {
    super();
    this.imageManager = options.imageManager || defaultImageManager;
  }

  /**
   * Render layout to buffer
   * @param {object} layout
   * @param {object} [options={}]
   * @param {string} [options.format='png'] - 'png', 'jpeg', 'webp'
   * @param {number} [options.quality=0.9] - Compression quality for jpeg/webp
   * @returns {Promise<Buffer>}
   */
  async render(layout, options = {}) {
    try {
      const width = Math.max(1, Math.round(layout.width || 1200));
      const height = Math.max(1, Math.round(layout.height || 500));

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // 1. Render background
      await this.drawBackground(ctx, layout.background, width, height);

      // 2. Sort elements by zIndex
      const sortedElements = this.sortElements(layout.elements);

      // 3. Preload all images concurrently for performance
      await this.preloadImages(sortedElements);

      // 4. Render elements in order
      for (const el of sortedElements) {
        await this.drawElement(ctx, el);
      }

      // 5. Output buffer
      const format = (options.format || 'png').toLowerCase();
      switch (format) {
        case 'jpeg':
        case 'jpg':
          return canvas.toBuffer('image/jpeg', options.quality != null ? Math.round(options.quality * 100) : 90);
        case 'webp':
          return canvas.toBuffer('image/webp', options.quality != null ? Math.round(options.quality * 100) : 90);
        case 'png':
        default:
          return canvas.toBuffer('image/png');
      }
    } catch (err) {
      if (err instanceof RenderError) throw err;
      throw new RenderError(`NodeRenderer failed to render canvas: ${err.message}`, { cause: err });
    }
  }

  /**
   * Preload all images in the layout
   */
  async preloadImages(elements) {
    const imageLoadPromises = [];

    for (const el of elements) {
      if (el.type === 'image' && el.src) {
        imageLoadPromises.push(
          this.imageManager.load(el.src).catch(err => {
            // Log or retain error, will be thrown during draw if critical
            return null;
          })
        );
      }
    }

    if (imageLoadPromises.length > 0) {
      await Promise.all(imageLoadPromises);
    }
  }

  /**
   * Draw canvas background
   */
  async drawBackground(ctx, bg, width, height) {
    if (!bg) return;

    ctx.save();

    if (typeof bg === 'string') {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);
    } else if (typeof bg === 'object') {
      if (bg.type === 'gradient' || bg.type === 'linear' || bg.type === 'radial' || bg.colors || bg.stops) {
        ctx.fillStyle = this.createCanvasGradient(ctx, bg, { x: 0, y: 0, width, height });
        ctx.fillRect(0, 0, width, height);
      } else if (bg.type === 'image' && bg.src) {
        const { image } = await this.imageManager.load(bg.src);
        ctx.drawImage(image, 0, 0, width, height);
      } else if (bg.color) {
        ctx.fillStyle = bg.color;
        ctx.fillRect(0, 0, width, height);
      }
    }

    ctx.restore();
  }

  /**
   * Draw a single element
   */
  async drawElement(ctx, el) {
    ctx.save();

    // Opacity
    if (el.opacity != null && el.opacity < 1) {
      ctx.globalAlpha = Math.max(0, Math.min(1, el.opacity));
    }

    // Rotation
    if (el.rotation) {
      const cx = el.x + (el.width || 0) / 2;
      const cy = el.y + (el.height || 0) / 2;
      ctx.translate(cx, cy);
      ctx.rotate((el.rotation * Math.PI) / 180);
      ctx.translate(-cx, -cy);
    }

    // Apply shadow if present
    this.applyShadow(ctx, el);

    const type = (el.type || '').toLowerCase();

    switch (type) {
      case 'text':
        await this.drawText(ctx, el);
        break;
      case 'image':
        await this.drawImage(ctx, el);
        break;
      case 'rectangle':
      case 'rect':
        await this.drawRectangle(ctx, el);
        break;
      case 'circle':
        await this.drawCircle(ctx, el);
        break;
      case 'line':
        await this.drawLine(ctx, el);
        break;
      case 'gradient':
        await this.drawGradientElement(ctx, el);
        break;
      case 'shape':
      case 'path':
        await this.drawShape(ctx, el);
        break;
    }

    ctx.restore();
  }

  /**
   * Apply drop shadow properties to context
   */
  applyShadow(ctx, el) {
    if (el.shadowColor) {
      ctx.shadowColor = el.shadowColor;
      ctx.shadowBlur = el.shadowBlur || 0;
      ctx.shadowOffsetX = el.shadowOffsetX || 0;
      ctx.shadowOffsetY = el.shadowOffsetY || 0;
    }
  }

  /**
   * Draw text element
   */
  async drawText(ctx, el) {
    const text = el.text != null ? String(el.text) : '';
    if (!text) return;

    ctx.font = buildFontString(el);
    ctx.textAlign = el.align || 'left';
    ctx.textBaseline = el.baseline || 'top';

    // Fill style (color or gradient)
    if (isGradient(el.color)) {
      const bounds = {
        x: el.x,
        y: el.y,
        width: el.maxWidth || 200,
        height: el.fontSize || 24
      };
      ctx.fillStyle = this.createCanvasGradient(ctx, el.color, bounds);
    } else {
      ctx.fillStyle = el.color || '#ffffff';
    }

    // Stroke style
    if (el.strokeColor && el.strokeWidth > 0) {
      ctx.strokeStyle = el.strokeColor;
      ctx.lineWidth = el.strokeWidth;
    }

    const fontSize = typeof el.fontSize === 'number' ? el.fontSize : 16;
    const lineHeight = el.lineHeight ?? fontSize * 1.25;

    // Calculate lines (wrapping / ellipsis)
    let lines = [text];
    if (el.wrap || (el.maxWidth && el.ellipsis)) {
      lines = wrapText(ctx, text, el.maxWidth, {
        wrap: el.wrap,
        ellipsis: el.ellipsis,
        maxLines: el.maxLines,
        letterSpacing: el.letterSpacing
      });
    } else if (el.maxWidth && !el.wrap) {
      lines = [applyEllipsis(ctx, text, el.maxWidth, '...', el.letterSpacing)];
    }

    let curY = el.y;

    for (const line of lines) {
      if (el.letterSpacing && el.letterSpacing > 0) {
        this.drawTextWithLetterSpacing(ctx, line, el.x, curY, el.letterSpacing, Boolean(el.strokeColor && el.strokeWidth > 0));
      } else {
        ctx.fillText(line, el.x, curY);
        if (el.strokeColor && el.strokeWidth > 0) {
          ctx.strokeText(line, el.x, curY);
        }
      }
      curY += lineHeight;
    }
  }

  /**
   * Draw text line with custom letter spacing
   */
  drawTextWithLetterSpacing(ctx, text, x, y, letterSpacing, hasStroke) {
    let curX = x;
    const align = ctx.textAlign;

    // Adjust start x if aligned center or right
    if (align === 'center' || align === 'right') {
      const totalWidth = ctx.measureText(text).width + (text.length - 1) * letterSpacing;
      if (align === 'center') curX -= totalWidth / 2;
      else if (align === 'right') curX -= totalWidth;
      ctx.textAlign = 'left';
    }

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      ctx.fillText(ch, curX, y);
      if (hasStroke) {
        ctx.strokeText(ch, curX, y);
      }
      curX += ctx.measureText(ch).width + letterSpacing;
    }

    ctx.textAlign = align;
  }

  /**
   * Draw image element with clipping, fit, borders, and shadows
   */
  async drawImage(ctx, el) {
    if (!el.src) return;

    const { image } = await this.imageManager.load(el.src);
    const x = el.x;
    const y = el.y;
    const w = el.width || image.width;
    const h = el.height || image.height;

    ctx.save();

    // Clipping path (circle or rounded rectangle)
    if (el.circle) {
      const radius = Math.min(w, h) / 2;
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
    } else if (el.radius) {
      this.buildRoundedRectPath(ctx, x, y, w, h, el.radius);
      ctx.clip();
    }

    // Source crop or fit calculations
    let sx = 0, sy = 0, sw = image.width, sh = image.height;

    if (el.crop) {
      sx = el.crop.x ?? 0;
      sy = el.crop.y ?? 0;
      sw = el.crop.width ?? (image.width - sx);
      sh = el.crop.height ?? (image.height - sy);
    } else if (el.fit === 'cover') {
      const imgRatio = image.width / image.height;
      const targetRatio = w / h;
      if (imgRatio > targetRatio) {
        sh = image.height;
        sw = image.height * targetRatio;
        sx = (image.width - sw) / 2;
        sy = 0;
      } else {
        sw = image.width;
        sh = image.width / targetRatio;
        sx = 0;
        sy = (image.height - sh) / 2;
      }
    } else if (el.fit === 'contain') {
      const imgRatio = image.width / image.height;
      const targetRatio = w / h;
      let dw = w;
      let dh = h;
      let dx = x;
      let dy = y;

      if (imgRatio > targetRatio) {
        dh = w / imgRatio;
        dy = y + (h - dh) / 2;
      } else {
        dw = h * imgRatio;
        dx = x + (w - dw) / 2;
      }

      ctx.drawImage(image, 0, 0, image.width, image.height, dx, dy, dw, dh);
      ctx.restore();
      this.drawImageBorder(ctx, el, x, y, w, h);
      return;
    }

    ctx.drawImage(image, sx, sy, sw, sh, x, y, w, h);
    ctx.restore();

    // Draw border around image if configured
    this.drawImageBorder(ctx, el, x, y, w, h);
  }

  /**
   * Draw border for image
   */
  drawImageBorder(ctx, el, x, y, w, h) {
    if (el.borderColor && el.borderWidth > 0) {
      ctx.save();
      ctx.strokeStyle = el.borderColor;
      ctx.lineWidth = el.borderWidth;

      if (el.circle) {
        const radius = Math.min(w, h) / 2;
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (el.radius) {
        this.buildRoundedRectPath(ctx, x, y, w, h, el.radius);
        ctx.stroke();
      } else {
        ctx.strokeRect(x, y, w, h);
      }
      ctx.restore();
    }
  }

  /**
   * Draw rectangle element
   */
  async drawRectangle(ctx, el) {
    const { x, y, width, height, radius } = el;

    ctx.beginPath();
    if (radius) {
      this.buildRoundedRectPath(ctx, x, y, width, height, radius);
    } else {
      ctx.rect(x, y, width, height);
    }

    // Fill
    if (el.fill && el.fill !== 'none' && el.fill !== 'transparent') {
      if (isGradient(el.fill)) {
        ctx.fillStyle = this.createCanvasGradient(ctx, el.fill, { x, y, width, height });
      } else {
        ctx.fillStyle = el.fill;
      }
      ctx.fill();
    }

    // Stroke
    if (el.stroke && el.strokeWidth > 0) {
      ctx.strokeStyle = el.stroke;
      ctx.lineWidth = el.strokeWidth;
      ctx.stroke();
    }
  }

  /**
   * Draw circle element
   */
  async drawCircle(ctx, el) {
    const radius = el.radius ?? (el.width ? el.width / 2 : 25);
    const cx = el.cx ?? (el.x != null ? el.x + radius : radius);
    const cy = el.cy ?? (el.y != null ? el.y + radius : radius);

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);

    if (el.fill && el.fill !== 'none' && el.fill !== 'transparent') {
      if (isGradient(el.fill)) {
        ctx.fillStyle = this.createCanvasGradient(ctx, el.fill, {
          x: cx - radius,
          y: cy - radius,
          width: radius * 2,
          height: radius * 2
        });
      } else {
        ctx.fillStyle = el.fill;
      }
      ctx.fill();
    }

    if (el.stroke && el.strokeWidth > 0) {
      ctx.strokeStyle = el.stroke;
      ctx.lineWidth = el.strokeWidth;
      ctx.stroke();
    }
  }

  /**
   * Draw line element
   */
  async drawLine(ctx, el) {
    const x1 = el.x1 ?? el.from?.x ?? 0;
    const y1 = el.y1 ?? el.from?.y ?? 0;
    const x2 = el.x2 ?? el.to?.x ?? 0;
    const y2 = el.y2 ?? el.to?.y ?? 0;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);

    ctx.strokeStyle = el.color || el.stroke || '#ffffff';
    ctx.lineWidth = el.width || 1;
    ctx.lineCap = el.cap || 'butt';

    if (el.dash && Array.isArray(el.dash)) {
      ctx.setLineDash(el.dash);
    }

    ctx.stroke();
  }

  /**
   * Draw gradient element directly
   */
  async drawGradientElement(ctx, el) {
    const x = el.x ?? 0;
    const y = el.y ?? 0;
    const width = el.width ?? 100;
    const height = el.height ?? 100;

    ctx.beginPath();
    if (el.radius) {
      this.buildRoundedRectPath(ctx, x, y, width, height, el.radius);
    } else {
      ctx.rect(x, y, width, height);
    }

    ctx.fillStyle = this.createCanvasGradient(ctx, el, { x, y, width, height });
    ctx.fill();
  }

  /**
   * Draw custom shape / SVG path
   */
  async drawShape(ctx, el) {
    if (typeof el.draw === 'function') {
      el.draw(ctx);
      return;
    }

    if (el.path) {
      const p = new Path2D(el.path);

      if (el.fill && el.fill !== 'none') {
        ctx.fillStyle = isGradient(el.fill)
          ? this.createCanvasGradient(ctx, el.fill, { x: el.x, y: el.y, width: el.width || 100, height: el.height || 100 })
          : el.fill;
        ctx.fill(p);
      }

      if (el.stroke && el.strokeWidth > 0) {
        ctx.strokeStyle = el.stroke;
        ctx.lineWidth = el.strokeWidth;
        ctx.stroke(p);
      }
    }
  }

  /**
   * Helper to build rounded rectangle path
   */
  buildRoundedRectPath(ctx, x, y, width, height, radius) {
    if (ctx.roundRect) {
      ctx.roundRect(x, y, width, height, radius);
      return;
    }

    // Cross-platform manual rounded rectangle fallback
    let tl = 0, tr = 0, br = 0, bl = 0;
    if (typeof radius === 'number') {
      tl = tr = br = bl = Math.min(radius, width / 2, height / 2);
    } else if (Array.isArray(radius)) {
      [tl, tr, br, bl] = radius;
    }

    ctx.beginPath();
    ctx.moveTo(x + tl, y);
    ctx.lineTo(x + width - tr, y);
    ctx.arcTo(x + width, y, x + width, y + tr, tr);
    ctx.lineTo(x + width, y + height - br);
    ctx.arcTo(x + width, y + height, x + width - br, y + height, br);
    ctx.lineTo(x + bl, y + height);
    ctx.arcTo(x, y + height, x, y + height - bl, bl);
    ctx.lineTo(x, y + tl);
    ctx.arcTo(x, y, x + tl, y, tl);
    ctx.closePath();
  }

  /**
   * Create CanvasGradient from config
   */
  createCanvasGradient(ctx, gradConfig, bounds) {
    const isRadial = gradConfig.type === 'radial' || gradConfig.gradientType === 'radial';

    let gradient;
    if (isRadial) {
      const cx = gradConfig.cx ?? (bounds.x + bounds.width / 2);
      const cy = gradConfig.cy ?? (bounds.y + bounds.height / 2);
      const r0 = gradConfig.r0 ?? 0;
      const r1 = gradConfig.r1 ?? gradConfig.radius ?? Math.max(bounds.width, bounds.height) / 2;
      gradient = ctx.createRadialGradient(cx, cy, r0, cx, cy, r1);
    } else {
      const coords = calculateLinearGradientCoords(gradConfig, bounds);
      gradient = ctx.createLinearGradient(coords.x1, coords.y1, coords.x2, coords.y2);
    }

    const stops = normalizeStops(gradConfig.stops || gradConfig.colors);
    for (const stop of stops) {
      gradient.addColorStop(Math.max(0, Math.min(1, stop.offset)), stop.color);
    }

    return gradient;
  }
}

export default NodeRenderer;
