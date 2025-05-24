console.log('=== Environment Debug ===');
console.log('Current directory:', process.cwd());
console.log('DATABASE_URL:', process.env.DATABASE_URL || 'NOT SET');
console.log('REDIS_URL:', process.env.REDIS_URL || 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
console.log('All env vars:', Object.keys(process.env).filter(k => !k.startsWith('npm_')).join(', '));