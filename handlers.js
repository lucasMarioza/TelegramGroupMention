const commands = require("./commands")
const Slimbot = require("slimbot")
const slimbot = new Slimbot(process.env["BOT_KEY"])

const Handler = (command, handler) => ({ command, handler })

const Message = text => ({ text })
const Reply = text => ({ text, reply: true })
const Failure = text => ({ text, failure: true })
const Empty = () => ({})

function cleanMentionName(mention) {
  return mention.replace(/^@*/g, "")
}
function separator(text) {
  const [command, ...parameters] = text.replace(/(^\/.*)@[^ ]*/, "").split(" ")
  return [...command.replace("_", " ").split(" "), ...parameters]
}

const handlers = [
  Handler(/^\/create[ _]/, message => {
    let [_, mention] = separator(message.text)
    mention = cleanMentionName(mention)
    let user = message.from.username
    if (commands.createMention(mention, user))
      return Message(`Mention @${mention} created.`)
    else return Failure(`Mention @${mention} already exists.`)
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

    const results = users.map(user => commands.assignToMention(mention, user))
    if (results.includes(false))
      return Failure(
        `Mention @${mention} does not exists. Use /create to create.`
      )
    if (users.length === 1)
      return Message(`user @${users[0]} assigned to @${mention}.`)
    const usersString = users.map(user => `@${user}`).join(" ")
    return Message(`users ${usersString} assigned to @${mention}.`)
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

    const results = users.map(user => commands.unassign(mention, user))
    if (results.includes(false))
      return Failure(
        `Mention @${mention} does not exists or you already wasn't assigned into it.`
      )
    if (users.length === 1)
      return Message(`user @${users[0]} unassigned of @${mention}.`)
    const usersString = users.map(user => `@${user}`).join(" ")
    return Message(`users ${usersString} unnasigned of @${mention}.`)
  }),
  Handler(/^\/delete[ _]/, message => {
    let [_, mention] = separator(message.text)
    mention = cleanMentionName(mention)
    if (commands.deleteMention(mention))
      return Message(`Mention @${mention} deleted.`)
    else return Failure(`Mention @${mention} doesn't exist.`)
  }),
  Handler(/^\/mentions/, message => {
    let [_, user] = separator(message.text)
    if (user === "me") user = message.from.username

    let response = commands.getAllMentions(user).trim()
    if (response !== "") return Reply(response)
    else return Failure("No mentions created for this group yet.")
  }),
  Handler(/^\@admins/, async message => {
    const admins = await slimbot.getChatAdministrators(message.chat.id)
    const usernames = admins.result.map(({ user: { username } }) => username)
    const response = usernames.map(username => `@${username}`).join(" ")
    if (response !== "") return Reply(response)
    return Empty()
  }),
  Handler(/^\@.+/, message => {
    let [mention] = separator(message.text)
    mention = cleanMentionName(mention)
    let response = commands.getMention(mention, message.from.username).trim()
    if (response !== "") return Reply(response)
    return Empty()
  }),
  Handler(/^\/list[ _]/, message => {
    let [_, mention] = separator(message.text)
    let response = commands.getMentionMembers(mention).trim()
    if (response !== "") return Reply(response, message.message_id)
    return Empty()
  })
]

const handleMessage = async message => {
  message.text = message.text.replace(/\s{1,}/g, " ")
  const match = handlers.find(({ command }) => command.test(message.text))
  if (match !== undefined) {
    const { text, reply, error } = await match.handler(message)
    if (text) {
      const extra = reply ? { reply_to_message_id: message.message_id } : null
      slimbot.sendMessage(message.chat.id, text, extra)
    }
    if (!error && !reply && text)
      slimbot.deleteMessage(message.chat.id, message.message_id)
  }
}

module.exports = handleMessage
