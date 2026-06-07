import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

if (!MONGODB_DB) {
  throw new Error("Please define the MONGODB_DB environment variable inside .env.local");
}

const globalForMongo = globalThis as unknown as {
  __fjordMongoClientPromise?: Promise<MongoClient>;
};

export async function getMongoClient(): Promise<MongoClient> {
  if (!globalForMongo.__fjordMongoClientPromise) {
    const client = new MongoClient(MONGODB_URI as string, {
      maxPoolSize: 10,
      minPoolSize: 0,
      retryReads: true,
      retryWrites: true,
    });

    globalForMongo.__fjordMongoClientPromise = client.connect();
  }

  return globalForMongo.__fjordMongoClientPromise;
}

export async function getDatabase(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(MONGODB_DB);
}
