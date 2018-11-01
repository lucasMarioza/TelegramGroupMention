const commands = require("./commands")
const Slimbot = require("slimbot")
const slimbot = new Slimbot(process.env["BOT_KEY"])

const Handler = (command, handler) => ({ command, handler })

function cleanMentionName(mention) {
  return mention.replace(/^@*/g, "")
}

const handlers = [
  Handler(/^\/createMention /, message => {
    let mention = message.text.split(" ")[1]
    mention = cleanMentionName(mention)
    let user = message.from.username
    if (commands.createMention(mention, user)) {
      slimbot.sendMessage(message.chat.id, `Mention @${mention} created.`)
    } else {
      slimbot.sendMessage(
        message.chat.id,
        `Mention @${mention} already exists.`
      )
    }
  }),
  Handler(/^\/enter[ _]/, message => {
    let mention = message.text.split(/[ _]/)[1]
    mention = cleanMentionName(mention)
    let user = message.from.username
    if (commands.assignToMention(mention, user)) {
      slimbot.sendMessage(
        message.chat.id,
        `user @${user} assigned to @${mention}.`
      )
    } else {
      slimbot.sendMessage(
        message.chat.id,
        `Mention @${mention} does not exists. Use /newMention to create.`
      )
    }
  }),
  Handler(/^\/exit[ _]/, message => {
    let mention = message.text.split(/[ _]/)[1]
    mention = cleanMentionName(mention)
    let user = message.from.username
    if (commands.unassign(mention, user)) {
      slimbot.sendMessage(
        message.chat.id,
        `user @${user} unassigned of @${mention}.`
      )
    } else {
      slimbot.sendMessage(
        message.chat.id,
        `Mention @${mention} does not exists or you already wasn't assigned into it.`
      )
    }
  }),
  Handler(/^\/deleteMention /, message => {
    let mention = message.text.split(" ")[1]
    mention = cleanMentionName(mention)
    if (commands.deleteMention(mention))
      slimbot.sendMessage(message.chat.id, `Mention @${mention} deleted.`)
    else
      slimbot.sendMessage(message.chat.id, `Mention @${mention} doesn't exist.`)
  }),
  Handler(/^\/mentions/, message => {
    let response = commands.getAllMentions().trim()
    if (response !== "") {
      slimbot.sendMessage(message.chat.id, response, {
        reply_to_message_id: message.message_id
      })
    } else {
      slimbot.sendMessage(
        message.chat.id,
        "No mentions created for this group yet."
      )
    }
  }),
  Handler(/^\@admins/, async message => {
    const admins = await slimbot.getChatAdministrators(message.chat.id)
    const usernames = admins.result.map(({ user: { username } }) => username)
    const response = usernames.map(username => `@${username}`).join(" ")
    if (response !== "")
      slimbot.sendMessage(message.chat.id, response, {
        reply_to_message_id: message.message_id
      })
  }),
  Handler(/^\@.+/, message => {
    let mention = message.text.split(" ")[0].replace("@", "")
    let response = commands.getMention(mention, message.from.username).trim()
    if (response !== "")
      slimbot.sendMessage(message.chat.id, response, {
        reply_to_message_id: message.message_id
      })
  }),
  Handler(/^\/list[ _]/, message => {
    let mention = message.text.split(/[ _]/)[1]
    let response = commands.getMentionMembers(mention).trim()
    if (response !== "")
      slimbot.sendMessage(message.chat.id, response, {
        reply_to_message_id: message.message_id
      })
  })
]

const handleMessage = message => {
  message.text = message.text.replace(/\s{1,}/g, " ")
  const match = handlers.find(({ command }) => command.test(message.text))
  if (match !== undefined) match.handler(message)
}

module.exports = handleMessage
