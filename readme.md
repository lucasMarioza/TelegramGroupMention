# Telegram Group Mention
Create custom mentions in your Telegram chat

## Getting Started
Clone this repo
```bash
git clone https://github.com/lucasMarioza/TelegramGroupMention
```
Install dependencies
```bash
npm install
```
Set environment variables and run
```bash
export BOT_KEY=...
export FIREBASE_ID=...
export FIREBASE_KEY=...
export FIREBASE_SENDER=...
npm start
```

## Commands
`/createMention MENTION_NAME` creates a new group mention  
`/assignTo MENTION_NAME` subscribe to a group mention  
`/deleteMention MENTION_NAME` deletes a group mention
