let mentions = {}

function newMention(mention, username) {
  if (mentions[mention] !== undefined) return false
  mentions[mention] = [username]
  return true
}

function assignToMention(mention, username) {
  if (mentions[mention] === undefined) return false

  if (!mentions[mention].find(u => u == username)) {
    mentions[mention].push(username)
  }
  return true
}

function deleteMention(mention) {
  if (!Array.isArray(mentions[mention])) return false
  delete mentions[mention]
  return true
}

function getMention(mention, username) {
  if (mentions[mention] === undefined || mentions[mention].length == 0)
    return ""
  return mentions[mention]
    .map(id => {
      return id !== username ? ` @${id}` : ""
    })
    .join("")
}

function getAllMentions() {
  return Object.keys(mentions)
    .map(id => `@${id}`)
    .join("\n")
}

function unassign(mention, username) {
  if (mentions[mention] === undefined) return false

  if (!mentions[mention].find(u => u == username)) {
    return false
  }
  mentions[mention] = mentions[mention].filter(id => id !== username)
  return true
}

module.exports = {
  mentions,
  newMention,
  assignToMention,
  deleteMention,
  getMention,
  getAllMentions,
  unassign
}
