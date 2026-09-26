/**
 * Template variable interpolation
 * Stacks Development (SD)
 * Design Once. Render Everywhere.
 */

/**
 * Safely resolve a nested key path in an object (e.g. "user.stats.level")
 * @param {Record<string, any>} obj
 * @param {string} path
 * @returns {any}
 */
export function getNestedValue(obj, path) {
  if (!obj || typeof obj !== 'object' || !path) return undefined;

  // Split by dot or bracket notation: user.stats[0].name or user.stats.level
  const parts = path
    .replace(/\[(\w+)\]/g, '.$1')
    .replace(/^\./, '')
    .split('.');

  let current = obj;
  for (const part of parts) {
    if (current == null) return undefined;
    current = current[part];
  }

  return current;
}

/**
 * Interpolate a string template using data values
 * Supports {{variable}} and {{nested.object.property}}
 *
 * @param {string} template
 * @param {Record<string, any>} [data={}]
 * @param {object} [options={}]
 * @param {any} [options.fallback=''] - Fallback value if variable is missing
 * @param {boolean} [options.keepUnresolved=false] - Keep {{token}} if unresolved
 * @param {boolean} [options.preserveType=true] - If template is strictly "{{var}}", return raw type
 * @returns {any}
 */
export function interpolateString(template, data = {}, options = {}) {
  if (typeof template !== 'string') return template;

  const {
    fallback = '',
    keepUnresolved = false,
    preserveType = true
  } = options;

  // Single variable exact match check for type preservation (e.g. "{{level}}" -> 25)
  const singleMatch = template.match(/^\{\{\s*([a-zA-Z0-9_$.-]+)\s*\}\}$/);
  if (singleMatch && preserveType) {
    const key = singleMatch[1].trim();
    const val = getNestedValue(data, key);
    if (val !== undefined) return val;
    if (keepUnresolved) return template;
    return fallback;
  }

  // Mixed string interpolation
  return template.replace(/\{\{\s*([a-zA-Z0-9_$.-]+)\s*\}\}/g, (match, key) => {
    const trimmedKey = key.trim();
    const val = getNestedValue(data, trimmedKey);

    if (val !== undefined) {
      if (val === null) return '';
      if (typeof val === 'object') return JSON.stringify(val);
      return String(val);
    }

    if (keepUnresolved) return match;
    return fallback != null ? String(fallback) : '';
  });
}

/**
 * Recursively interpolates any data structure (objects, arrays, strings)
 *
 * @param {any} target - Layout or property object
 * @param {Record<string, any>} [data={}] - Interpolation variables
 * @param {object} [options={}]
 * @returns {any} Cloned and interpolated copy
 */
export function interpolate(target, data = {}, options = {}) {
  if (target == null) return target;

  if (typeof target === 'string') {
    return interpolateString(target, data, options);
  }

  if (Array.isArray(target)) {
    return target.map(item => interpolate(item, data, options));
  }

  if (typeof target === 'object') {
    // If it's a Buffer or typed array or date, don't recurse
    if (Buffer.isBuffer(target) || target instanceof Uint8Array || target instanceof Date) {
      return target;
    }

    const result = {};
    for (const [key, value] of Object.entries(target)) {
      result[key] = interpolate(value, data, options);
    }
    return result;
  }

  return target;
}

export default interpolate;
