const Slimbot = require("slimbot")
const slimbot = new Slimbot(process.env["BOT_KEY"])
//using this to host on heroku
const express = require("express")
const app = express()

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

let mentions = {}

newMention = function(mention, username) {
  if (mentions[mention] !== undefined) return false
  mentions[mention] = [username]
  return true
}

assignToMention = function(mention, username) {
  if (mentions[mention] === undefined) return false

  if (!mentions[mention].find(u => u == username)) {
    mentions[mention].push(username)
  }
  return true
}

deleteMention = function(mention) {
  delete mentions[mention]
}

getMention = function(mention, username) {
  if (mentions[mention] === undefined || mentions[mention].length == 0)
    return ""
  return mentions[mention]
    .map(id => {
      return id !== username ? " @" + id : ""
    })
    .join("")
}

getAllMentions = function() {
  return Object.keys(mentions)
    .map(id => "@" + id)
    .join("\n")
}

unassign = function(mention, username) {
  if (mentions[mention] === undefined) return false

  if (!mentions[mention].find(u => u == username)) {
    return false
  }
  mentions[mention] = mentions[mention].filter(id => id !== username)
  return true
}
// Register listeners

slimbot.on("message", message => {
  if (!message.text) return
  mention = firebase
    .database()
    .ref("/groups/" + message.chat.id)
    .once("value")
    .then(function(snapshot) {
      mentions = snapshot.val() || {}

      if (message.text.startsWith("/newMention ")) {
        let mention = message.text.split(" ")[1]
        let user = message.from.username
        if (newMention(mention, user)) {
          slimbot.sendMessage(
            message.chat.id,
            "Mention @" + mention + " created."
          )
        } else {
          slimbot.sendMessage(
            message.chat.id,
            "Mention @" + mention + " already exists."
          )
        }
      } else if (message.text.startsWith("/assignTo ")) {
        let mention = message.text.split(" ")[1]
        let user = message.from.username
        if (assignToMention(mention, user)) {
          slimbot.sendMessage(
            message.chat.id,
            "user @" + user + " assigned to @" + mention + "."
          )
        } else {
          slimbot.sendMessage(
            message.chat.id,
            "Mention @" +
              mention +
              " does not exists. Use /newMention to create."
          )
        }
      } else if (message.text.startsWith("/unassign ")) {
        let mention = message.text.split(" ")[1]
        let user = message.from.username
        if (unassign(mention, user)) {
          slimbot.sendMessage(
            message.chat.id,
            "user @" + user + " unassigned of @" + mention + "."
          )
        } else {
          slimbot.sendMessage(
            message.chat.id,
            "Mention @" +
              mention +
              " does not exists or you already wasn't assigned into it."
          )
        }
      } else if (message.text.startsWith("/deleteMention ")) {
        let mention = message.text.split(" ")[1]
        deleteMention(mention)
        slimbot.sendMessage(
          message.chat.id,
          "Mention @" + mention + " deleted."
        )
      } else if (message.text.startsWith("/mentions")) {
        let response = getAllMentions().trim()
        if (response !== "") {
          slimbot.sendMessage(message.chat.id, response, {
            reply_to_message_id: message.message_id
          })
        } else {
          slimbot.sendMessage(
            message.chat.id,
            "No mentions created for this group yet."
          )
        }
      } else if (message.text[0] === "@") {
        let mention = message.text.split(" ")[0].replace("@", "")
        let response = getMention(mention, message.from.username).trim()
        if (response !== "")
          slimbot.sendMessage(message.chat.id, response, {
            reply_to_message_id: message.message_id
          })
      }
      firebase
        .database()
        .ref("/groups/" + message.chat.id)
        .set(mentions)
    })
})

// Call API

slimbot.startPolling()
