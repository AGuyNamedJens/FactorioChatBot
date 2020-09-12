//0.01 
const Discord = require("discord.js");
var fs = require('fs');
var chokidar = require('chokidar');
var Rcon = require('rcon');

var config = require('./config.json');

const bot = new Discord.Client();


fs.writeFile(config.logFile, '', function(){
	console.log('cleared previous chat log')
});

bot.login(config.token);

var conn;
//connect to Rcon
function RconConnect()
{
	conn = new Rcon(config.RconIP, config.RconPort, config.RconPassword);

		conn.on('auth', function() {
		  console.log("Authenticated!");
		  
		  if(config.startupMessage.enabled) {
			if(config.cleanMessages == true) {
				conn.send('/silent-command game.print("[Chat System]: ' + config.startupMessage.message + '")');
			} else {
				conn.send('[Chat System]: ' + config.startupMessage.message);
			}
		  }

		}).on('end', function() {
		  console.log("Socket closed! Retrying to connect..");
		  //failed to connect try again
		  RconConnect();
		}).on('error', function() {
		  console.log("An error occoured. Retrying to connect..");
		  //failed to connect try again
		  RconConnect();
		});
		console.log("Connecting to the Factorio Server..");
		conn.connect();
}
	
 
//on bot start
bot.on("ready", () => {

	//connect to rcon
	RconConnect();

    console.log('Connected! Logged in as: '+ bot.user.username + ' - (' + bot.user.id + ')');
    bot.channels.cache.get(config.chatChannel).send("[Chat System]: Online!")

	//watch the log file for update
	chokidar.watch(config.logFile, {ignored: /(^|[\/\\])\../}).on('all', (event, path) => {
		readLastLine(config.logFile);
	});
});

//when we get a message from the chat channel on discord
bot.on("message", (message) => {
	if(message.content.length > 0 && !message.author.bot && message.channel.id === config.chatChannel)
	{

		// send to the server
		
		if(config.cleanMessages == true) {
			conn.send('/silent-command game.print("[Discord] ' + message.author.username + ': ' + message.content + '")');
		} else {
			conn.send('[Discord] ' + message.author.username + ': ' + message.content);
		}
		// send to the channel showing someone sent a message to the server
		message.channel.send(":speech_balloon: | `"+ message.author.username+ "`: " + message.content);

		// delete their message
        message.delete();
	}
	else if(message.content.length > 0 && !message.author.bot && message.channel.id === config.consoleChannel);
	{
		// send command to the server
		conn.send('/command '+ message.content);
	}
});


//-----------------------------------------------
//user functions 

function parseMessage(msg)
{
    var index = msg.indexOf(']');
    var indexName = msg.indexOf(': ');
    var newMsg = "`" + msg.slice(index+2, indexName) + "`" + msg.slice(indexName);

	if (undefined !== msg && msg.length && index > 1)
	{
        //console.log(msg.slice(1,index), msg.slice(index+1));

        if(msg.slice(1,index).includes("LEAVE")) bot.channels.cache.get(config.chatChannel).send(":red_circle: | " + msg.slice(index+2))
        else if(msg.slice(1,index).includes("JOIN")) bot.channels.cache.get(config.chatChannel).send(":green_circle: | " + msg.slice(index+2))
        else if(msg.slice(1,index).includes("CHAT") && !msg.includes("<server>")) bot.channels.cache.get(config.chatChannel).send(":speech_left: | " + newMsg)
        else if(!msg.includes("<server>") && config.consoleChannel !== "false") bot.channels.cache.get(config.consoleChannel).send("? | " + msg.slice(index+1))
	}
	
}

function readLastLine(path)
{
	fs.readFile(path, 'utf-8', function(err, data) 
	{
		//get last line of file. 
		if (err) throw err;
		var lines = data.trim().split('\n');
		lastLine = lines.slice(-1)[0];
		console.log(lastLine);
		if(path == config.logFile && lastLine.length > 0)  //logFile
		{
			//pasrs name and message
			parseMessage(lastLine);
		}		
	});
		
	
}











