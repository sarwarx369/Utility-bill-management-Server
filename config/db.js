// config/db.js
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectToDB() {
  await client.connect();
  console.log("✅ MongoDB Connected Successfully!");
  return client;
}

// getDB helper
function getDB(dbName = "utilitydb") {
  return client.db(dbName);
}

module.exports = { connectToDB, getDB, client };
