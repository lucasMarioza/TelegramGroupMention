const { chatCollection } = require("./data")

async function MongoMentionRepository(chatId) {
  const collection = await chatCollection(chatId)

  return {
    async createMention(name) {
      try {
        const { result } = await collection.insertOne({
          _id: name,
          members: []
        })
        return result.n === 1
      } catch {
        return false
      }
    },

    async getMention(name) {
      const mention = await collection.findOne({ _id: name })
      return mention === null ? mention : mention.members
    },

    async listMentions(name) {
      const mentions = await collection
        .find(
          name === null
            ? {}
            : {
                members: {
                  $elemMatch: {
                    $eq: name
                  }
                }
              }
        )
        .project({ _id: 1 })
        .toArray()
      return mentions.map(({ _id }) => _id)
    },

    async deleteMention(name) {
      const { result } = await collection.deleteOne({ _id: name })
      return result.n === 1
    },

    async assignToMention(mention, usernames) {
      const { result } = await collection.updateOne(
        { _id: mention },
        {
          $addToSet: {
            members: { $each: usernames }
          }
        }
      )
      console.log({ result })
      return result.nModified === 1
    },

    async unassignFromMention(mention, usernames) {
      const { result } = await collection.updateOne(
        { _id: mention },
        {
          $pull: {
            members: { $in: usernames }
          }
        }
      )
      return result.nModified === 1
    }
  }
}

module.exports = MongoMentionRepository
