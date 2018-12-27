let __mentions = {}

function setMentionsVar(mentions) {
  __mentions = mentions
}

function getMentionsVar() {
  return __mentions
}

function createMention(mention, username) {
  if (__mentions[mention] !== undefined) return false
  __mentions[mention] = [username]
  return true
}

function assignToMention(mention, username) {
  if (__mentions[mention] === undefined) return false

  if (!__mentions[mention].find(u => u == username)) {
    __mentions[mention].push(username)
  }
  return true
}

function deleteMention(mention) {
  if (!Array.isArray(__mentions[mention])) return false
  delete __mentions[mention]
  return true
}

function getMention(mention, username) {
  if (__mentions[mention] === undefined || __mentions[mention].length == 0)
    return ""
  return __mentions[mention]
    .map(id => {
      return id !== username ? ` @${id}` : ""
    })
    .sort()
    .join("")
}

function getAllMentions() {
  return Object.keys(__mentions)
    .map(id => `@${id}`)
    .sort()
    .join("\n")
}

function unassign(mention, username) {
  if (__mentions[mention] === undefined) return false

  if (!__mentions[mention].find(u => u == username)) {
    return false
  }
  __mentions[mention] = __mentions[mention].filter(id => id !== username)
  return true
}

module.exports = {
  getMentionsVar,
  setMentionsVar,
  createMention,
  assignToMention,
  deleteMention,
  getMention,
  getAllMentions,
  unassign
}
