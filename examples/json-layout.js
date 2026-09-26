/**
 * JSON Layout Schema Rendering Example
 * SD Canvas - Stacks Development (SD)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { Canvas } from '../src/index.js';
import { createSampleAvatar } from './assets.js';

async function run() {
  console.log('Rendering JSON layout schema...');

  const layout = {
    width: 1200,
    height: 500,
    background: {
      type: 'gradient',
      direction: 'horizontal',
      colors: ['#111111', '#242424']
    },
    elements: [
      {
        type: 'image',
        id: 'avatar',
        src: '{{avatar}}',
        x: 70,
        y: 70,
        width: 180,
        height: 180,
        radius: 90,
        circle: true,
        borderColor: '#6366f1',
        borderWidth: 4
      },
      {
        type: 'text',
        id: 'username',
        x: 300,
        y: 120,
        text: 'Welcome {{username}}',
        fontSize: 48,
        fontWeight: 700,
        color: '#ffffff'
      },
      {
        type: 'text',
        id: 'stats',
        x: 300,
        y: 190,
        text: 'Level: {{level}}  •  XP: {{xp}}  •  Coins: {{coins}}',
        fontSize: 24,
        color: '#a1a1aa'
      }
    ]
  };

  const buffer = await Canvas.render(layout, {
    username: 'Cruz',
    avatar: createSampleAvatar('Cruz'),
    level: 25,
    xp: 4500,
    coins: 1200
  });

  const outPath = path.resolve('examples/output_json_layout.png');
  await fs.writeFile(outPath, buffer);
  console.log(`Saved output to ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

run().catch(console.error);
