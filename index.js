const Slimbot = require("slimbot")
const slimbot = new Slimbot(process.env["BOT_KEY"])
const restify = require("restify")

const commands = require("./commands")
const handleMessage = require("./handlers")

const firebase = require("firebase")

let server = restify.createServer()
//console.log(restify);
server.use(restify.plugins.bodyParser())

// Initialize Firebase
var config = {
  apiKey: process.env["FIREBASE_KEY"],
  authDomain: `${process.env["FIREBASE_ID"]}.firebaseapp.com`,
  databaseURL: `https://${process.env["FIREBASE_ID"]}.firebaseio.com`,
  projectId: process.env["FIREBASE_ID"],
  storageBucket: `${process.env["FIREBASE_ID"]}.appspot.com`,
  messagingSenderId: process.env["FIREBASE_SENDER"]
}

const fireApp = firebase.initializeApp(config)

slimbot.setWebhook({
  url: `${process.env["ORIGIN"]}/${process.env["BOT_KEY"]}`
})

slimbot.getWebhookInfo()

// Register listeners
server.post(`/${process.env["BOT_KEY"]}`, function handle(req, res, next) {
  let message = req.body.message
  if (!message || !message.text) {
    res.send(200)
    return next()
  }

  mention = firebase
    .database()
    .ref(`/groups/${message.chat.id}`)
    .once("value")
    .then(async function(snapshot) {
      commands.setMentionsVar(snapshot.val() || {})
      await handleMessage(message)
      firebase
        .database()
        .ref(`/groups/${message.chat.id}`)
        .set(commands.getMentionsVar())
    })
  res.send(200)
  return next()
})

server.listen(process.env["PORT"])
