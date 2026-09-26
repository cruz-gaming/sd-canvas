/**
 * Presets Registry & Management
 * Stacks Development (SD)
 * Design Once. Render Everywhere.
 */

import { welcomePreset } from './welcome.js';
import { profilePreset } from './profile.js';
import { levelupPreset } from './levelup.js';
import { rankPreset } from './rank.js';
import { achievementPreset } from './achievement.js';
import { Layout } from '../Layout.js';
import { LayoutError } from '../errors/index.js';

const presetsRegistry = new Map([
  ['welcome', welcomePreset],
  ['profile', profilePreset],
  ['levelup', levelupPreset],
  ['rank', rankPreset],
  ['achievement', achievementPreset]
]);

/**
 * Register a custom preset
 * @param {string} name
 * @param {object | Function} layoutOrFactory
 */
export function registerPreset(name, layoutOrFactory) {
  if (!name || typeof name !== 'string') {
    throw new LayoutError('Preset name must be a non-empty string.');
  }
  if (!layoutOrFactory) {
    throw new LayoutError(`Preset definition for "${name}" cannot be null or undefined.`);
  }
  presetsRegistry.set(name.toLowerCase(), layoutOrFactory);
}

/**
 * Check if a preset exists
 * @param {string} name
 * @returns {boolean}
 */
export function hasPreset(name) {
  if (!name) return false;
  return presetsRegistry.has(name.toLowerCase());
}

/**
 * Get raw preset definition
 * @param {string} name
 * @returns {object | Function | undefined}
 */
export function getPreset(name) {
  if (!name) return undefined;
  return presetsRegistry.get(name.toLowerCase());
}

/**
 * List all available preset names
 * @returns {string[]}
 */
export function listPresets() {
  return Array.from(presetsRegistry.keys());
}

/**
 * Create a new Layout instance from a preset, optionally interpolating data
 * @param {string} name
 * @param {Record<string, any>} [data]
 * @returns {Layout}
 */
export function createPresetLayout(name, data) {
  const preset = getPreset(name);
  if (!preset) {
    throw new LayoutError(`Preset "${name}" not found. Available presets: ${listPresets().join(', ')}`);
  }

  let layoutDef;
  if (typeof preset === 'function') {
    layoutDef = preset(data || {});
  } else {
    // Deep clone the preset object
    layoutDef = JSON.parse(JSON.stringify(preset));
  }

  const layout = Layout.from(layoutDef);
  if (data) {
    return layout.interpolate(data);
  }
  return layout;
}

export {
  welcomePreset,
  profilePreset,
  levelupPreset,
  rankPreset,
  achievementPreset
};

export default {
  registerPreset,
  hasPreset,
  getPreset,
  listPresets,
  createPresetLayout
};
