const { MongoClient } = require("mongodb")

let instance = null

/**
 * Get an instance of Mongo.Db using info from environmental variables.
 * Uses the singleton pattern to create only one instance per execution.
 */
async function getDatabase() {
  if (instance === null) {
    const client = await MongoClient.connect(process.env.MONGODB_URI)
    instance = client.db()
  }
  return instance
}

/**
 * Get the mongo collection for a chat.
 */
async function chatCollection(chatId) {
  const db = await getDatabase()
  return db.collection(`chat${chatId}`)
}

module.exports = {
  getDatabase,
  chatCollection
}
