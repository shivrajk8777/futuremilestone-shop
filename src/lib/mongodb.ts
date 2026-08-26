import { MongoClient, Db } from "mongodb";

const globalForMongo = globalThis as unknown as {
  __futuremilestoneMongoClientPromise?: Promise<MongoClient>;
};

export async function getMongoClient(): Promise<MongoClient> {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
  }

  if (!globalForMongo.__futuremilestoneMongoClientPromise) {
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 0,
      retryReads: true,
      retryWrites: true,
    });

    globalForMongo.__futuremilestoneMongoClientPromise = client.connect();
  }

  return globalForMongo.__futuremilestoneMongoClientPromise;
}

export async function getDatabase(): Promise<Db> {
  const MONGODB_DB = process.env.MONGODB_DB;
  if (!MONGODB_DB) {
    throw new Error("Please define the MONGODB_DB environment variable inside .env.local");
  }
  const client = await getMongoClient();
  return client.db(MONGODB_DB);
}

