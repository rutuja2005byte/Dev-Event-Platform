import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), '.env.local');
  const content = readFileSync(envPath, 'utf8');

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    process.env[key] ??= value;
  }
}

function maskMongoUri(uri) {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
}

loadEnvLocal();

const uri = process.env.MONGODB_URI?.trim();

if (!uri) {
  console.error('MONGODB_URI is missing from .env.local');
  process.exit(1);
}

console.log('Testing connection with:', maskMongoUri(uri));

try {
  await mongoose.connect(uri, { bufferCommands: false });
  console.log('SUCCESS: connected to database:', mongoose.connection.name);
  await mongoose.disconnect();
} catch (error) {
  console.error('FAILED:', error.message);
  if (error.code) console.error('code:', error.code, error.codeName);
  process.exit(1);
}
