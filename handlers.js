const commands = require("./commands")
const Slimbot = require("slimbot")
const slimbot = new Slimbot(process.env["BOT_KEY"])

const Handler = (command, handler) => ({ command, handler })

function cleanMentionName(mention) {
  return mention.replace(/^@*/g, "")
}
function separator(text) {
  const [command, ...parameters] = text.split(" ")
  return [...command.replace("_", " ").split(" "), ...parameters]
}

const handlers = [
  Handler(/^\/create[ _]/, message => {
    let [_, mention] = separator(message.text)
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
  Handler(/^\/enter[ _]/, async message => {
    let [_, mention, ...users] = separator(message.text)
    mention = cleanMentionName(mention)

    if (users.length === 0) users = [message.from.username]
    else {
      const admins = await slimbot.getChatAdministrators(message.chat.id)
      const user = admins.result.find(
        ({ user: { username } }) => username === message.from.username
      )
      if (user === undefined) return
    }

    for (user of users) {
      if (commands.assignToMention(mention, user)) {
        slimbot.sendMessage(
          message.chat.id,
          `user @${user} assigned to @${mention}.`
        )
      } else {
        slimbot.sendMessage(
          message.chat.id,
          `Mention @${mention} does not exists. Use /create to create.`
        )
      }
    }
  }),
  Handler(/^\/exit[ _]/, async message => {
    let [_, mention, ...users] = separator(message.text)
    mention = cleanMentionName(mention)

    if (users.length === 0) users = [message.from.username]
    else {
      const admins = await slimbot.getChatAdministrators(message.chat.id)
      const user = admins.result.find(
        ({ user: { username } }) => username === message.from.username
      )
      if (user === undefined) return
    }

    for (user of users) {
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
    }
  }),
  Handler(/^\/delete[ _]/, message => {
    let [_, mention] = separator(message.text)
    mention = cleanMentionName(mention)
    if (commands.deleteMention(mention))
      slimbot.sendMessage(message.chat.id, `Mention @${mention} deleted.`)
    else
      slimbot.sendMessage(message.chat.id, `Mention @${mention} doesn't exist.`)
  }),
  Handler(/^\/mentions/, message => {
    let [_, user] = separator(message.text)
    if (user === "me") user = message.from.username

    let response = commands.getAllMentions(user).trim()
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
    let [mention] = separator(message.text)
    mention = cleanMentionName(mention)
    let response = commands.getMention(mention, message.from.username).trim()
    if (response !== "")
      slimbot.sendMessage(message.chat.id, response, {
        reply_to_message_id: message.message_id
      })
  }),
  Handler(/^\/list[ _]/, message => {
    let [_, mention] = separator(message.text)
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
