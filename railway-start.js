#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('Starting ThesisAI...');
console.log('Environment check:');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('- REDIS_URL:', process.env.REDIS_URL ? 'Set' : 'Not set');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('- OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Set' : 'Not set');
console.log('- FRONTEND_URL:', process.env.FRONTEND_URL ? 'Set' : 'Not set');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is not set!');
  console.log('Available env vars:', Object.keys(process.env).filter(k => !k.startsWith('npm_')).join(', '));
  process.exit(1);
}

const backendDir = path.join(__dirname, 'backend');
const frontendDir = path.join(__dirname, 'frontend');

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

    // Start the backend server
    console.log('\nStarting backend server...');
    const backendServer = spawn('npm', ['start'], {
      cwd: backendDir,
      stdio: 'inherit',
      env: { ...process.env }
    });

    // Build and start the frontend
    console.log('\nBuilding frontend...');
    const frontendBuild = spawn('npm', ['run', 'build'], {
      cwd: frontendDir,
      stdio: 'inherit',
      env: { 
        ...process.env,
        NEXT_PUBLIC_API_URL: process.env.BACKEND_URL || 'http://localhost:8080/api'
      }
    });

    frontendBuild.on('close', (code) => {
      if (code !== 0) {
        console.error('Frontend build failed with code', code);
        backendServer.kill();
        process.exit(code);
      }

      console.log('\nStarting frontend server...');
      const frontendServer = spawn('npm', ['start'], {
        cwd: frontendDir,
        stdio: 'inherit',
        env: { 
          ...process.env,
          PORT: process.env.FRONTEND_PORT || '3000',
          NEXT_PUBLIC_API_URL: process.env.BACKEND_URL || 'http://localhost:8080/api'
        }
      });

      // Handle process termination
      process.on('SIGINT', () => {
        console.log('\nShutting down...');
        backendServer.kill();
        frontendServer.kill();
        process.exit(0);
      });

      backendServer.on('close', (code) => {
        console.log('Backend server exited with code', code);
        frontendServer.kill();
        process.exit(code);
      });

      frontendServer.on('close', (code) => {
        console.log('Frontend server exited with code', code);
        backendServer.kill();
        process.exit(code);
      });
    });
  });
});