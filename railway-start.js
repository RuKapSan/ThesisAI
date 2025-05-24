#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('Starting ThesisAI...');
console.log('Environment check:');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('- REDIS_URL:', process.env.REDIS_URL ? 'Set' : 'Not set');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('- OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Set' : 'Not set');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is not set!');
  console.log('Available env vars:', Object.keys(process.env).filter(k => !k.startsWith('npm_')).join(', '));
  process.exit(1);
}

const backendDir = path.join(__dirname, 'backend');

// Run migrations first
console.log('\nRunning database migrations...');
const migrate = spawn('npx', ['prisma', 'migrate', 'deploy'], {
  cwd: backendDir,
  stdio: 'inherit',
  env: { ...process.env }
});

migrate.on('close', (code) => {
  if (code !== 0) {
    console.error('Migration failed with code', code);
    process.exit(code);
  }

  // Generate Prisma client
  console.log('\nGenerating Prisma client...');
  const generate = spawn('npx', ['prisma', 'generate'], {
    cwd: backendDir,
    stdio: 'inherit',
    env: { ...process.env }
  });

  generate.on('close', (code) => {
    if (code !== 0) {
      console.error('Prisma generate failed with code', code);
      process.exit(code);
    }

    // Start the server
    console.log('\nStarting backend server...');
    const server = spawn('npm', ['start'], {
      cwd: backendDir,
      stdio: 'inherit',
      env: { ...process.env }
    });

    server.on('close', (code) => {
      console.log('Server exited with code', code);
      process.exit(code);
    });
  });
});