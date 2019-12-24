const test = require("ava")
const sinon = require("sinon")

const handlers = require(".")

test("create", async t => {
  const repository = { createMention: () => true }
  const spy = sinon.spy(repository, "createMention")

  const handler = handlers.get("create")
  t.not(handler, undefined)
  const result = await handler(repository, ["mention"])

  t.true(spy.calledOnceWithExactly("mention"))
  t.deepEqual(result, { message: "Mention @mention created." })
})

test("create failed", async t => {
  const repository = { createMention: () => false }
  const spy = sinon.spy(repository, "createMention")

  const handler = handlers.get("create")
  t.not(handler, undefined)
  const result = await handler(repository, ["mention"])

  t.true(spy.calledOnceWithExactly("mention"))
  t.deepEqual(result, { error: "Mention @mention already exists." })
})

test("delete", async t => {
  const repository = { deleteMention: () => true }
  const spy = sinon.spy(repository, "deleteMention")

  const handler = handlers.get("delete")
  t.not(handler, undefined)
  const result = await handler(repository, ["mention"])

  t.true(spy.calledOnceWithExactly("mention"))
  t.deepEqual(result, { message: "Mention @mention deleted." })
})

test("delete failed", async t => {
  const repository = { deleteMention: () => false }
  const spy = sinon.spy(repository, "deleteMention")

  const handler = handlers.get("delete")
  t.not(handler, undefined)
  const result = await handler(repository, ["mention"])

  t.true(spy.calledOnceWithExactly("mention"))
  t.deepEqual(result, { error: "Mention @mention doesn't exists." })
})
