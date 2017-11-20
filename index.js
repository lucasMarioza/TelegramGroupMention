const Slimbot = require('slimbot');
const slimbot = new Slimbot(process.env['KEY']);

let mentions = {

};

newGroup = function(groupId){
	mentions[groupId] = {};
}

newMention = function(groupId,mention){
	if(mentions[groupId] === undefined) newGroup(groupId);
	if(mentions[groupId][mention] !== undefined) return false;
	mentions[groupId][mention] = [];
	return true;
}

assignToMention = function(groupId,mention,username){
	if(mentions[groupId] === undefined || mentions[groupId][mention] === undefined) return false;


	if(!mentions[groupId][mention].find(u => u == username)){
		mentions[groupId][mention].push(username);
	}
	return true;
}

deleteMention = function(groupId,mention){
	if(mentions[groupId] !== undefined) delete mentions[groupId][mention];
}

getMention = function(groupId,mention){
	if(mentions[groupId] === undefined || mentions[groupId][mention] === undefined || mentions[groupId][mention].length == 0) return '';
	return mentions[groupId][mention].map(id=>'@'+id).join(' ');
}

// Register listeners

slimbot.on('message', message => {
  if(!message.text) return;
  console.log(message);
  if(message.text.startsWith('/newMention ')){
  	let mention = message.text.split(' ')[1];
  	if(newMention(message.chat.id,mention)){
  		slimbot.sendMessage(message.chat.id, 'Mention @'+mention+' created.');
  	}else{
  		slimbot.sendMessage(message.chat.id, 'Mention @'+mention+' already exists.');
  	}
  }else if(message.text.startsWith('/assignTo ')){
  	let mention = message.text.split(' ')[1];
  	let user = message.from.username;
  	if(assignToMention(message.chat.id,mention,user)){
  		slimbot.sendMessage(message.chat.id, 'user @'+user+' assigned to @'+mention+'.');
  	}else{
  		slimbot.sendMessage(message.chat.id, 'Mention @'+mention+' does not exists. Use /newMention to create.');
  	}
  }else if(message.text.startsWith('/deleteMention ')){
  	let mention = message.text.split(' ')[1];
  	deleteMention(message.chat.id,mention);
	slimbot.sendMessage(message.chat.id, 'Mention @'+mention+' deleted.');
  }else if(message.text[0] === '@'){
  	let mention = message.text.split(' ')[0].replace('@','');
  	let response = getMention(message.chat.id,mention);
  	if(response !== '') slimbot.sendMessage(message.chat.id, response,{reply_to_message_id: message.message_id});
  }
});

// Call API

slimbot.startPolling();