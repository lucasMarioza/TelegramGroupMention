require("dotenv").config()
const debug = process.env.DEBUG !== undefined

const Slimbot = require("slimbot")
const slimbot = new Slimbot(process.env["BOT_KEY"])
const { json } = require("micro")

const textToCommand = require("./src/textToCommand")
const handlers = require("./src/handlers")
const MongoMentionRepository = require("./src/mongoMentionRepository")

if (!debug)
  slimbot.setWebhook({
    url: `${process.env["ORIGIN"]}/${process.env["BOT_KEY"]}`
  })

async function run(request, response) {
  const { message } = await json(request)
  if (message && (message.text || message.caption)) {
    const command = textToCommand(message.text, message.caption)
    if (command.invalid === true) return ""

    const handler = handlers.get(command.name)
    if (handler === undefined) return ""

    const repository = await MongoMentionRepository(message.chat.id)
    const result = await handler(
      { repository, telegram: slimbot },
      command.params,
      message.from.username,
      message.chat.id
    )

    if (debug) {
      console.log(result)
      return result
    }
    if (result.empty !== true) {
      const text = result.message || result.reply || result.error
      const extra =
        result.reply || result.error
          ? { reply_to_message_id: message.message_id }
          : null
      slimbot.sendMessage(message.chat.id, text, extra)
    }
    if (result.message)
      slimbot.deleteMessage(message.chat.id, message.message_id)
  }

  return ""
}

module.exports = run
