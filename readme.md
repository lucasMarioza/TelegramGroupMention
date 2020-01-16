# Telegram Group Mention
Create custom mentions in your Telegram chat, much like Discord's role mentions.

## Usage
* `/create_foo` to a create a group mention called `foo`
* `/enter_foo` to subscribe to a group mention called `foo`
* `/exit_foo` to unsubscribe from a group mention called `foo`
* `/delete_foo` to delete a group mention called `foo`
* `/mentions [username]` to list the group's mentions, optionally passing an username filter (use `me` for your own mentions)
* `@foo` to tag members of mention `foo` (this not includes yourself)
* `@!foo` to list members of mention `foo` without tagging them
* `@admins` to tag group admins

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
export MONGODB_URI=...
export PORT=...
npm start
```