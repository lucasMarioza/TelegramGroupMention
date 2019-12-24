const test = require("ava")

const textToCommand = require(".")

test("not a command", t => {
  t.deepEqual(textToCommand("command"), {
    invalid: true
  })
})

test("empty mention", t => {
  t.deepEqual(textToCommand("@"), {
    invalid: true
  })
})

test("mention", t => {
  t.deepEqual(textToCommand("@mention"), {
    name: "@",
    params: ["mention"]
  })
  t.deepEqual(textToCommand("@mention hey"), {
    name: "@",
    params: ["mention"]
  })
})

test("empty command", t => {
  t.deepEqual(textToCommand("/"), {
    invalid: true
  })
})

test("simple command", t => {
  t.deepEqual(textToCommand("/command"), {
    name: "command",
    params: []
  })
})

test("command with parameters", t => {
  t.deepEqual(textToCommand("/command a b"), {
    name: "command",
    params: ["a", "b"]
  })
  t.deepEqual(textToCommand("/command_a b c"), {
    name: "command",
    params: ["a", "b", "c"]
  })
  t.deepEqual(textToCommand("/command_a_b"), {
    name: "command",
    params: ["a_b"]
  })
})
