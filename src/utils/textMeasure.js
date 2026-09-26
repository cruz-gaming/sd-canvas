/**
 * Text measurement, wrapping, and formatting utilities
 * Stacks Development (SD)
 */

/**
 * Build a valid CSS font shorthand string
 * @param {object} options
 * @param {number} [options.fontSize=16]
 * @param {string} [options.fontFamily='sans-serif']
 * @param {string|number} [options.fontWeight='normal']
 * @param {string} [options.fontStyle='normal']
 * @param {string} [options.font] - If direct font string provided
 * @returns {string}
 */
export function buildFontString(options = {}) {
  if (options.font) {
    return options.font;
  }

  const style = options.fontStyle || options.style || 'normal';
  const weight = options.fontWeight || options.weight || 'normal';
  const size = typeof options.fontSize === 'number' ? `${options.fontSize}px` : (options.fontSize || '16px');
  const family = options.fontFamily || options.family || 'sans-serif';

  // Format: [style] [weight] [size] [family]
  return `${style !== 'normal' ? style + ' ' : ''}${weight !== 'normal' ? weight + ' ' : ''}${size} ${family}`.trim();
}

/**
 * Measure single line width using ctx.measureText
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} [letterSpacing=0]
 * @returns {number}
 */
export function measureTextWidth(ctx, text, letterSpacing = 0) {
  if (!text) return 0;
  const metrics = ctx.measureText(text);
  const baseWidth = metrics.width;
  if (letterSpacing && text.length > 1) {
    return baseWidth + (text.length - 1) * letterSpacing;
  }
  return baseWidth;
}

/**
 * Apply ellipsis to text if it exceeds maxWidth
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} maxWidth
 * @param {string} [ellipsisStr='...']
 * @param {number} [letterSpacing=0]
 * @returns {string}
 */
export function applyEllipsis(ctx, text, maxWidth, ellipsisStr = '...', letterSpacing = 0) {
  if (!maxWidth || maxWidth <= 0 || !text) return text;

  const currentWidth = measureTextWidth(ctx, text, letterSpacing);
  if (currentWidth <= maxWidth) return text;

  const ellWidth = measureTextWidth(ctx, ellipsisStr, letterSpacing);
  if (ellWidth >= maxWidth) return ellipsisStr;

  let low = 0;
  let high = text.length;
  let best = '';

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const candidate = text.slice(0, mid) + ellipsisStr;
    const w = measureTextWidth(ctx, candidate, letterSpacing);

    if (w <= maxWidth) {
      best = candidate;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return best || ellipsisStr;
}

/**
 * Wrap text into multiple lines respecting maxWidth
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} maxWidth
 * @param {object} [options={}]
 * @param {boolean|string} [options.wrap=true]
 * @param {boolean|string} [options.ellipsis=false]
 * @param {number} [options.maxLines=Infinity]
 * @param {number} [options.letterSpacing=0]
 * @returns {string[]}
 */
export function wrapText(ctx, text, maxWidth, options = {}) {
  if (!text) return [];

  const rawParagraphs = String(text).split('\n');
  if (!maxWidth || maxWidth <= 0 || !options.wrap) {
    return rawParagraphs;
  }

  const {
    maxLines = Infinity,
    ellipsis = false,
    letterSpacing = 0
  } = options;

  const ellipsisStr = typeof ellipsis === 'string' ? ellipsis : '...';
  const lines = [];

  for (const paragraph of rawParagraphs) {
    if (lines.length >= maxLines) break;

    const words = paragraph.split(' ');
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = measureTextWidth(ctx, testLine, letterSpacing);

      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (!currentLine) {
          // A single word is longer than maxWidth; wrap by character
          let charLine = '';
          for (let c = 0; c < word.length; c++) {
            const charTest = charLine + word[c];
            if (measureTextWidth(ctx, charTest, letterSpacing) <= maxWidth) {
              charLine = charTest;
            } else {
              lines.push(charLine);
              if (lines.length >= maxLines) break;
              charLine = word[c];
            }
          }
          currentLine = charLine;
        } else {
          lines.push(currentLine);
          if (lines.length >= maxLines) break;
          currentLine = word;
        }
      }
    }

    if (currentLine && lines.length < maxLines) {
      lines.push(currentLine);
    }
  }

  // If exceeded maxLines and ellipsis is enabled, truncate the last line
  if (ellipsis && lines.length >= maxLines) {
    const lastIdx = maxLines - 1;
    lines[lastIdx] = applyEllipsis(ctx, lines[lastIdx], maxWidth, ellipsisStr, letterSpacing);
    return lines.slice(0, maxLines);
  }

  return lines;
}
