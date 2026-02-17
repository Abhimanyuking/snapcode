import { MongoClient } from "mongodb";

const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    // During build time, MONGODB_URI may not be available
    // Return a promise that will be replaced at runtime
    return Promise.reject(new Error("MONGODB_URI not set"));
  }

  if (process.env.NODE_ENV === "development") {
    if (!globalWithMongo._mongoClientPromise) {
      const client = new MongoClient(uri);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    return globalWithMongo._mongoClientPromise;
  }

  const client = new MongoClient(uri);
  return client.connect();
}

// Lazy: only create the promise when .then() is called
const clientPromise: Promise<MongoClient> = {
  then(...args: Parameters<Promise<MongoClient>["then"]>) {
    return getClientPromise().then(...args);
  },
  catch(...args: Parameters<Promise<MongoClient>["catch"]>) {
    return getClientPromise().catch(...args);
  },
  finally(...args: Parameters<Promise<MongoClient>["finally"]>) {
    return getClientPromise().finally(...args);
  },
  [Symbol.toStringTag]: "Promise",
} as Promise<MongoClient>;

export default clientPromise;
