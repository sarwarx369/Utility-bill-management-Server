// config/db.js
const { MongoClient } = require("mongodb");

let dbClient = null;
let db = null;

async function connectToDB(uri, dbName = "utilitydb") {
  if (db) return { db, client: dbClient };
  dbClient = new MongoClient(uri, { useUnifiedTopology: true });
  await dbClient.connect();
  db = dbClient.db(dbName);
  // ensure indexes if needed
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  return { db, client: dbClient };
}

function getDB() {
  if (!db) throw new Error("Database not initialized. Call connectToDB first.");
  return db;
}

module.exports = { connectToDB, getDB };
