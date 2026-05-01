#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

const cmd = process.argv[2] || 'demo';
const root = path.resolve(__dirname);

function runDetached(nodePath, args) {
  const p = spawn(nodePath, args, { stdio: 'inherit' });
  return p;
}

if (cmd === 'demo') {
  // Start mock server
  console.log('Starting mock server...');
  const mockPath = path.join(root, 'mint-mock-server', 'server.js');
  const node = process.execPath;
  const server = runDetached(node, [mockPath]);

  // Wait a short time for server to start
  setTimeout(() => {
    console.log('Running demo CLI (mint-test-nti)...');
    const cliPath = path.join(root, 'mint-test-nti', 'cli.js');
    const cli = runDetached(node, [cliPath, '--tier', 'low']);

    cli.on('exit', (code) => {
      console.log('Demo CLI exited with', code, '— stopping mock server.');
      try { server.kill(); } catch (e) {}
      process.exit(code === 0 ? 0 : 1);
    });
  }, 1000);
} else {
  console.log('Unknown command. Usage: demo');
  process.exit(1);
}
