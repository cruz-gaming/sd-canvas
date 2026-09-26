/**
 * Sample Assets for Examples
 * Stacks Development (SD)
 */

import { createCanvas } from '@napi-rs/canvas';

/**
 * Generate a standalone sample avatar PNG buffer or base64 data URI
 * @param {string} [name='Cruz']
 * @returns {string} Base64 data URI
 */
export function createSampleAvatar(name = 'Cruz') {
  const canvas = createCanvas(256, 256);
  const ctx = canvas.getContext('2d');

  // Background radial gradient
  const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
  grad.addColorStop(0, '#6366f1');
  grad.addColorStop(1, '#312e81');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(128, 128, 128, 0, Math.PI * 2);
  ctx.fill();

  // Face / Icon representation
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 96px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name.charAt(0).toUpperCase(), 128, 132);

  const buffer = canvas.toBuffer('image/png');
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

export default { createSampleAvatar };
