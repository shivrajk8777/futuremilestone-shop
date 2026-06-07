import crypto from 'crypto';
import { MongoClient } from 'mongodb';

const mongoUri = "mongodb://127.0.0.1:27017";
const databaseName = "fjord_admin";

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

const seedUser = {
  name: "John Doe",
  email: "user@fjord.com",
  password: "password123",
  phone: "+420 123 456 789",
  address: "Vinohradská 121, 130 00 Praha 3, Czech Republic",
};

async function main() {
  console.log("Connecting to MongoDB to seed storefront user...");
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    const db = client.db(databaseName);
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({ email: seedUser.email.toLowerCase() });
    if (existingUser) {
      console.log(`User already exists for ${seedUser.email}. Updating profile & resetting password...`);
      const passwordHash = hashPassword(seedUser.password);
      await usersCollection.updateOne(
        { _id: existingUser._id },
        {
          $set: {
            name: seedUser.name,
            passwordHash,
            phone: seedUser.phone,
            address: seedUser.address,
            updatedAt: new Date(),
          }
        }
      );
      console.log("Successfully reset user profile & password.");
      return;
    }

    const passwordHash = hashPassword(seedUser.password);
    await usersCollection.insertOne({
      name: seedUser.name,
      email: seedUser.email.toLowerCase(),
      passwordHash,
      phone: seedUser.phone,
      address: seedUser.address,
      createdAt: new Date(),
    });

    console.log(`Seeded storefront user account: email="${seedUser.email}", password="${seedUser.password}"`);
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await client.close();
  }
}

main();
