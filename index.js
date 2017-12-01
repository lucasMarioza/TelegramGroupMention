const Slimbot = require("slimbot")
const slimbot = new Slimbot(process.env["BOT_KEY"])
const restify = require('restify');


const commands = require("./commands")
const handleMessage = require("./handlers")


const firebase = require("firebase")


let server = restify.createServer();
//console.log(restify);
server.use(restify.plugins.bodyParser());


// Initialize Firebase
var config = {
  apiKey: process.env["FIREBASE_KEY"],
  authDomain: "mentionbot-fa86b.firebaseapp.com",
  databaseURL: "https://mentionbot-fa86b.firebaseio.com",
  projectId: "mentionbot-fa86b",
  storageBucket: "mentionbot-fa86b.appspot.com",
  messagingSenderId: "271181642792"
}

const fireApp = firebase.initializeApp(config)

slimbot.setWebhook({ url: `${process.env["ORIGIN"]}/${process.env["BOT_KEY"]}` });

slimbot.getWebhookInfo();

// Register listeners
server.post(`/${process.env["BOT_KEY"]}`, function handle(req, res) {
  let message = req.body.message;
  if (!message.text) return
  mention = firebase
    .database()
    .ref(`/groups/${message.chat.id}`)
    .once("value")
    .then(function(snapshot) {
      commands.setMentionsVar(snapshot.val() || {})
      handleMessage(message)
      firebase
        .database()
        .ref(`/groups/${message.chat.id}`)
        .set(commands.getMentionsVar())
    })

});

server.listen(process.env["PORT"]);