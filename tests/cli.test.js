import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';

const execFileAsync = promisify(execFile);
const cliPath = path.resolve('bin/sd-canvas.js');
const tmpDir = path.resolve('tests/tmp_cli');

describe('CLI Commands', () => {
  before(async () => {
    await fs.mkdir(tmpDir, { recursive: true });
  });

  after(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('sd-canvas info should print package identity and presets', async () => {
    const { stdout } = await execFileAsync(process.execPath, [cliPath, 'info']);
    assert.ok(stdout.includes('SD Canvas'));
    assert.ok(stdout.includes('Stacks Development'));
    assert.ok(stdout.includes('Design Once. Render Everywhere.'));
    assert.ok(stdout.includes('welcome'));
    assert.ok(stdout.includes('profile'));
  });

  it('sd-canvas validate should succeed on valid layout file', async () => {
    const validFile = path.join(tmpDir, 'valid_layout.json');
    await fs.writeFile(validFile, JSON.stringify({
      width: 1200,
      height: 500,
      background: '#111',
      elements: [{ type: 'text', text: 'Hello', x: 10, y: 10 }]
    }));

    const { stdout } = await execFileAsync(process.execPath, [cliPath, 'validate', validFile]);
    assert.ok(stdout.includes('Layout is valid'));
  });

  it('sd-canvas validate should fail on invalid layout file', async () => {
    const invalidFile = path.join(tmpDir, 'invalid_layout.json');
    await fs.writeFile(invalidFile, JSON.stringify({
      width: -50,
      elements: [{ type: 'unknown_type' }]
    }));

    await assert.rejects(
      async () => execFileAsync(process.execPath, [cliPath, 'validate', invalidFile]),
      (err) => {
        return err.code === 1 && (err.stderr.includes('validation failed') || err.stdout.includes('validation failed'));
      }
    );
  });

  it('sd-canvas render should render layout to output file', async () => {
    const layoutFile = path.join(tmpDir, 'render_layout.json');
    const dataFile = path.join(tmpDir, 'render_data.json');
    const outputFile = path.join(tmpDir, 'output.png');

    await fs.writeFile(layoutFile, JSON.stringify({
      width: 400,
      height: 200,
      background: '#222',
      elements: [{ type: 'text', text: 'Rendered {{name}}', x: 20, y: 20, fontSize: 24 }]
    }));

    await fs.writeFile(dataFile, JSON.stringify({
      name: 'Tester'
    }));

    const { stdout } = await execFileAsync(process.execPath, [
      cliPath,
      'render',
      layoutFile,
      '--output',
      outputFile,
      '--data',
      dataFile
    ]);

    assert.ok(stdout.includes('Successfully rendered'));
    const stat = await fs.stat(outputFile);
    assert.ok(stat.size > 0);
  });
});
