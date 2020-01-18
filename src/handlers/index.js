function lexiComparator(a, b) {
  const nameA = a.toLowerCase()
  const nameB = b.toLowerCase()
  if (nameA < nameB) return -1
  if (nameA > nameB) return 1
  return 0
}

const handlers = new Map()

handlers.set("create", async ({ repository }, [mention]) => {
  const ok = await repository.createMention(mention)
  if (ok) return { message: `Mention @${mention} created` }
  return { error: `Mention @${mention} already exists` }
})

handlers.set("delete", async ({ repository }, [mention]) => {
  const ok = await repository.deleteMention(mention)
  if (ok) return { message: `Mention @${mention} deleted` }
  return { error: `Mention @${mention} doesn't exists` }
})

handlers.set(
  "enter",
  async ({ repository, telegram }, [mention, ...users], user, chat) => {
    let toAdd = [user]
    if (users.length !== 0) {
      const admins = (await telegram.getChatAdministrators(chat)).result
      if (!admins.some(({ user: { username } }) => username === user))
        return { error: "Only admins can assign other users" }
      toAdd = users
    }

    const ok = await repository.assignToMention(mention, toAdd)
    if (!ok)
      return {
        error: `Mention @${mention} doesn't exists or users are already assigned`
      }

    if (toAdd.length === 1)
      return { message: `User @${toAdd[0]} assigned to @${mention}` }
    const usersString = toAdd.map(user => `@${user}`).join(" ")
    return { message: `Users ${usersString} assigned to @${mention}` }
  }
)

handlers.set(
  "exit",
  async ({ repository, telegram }, [mention, ...users], user, chat) => {
    let toRemove = [user]
    if (users.length !== 0) {
      const admins = await telegram.getChatAdministrators(chat)
      if (!admins.some(({ user: { username } }) => username === user))
        return { error: "Only admins can unassign other users" }
      toRemove = users
    }

    const ok = await repository.unassignFromMention(mention, toRemove)
    if (!ok)
      return {
        error: `Mention @${mention} doesn't exists or user(s) aren't assigned to it`
      }

    if (toRemove.length === 1)
      return { message: `User @${user} unassigned from @${mention}` }
    const usersString = toRemove.map(user => `@${user}`).join(" ")
    return { message: `Users ${usersString} unassigned from @${mention}` }
  }
)

handlers.set("mentions", async ({ repository }, [target], user) => {
  let mentioned = target === undefined ? null : target
  if (mentioned === "me") mentioned = user
  const mentions = await repository.listMentions(mentioned)
  if (mentions.length === 0) return { error: "No mentions found" }
  return { reply: mentions.sort(lexiComparator).join("\n") }
})

handlers.set("@", async ({ repository, telegram }, [mention], user, chat) => {
  const parse = mention =>
    mention[0] === "!" ? [true, mention.substr(1)] : [false, mention]
  const [silent, name] = parse(mention)

  let users = null
  if (name === "admins") {
    const admins = await telegram.getChatAdministrators(chat)
    users = admins.map(({ user: { username } }) => username)
  } else {
    users = await repository.getMention(name)
    if (users === null || users === []) return { empty: true }
  }

  if (silent) return { reply: users.sort(lexiComparator).join("\n") }
  return {
    reply: users
      .filter(username => username != user)
      .sort(lexiComparator)
      .map(username => `@${username}`)
      .join(" ")
  }
})

module.exports = handlers
