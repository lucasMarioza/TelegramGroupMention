const Slimbot = require("slimbot")
const slimbot = new Slimbot(process.env["BOT_KEY"])
//using this to host on heroku
const express = require("express")
const app = express()

const commands = require("./commands")
const handleMessage = require("./handlers")

app.get("/", (req, res) => res.send("Hello World!"))

app.listen(process.env["PORT"], () => console.log(""))

const firebase = require("firebase")

// Initialize Firebase
var config = {
  apiKey: process.env["FIREBASE_KEY"],
  authDomain: "mentionbot-fa86b.firebaseapp.com",
  databaseURL: "https://mentionbot-fa86b.firebaseio.com",
  projectId: "mentionbot-fa86b",
  storageBucket: "mentionbot-fa86b.appspot.com",
  messagingSenderId: "271181642792"
}
console.log(config)
const fireApp = firebase.initializeApp(config)

// Register listeners
slimbot.on("message", message => {
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
})

// Call API

slimbot.startPolling()
