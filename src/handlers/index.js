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
      const admins = await telegram.getChatAdministrators(chat)
      if (!admins.some(({ user: { username } }) => username === user))
        return { error: "Only admins can assign other users" }
      toAdd = users
    }

    const ok = await repository.assignToMention(mention, toAdd)
    if (!ok) return { error: `Mention @${mention} doesn't exists` }

    if (toAdd.length === 1)
      return { message: `User @${user} assigned to @${mention}` }
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

module.exports = handlers
