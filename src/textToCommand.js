function separator(text) {
  const [command, ...parameters] = text.split(" ");
  return [...command.replace("_", " ").split(" "), ...parameters];
}
function textToCommand(text) {
  if (text[0] != "@" && text[0] != "/") return { invalid: true };
  let [name, ...params] = separator(text);
  if (name.match(/^@/)) return { name: "@", params: [name.substr(1)] };
  if (name.match(/^\//)) return { name: name.substr(1), params };
}

module.exports = textToCommand;
