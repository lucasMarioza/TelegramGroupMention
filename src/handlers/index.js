const handlers = new Map()

handlers.set("create", async (repository, [mention]) => {
  const ok = await repository.createMention(mention)
  if (ok) return { message: `Mention @${mention} created.` }
  return { error: `Mention @${mention} already exists.` }
})

handlers.set("delete", async (repository, [mention]) => {
	const ok = await repository.deleteMention(mention)
	if (ok) return { message: `Mention @${mention} deleted.` }
	return { error: `Mention @${mention} doesn't exists.`}
})

module.exports = handlers
