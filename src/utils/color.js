/**
 * Color and Gradient parsing utilities
 * Stacks Development (SD)
 */

/**
 * Basic check if value is a valid CSS color string or gradient definition
 * @param {any} color
 * @returns {boolean}
 */
export function isValidColor(color) {
  if (typeof color !== 'string') return false;
  const trimmed = color.trim();
  if (trimmed === 'transparent') return true;

  // Hex (#rgb, #rgba, #rrggbb, #rrggbbaa)
  if (/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(trimmed)) {
    return true;
  }

  // rgb/rgba
  if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(\s*,\s*[\d.]+\s*)?\)$/i.test(trimmed)) {
    return true;
  }

  // hsl/hsla
  if (/^hsla?\(\s*\d+\s*,\s*[\d.]+%?\s*,\s*[\d.]+%?(\s*,\s*[\d.]+\s*)?\)$/i.test(trimmed)) {
    return true;
  }

  // Standard CSS named colors
  const namedColors = new Set([
    'black', 'silver', 'gray', 'white', 'maroon', 'red', 'purple', 'fuchsia',
    'green', 'lime', 'olive', 'yellow', 'navy', 'blue', 'teal', 'aqua',
    'orange', 'aliceblue', 'antiquewhite', 'aquamarine', 'azure', 'beige',
    'bisque', 'blanchedalmond', 'blueviolet', 'brown', 'burlywood', 'cadetblue',
    'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson',
    'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen',
    'darkgrey', 'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange',
    'darkorchid', 'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue',
    'darkslategray', 'darkslategrey', 'darkturquoise', 'darkviolet', 'deeppink',
    'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue', 'firebrick',
    'floralwhite', 'forestgreen', 'gainsboro', 'ghostwhite', 'gold',
    'goldenrod', 'greenyellow', 'grey', 'honeydew', 'hotpink', 'indianred',
    'indigo', 'ivory', 'khaki', 'lavender', 'lavenderblush', 'lawngreen',
    'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan', 'lightgoldenrodyellow',
    'lightgray', 'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon',
    'lightseagreen', 'lightskyblue', 'lightslategray', 'lightslategrey',
    'lightsteelblue', 'lightyellow', 'limegreen', 'linen', 'magenta',
    'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple',
    'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise',
    'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin',
    'navajowhite', 'oldlace', 'olivedrab', 'orangered', 'orchid',
    'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip',
    'peachpuff', 'peru', 'pink', 'plum', 'powderblue', 'rosybrown',
    'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen',
    'seashell', 'sienna', 'skyblue', 'slateblue', 'slategray', 'slategrey',
    'snow', 'springgreen', 'steelblue', 'tan', 'thistle', 'tomato',
    'turquoise', 'violet', 'wheat', 'whitesmoke', 'yellowgreen'
  ]);

  return namedColors.has(trimmed.toLowerCase());
}

/**
 * Parse stops from either array of colors or array of stop objects
 * @param {Array<string | { offset: number, color: string }>} stopsInput
 * @returns {Array<{ offset: number, color: string }>}
 */
export function normalizeStops(stopsInput) {
  if (!Array.isArray(stopsInput) || stopsInput.length === 0) {
    return [
      { offset: 0, color: '#000000' },
      { offset: 1, color: '#ffffff' }
    ];
  }

  // If array of color strings, distribute offsets evenly
  if (typeof stopsInput[0] === 'string') {
    const len = stopsInput.length;
    return stopsInput.map((color, idx) => ({
      offset: len === 1 ? 0 : idx / (len - 1),
      color
    }));
  }

  // If array of { offset, color }
  return stopsInput.map((s, idx) => ({
    offset: typeof s.offset === 'number' ? s.offset : idx / Math.max(stopsInput.length - 1, 1),
    color: s.color || '#ffffff'
  }));
}

/**
 * Calculate coordinates for linear gradient based on direction or bounds
 * @param {object} gradient
 * @param {{ x: number, y: number, width: number, height: number }} bounds
 * @returns {{ x1: number, y1: number, x2: number, y2: number }}
 */
export function calculateLinearGradientCoords(gradient, bounds) {
  const { x = 0, y = 0, width = 100, height = 100 } = bounds;

  if (typeof gradient.x1 === 'number' && typeof gradient.x2 === 'number') {
    return {
      x1: gradient.x1,
      y1: gradient.y1 ?? y,
      x2: gradient.x2,
      y2: gradient.y2 ?? (y + height)
    };
  }

  const direction = (gradient.direction || 'vertical').toLowerCase();

  switch (direction) {
    case 'horizontal':
    case 'to right':
      return { x1: x, y1: y, x2: x + width, y2: y };
    case 'to left':
      return { x1: x + width, y1: y, x2: x, y2: y };
    case 'vertical':
    case 'to bottom':
      return { x1: x, y1: y, x2: x, y2: y + height };
    case 'to top':
      return { x1: x, y1: y + height, x2: x, y2: y };
    case 'diagonal':
    case 'to bottom right':
      return { x1: x, y1: y, x2: x + width, y2: y + height };
    case 'to top right':
      return { x1: x, y1: y + height, x2: x + width, y2: y };
    case 'to bottom left':
      return { x1: x + width, y1: y, x2: x, y2: y + height };
    case 'to top left':
      return { x1: x + width, y1: y + height, x2: x, y2: y };
    default:
      // If angle provided in degrees
      if (typeof gradient.angle === 'number') {
        const rad = (gradient.angle - 90) * (Math.PI / 180);
        const cx = x + width / 2;
        const cy = y + height / 2;
        const halfLen = Math.hypot(width, height) / 2;
        return {
          x1: cx - Math.cos(rad) * halfLen,
          y1: cy - Math.sin(rad) * halfLen,
          x2: cx + Math.cos(rad) * halfLen,
          y2: cy + Math.sin(rad) * halfLen
        };
      }
      return { x1: x, y1: y, x2: x, y2: y + height };
  }
}

/**
 * Check if an object is a gradient configuration
 * @param {any} val
 * @returns {boolean}
 */
export function isGradient(val) {
  if (!val || typeof val !== 'object') return false;
  return val.type === 'gradient' || val.type === 'linear' || val.type === 'radial' ||
    Array.isArray(val.colors) || Array.isArray(val.stops);
}
