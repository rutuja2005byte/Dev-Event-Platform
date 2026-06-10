import mongoose from 'mongoose';

// Define the connection cache type
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Extend the global object to include our mongoose cache
declare global {
  var mongoose: MongooseCache | undefined;
}

// Initialize the cache on the global object to persist across hot reloads in development
const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

function maskMongoUri(uri: string): string {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
}

function getMongoDebugInfo(uri: string) {
  const dbMatch = uri.match(/\.mongodb\.net\/([^/?]+)/);
  return {
    maskedUri: maskMongoUri(uri),
    database: dbMatch?.[1] ?? '(not set in URI)',
    username: uri.match(/\/\/([^:]+):/)?.[1] ?? '(missing)',
  };
}

/**
 * Establishes a connection to MongoDB using Mongoose.
 * Caches the connection to prevent multiple connections during development hot reloads.
 * @returns Promise resolving to the Mongoose instance
 */
async function connectDB(): Promise<typeof mongoose> {
  const mongodbUri = process.env.MONGODB_URI?.trim();

  // Return existing connection if available and still connected
  if (cached.conn && mongoose.connection.readyState === 1) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[mongodb] Reusing cached connection:', mongoose.connection.name);
    }
    return cached.conn;
  }

  // Drop stale cache if the socket disconnected
  if (cached.conn && mongoose.connection.readyState !== 1) {
    cached.conn = null;
    cached.promise = null;
  }

  // Return existing connection promise if one is in progress
  if (!cached.promise) {
    if (!mongodbUri) {
      throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
      );
    }

    if (process.env.NODE_ENV === 'development') {
      const debugInfo = getMongoDebugInfo(mongodbUri);
      console.log('[mongodb] Connecting with:', debugInfo);
    }

    const options = {
      bufferCommands: false, // Disable Mongoose buffering
    };

    cached.promise = mongoose.connect(mongodbUri, options).then((mongooseInstance) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[mongodb] Connected to database:', mongooseInstance.connection.name);
      }
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.conn = null;
    cached.promise = null;

    if (process.env.NODE_ENV === 'development' && mongodbUri) {
      console.error('[mongodb] Connection failed:', getMongoDebugInfo(mongodbUri));
      console.error('[mongodb] Error:', error);
    }

    if (
      error instanceof Error &&
      (error.message.includes('bad auth') || error.message.includes('Authentication failed'))
    ) {
      throw new Error(
        'MongoDB Atlas authentication failed. Verify MONGODB_URI in .env.local matches your Atlas database user password, then restart the dev server.'
      );
    }

    throw error;
  }

  return cached.conn;
}

export default connectDB;