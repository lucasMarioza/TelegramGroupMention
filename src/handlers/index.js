const handlers = new Map()

handlers.set("create", async (repository, [mention]) => {
  const ok = await repository.createMention(mention)
  if (ok) return { message: `Mention @${mention} created.` }
  return { error: `Mention @${mention} already exists.` }
})

module.exports = handlers
