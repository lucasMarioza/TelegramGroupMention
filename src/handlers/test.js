const test = require("ava")
const sinon = require("sinon")

const handlers = require(".")

test("create", async t => {
  const repository = { createMention: () => true }
  const spy = sinon.spy(repository, "createMention")

  const handler = handlers.get("create")
  t.not(handler, undefined)
  const result = await handler({ repository }, ["mention"])

  t.true(spy.calledOnceWithExactly("mention"))
  t.deepEqual(result, { message: "Mention @mention created" })
})

test("create failed", async t => {
  const repository = { createMention: () => false }
  const spy = sinon.spy(repository, "createMention")

  const handler = handlers.get("create")
  t.not(handler, undefined)
  const result = await handler({ repository }, ["mention"])

  t.true(spy.calledOnceWithExactly("mention"))
  t.deepEqual(result, { error: "Mention @mention already exists" })
})

test("delete", async t => {
  const repository = { deleteMention: () => true }
  const spy = sinon.spy(repository, "deleteMention")

  const handler = handlers.get("delete")
  t.not(handler, undefined)
  const result = await handler({ repository }, ["mention"])

  t.true(spy.calledOnceWithExactly("mention"))
  t.deepEqual(result, { message: "Mention @mention deleted" })
})

test("delete failed", async t => {
  const repository = { deleteMention: () => false }
  const spy = sinon.spy(repository, "deleteMention")

  const handler = handlers.get("delete")
  t.not(handler, undefined)
  const result = await handler({ repository }, ["mention"])

  t.true(spy.calledOnceWithExactly("mention"))
  t.deepEqual(result, { error: "Mention @mention doesn't exists" })
})

test("enter self", async t => {
  const repository = { assignToMention: () => true }
  const spy = sinon.spy(repository, "assignToMention")

  const handler = handlers.get("enter")
  t.not(handler, undefined)
  const result = await handler({ repository }, ["mention"], "user")

  t.true(spy.calledOnceWithExactly("mention", ["user"]))
  t.deepEqual(result, { message: "User @user assigned to @mention" })
})

test("enter failed", async t => {
  const repository = { assignToMention: () => false }
  const spy = sinon.spy(repository, "assignToMention")

  const handler = handlers.get("enter")
  t.not(handler, undefined)
  const result = await handler({ repository }, ["mention"], "user")

  t.true(spy.calledOnceWithExactly("mention", ["user"]))
  t.deepEqual(result, {
    error: "Mention @mention doesn't exists or users are already assigned"
  })
})

test("enter others without permission", async t => {
  const repository = { assignToMention: () => true }
  const repositorySpy = sinon.spy(repository, "assignToMention")
  const telegram = {
    getChatAdministrators: () => ({ result: [] })
  }
  const telegramSpy = sinon.spy(telegram, "getChatAdministrators")

  const handler = handlers.get("enter")
  t.not(handler, undefined)
  const result = await handler(
    { repository, telegram },
    ["mention", "a", "b"],
    "user"
  )

  t.true(telegramSpy.calledOnce)
  t.true(repositorySpy.notCalled)
  t.deepEqual(result, { error: "Only admins can assign other users" })
})

test("enter others with permission", async t => {
  const repository = { assignToMention: () => true }
  const repositorySpy = sinon.spy(repository, "assignToMention")
  const telegram = {
    getChatAdministrators: () => ({
      result: [{ user: { username: "user" } }]
    })
  }
  const telegramSpy = sinon.spy(telegram, "getChatAdministrators")

  const handler = handlers.get("enter")
  t.not(handler, undefined)
  const result = await handler(
    { repository, telegram },
    ["mention", "a", "b"],
    "user"
  )

  t.true(telegramSpy.calledOnce)
  t.true(repositorySpy.calledOnceWithExactly("mention", ["a", "b"]))
  t.deepEqual(result, { message: "Users @a @b assigned to @mention" })
})

test("exit self", async t => {
  const repository = { unassignFromMention: () => true }
  const spy = sinon.spy(repository, "unassignFromMention")

  const handler = handlers.get("exit")
  t.not(handler, undefined)
  const result = await handler({ repository }, ["mention"], "user")

  t.true(spy.calledOnceWithExactly("mention", ["user"]))
  t.deepEqual(result, { message: "User @user unassigned from @mention" })
})

test("exit failed", async t => {
  const repository = { unassignFromMention: () => false }
  const spy = sinon.spy(repository, "unassignFromMention")

  const handler = handlers.get("exit")
  t.not(handler, undefined)
  const result = await handler({ repository }, ["mention"], "user")

  t.true(spy.calledOnceWithExactly("mention", ["user"]))
  t.deepEqual(result, {
    error: "Mention @mention doesn't exists or user(s) aren't assigned to it"
  })
})

test("exit others without permission", async t => {
  const repository = { unassignFromMention: () => true }
  const repositorySpy = sinon.spy(repository, "unassignFromMention")
  const telegram = { getChatAdministrators: () => [] }
  const telegramSpy = sinon.spy(telegram, "getChatAdministrators")

  const handler = handlers.get("exit")
  t.not(handler, undefined)
  const result = await handler(
    { repository, telegram },
    ["mention", "a", "b"],
    "user"
  )

  t.true(telegramSpy.calledOnce)
  t.true(repositorySpy.notCalled)
  t.deepEqual(result, { error: "Only admins can unassign other users" })
})

test("exit others with permission", async t => {
  const repository = { unassignFromMention: () => true }
  const repositorySpy = sinon.spy(repository, "unassignFromMention")
  const telegram = {
    getChatAdministrators: () => [{ user: { username: "user" } }]
  }
  const telegramSpy = sinon.spy(telegram, "getChatAdministrators")

  const handler = handlers.get("exit")
  t.not(handler, undefined)
  const result = await handler(
    { repository, telegram },
    ["mention", "a", "b"],
    "user"
  )

  t.true(telegramSpy.calledOnce)
  t.true(repositorySpy.calledOnceWithExactly("mention", ["a", "b"]))
  t.deepEqual(result, { message: "Users @a @b unassigned from @mention" })
})

test("mentions empty", async t => {
  const repository = { listMentions: () => [] }
  const spy = sinon.spy(repository, "listMentions")

  const handler = handlers.get("mentions")
  t.not(handler, undefined)
  const result = await handler({ repository }, [])

  t.true(spy.calledOnceWithExactly(null))
  t.deepEqual(result, { error: "No mentions found" })
})

test("mentions everyone", async t => {
  const repository = { listMentions: () => ["B", "a"] }
  const spy = sinon.spy(repository, "listMentions")

  const handler = handlers.get("mentions")
  t.not(handler, undefined)
  const result = await handler({ repository }, [])

  t.true(spy.calledOnceWithExactly(null))
  t.deepEqual(result, { reply: "a\nB" })
})

test("mentions me", async t => {
  const repository = { listMentions: () => ["a"] }
  const spy = sinon.spy(repository, "listMentions")

  const handler = handlers.get("mentions")
  t.not(handler, undefined)
  const result = await handler({ repository }, ["me"], "user")

  t.true(spy.calledOnceWithExactly("user"))
  t.deepEqual(result, { reply: "a" })
})

test("@ not found", async t => {
  const repository = { getMention: () => null }
  const spy = sinon.spy(repository, "getMention")

  const handler = handlers.get("@")
  t.not(handler, undefined)
  const result = await handler({ repository }, ["mention"])

  t.true(spy.calledOnceWithExactly("mention"))
  t.deepEqual(result, { empty: true })
})

test("@ match", async t => {
  const repository = { getMention: () => ["user", "a"] }
  const spy = sinon.spy(repository, "getMention")

  const handler = handlers.get("@")
  t.not(handler, undefined)
  const result = await handler({ repository }, ["mention"], "user")

  t.true(spy.calledOnceWithExactly("mention"))
  t.deepEqual(result, { reply: "@a" })
})

test("@ silent", async t => {
  const repository = { getMention: () => ["user", "a"] }
  const spy = sinon.spy(repository, "getMention")

  const handler = handlers.get("@")
  t.not(handler, undefined)
  const result = await handler({ repository }, ["!mention"])

  t.true(spy.calledOnceWithExactly("mention"))
  t.deepEqual(result, { reply: "a\nuser" })
})

test("@admins", async t => {
  const repository = { getMention: () => null }
  const repositorySpy = sinon.spy(repository, "getMention")
  const telegram = {
    getChatAdministrators: () => [
      { user: { username: "user" } },
      { user: { username: "a" } }
    ]
  }
  const telegramSpy = sinon.spy(telegram, "getChatAdministrators")

  const handler = handlers.get("@")
  t.not(handler, undefined)
  const result = await handler({ repository, telegram }, ["admins"])

  t.true(telegramSpy.calledOnce)
  t.true(repositorySpy.notCalled)
  t.deepEqual(result, { reply: "@a @user" })
})
