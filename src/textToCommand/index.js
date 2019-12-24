const invalid = { invalid: true }

function separator(text) {
  const [command, ...parameters] = text.split(" ")
  return [...command.replace("_", " ").split(" "), ...parameters]
}

function textToCommand(text) {
  if (text[0] != "@" && text[0] != "/") return invalid
  let [name, ...params] = separator(text)
  if (name.substr(1) === "") return invalid
  if (name[0] === "@") return { name: "@", params: [name.substr(1)] }
  if (name[0] === "/") return { name: name.substr(1), params }
}

module.exports = textToCommand
