const Discord = require("discord.js");
var fs = require("fs");
var chokidar = require("chokidar");

var { Rcon } = require("rcon-client");

var config = require("./config.json");

const bot = new Discord.Client();

fs.writeFile(config.logFile, "", function () {
	console.log("Cleared previous chat log");
});

bot.login(config.token);


var rcon;
var tries = 1;

function RconConnect()
{
	rcon = new Rcon({host: config.RconIP, port: config.RconPort, password: config.RconPassword});

	rcon.connect().catch(error => {
		console.error(error);

		// try again with a max of 10 tries in a cooldown of 5 seconds per try
		if(tries <= 10) {
			console.log(`Reconnect attempt ${tries}/10..`)
			setTimeout(function() {
				RconConnect();
				tries++;
			}, 5000)
		}
	});

	// Connected, which means the connection is successful
	rcon.on("connect", () => {
		console.log(`Connected to the factorio server!`)
	});
	// Authenticated, which means the authentication is successful and the system is online
    rcon.on("authenticated", () => {
		console.log(`Authenticated!`)
		if(config.startupMessage.enabled) {
			if(config.cleanMessages == true) {
				rcon.send('/silent-command game.print("[Chat System]: ' + config.startupMessage.message + '")');
			} else {
				rcon.send('[Chat System]: ' + config.startupMessage.message);
			}
		}	
	});

	// In case any errors occour, log them to console and terminate the connection
    rcon.on("error", (err) => {
		console.error(`Error: ${err}`);
		rcon.end();
	});
	
	// In case the connection was ended, terminated or whatever else happened. Log a message and reconnect
	rcon.on("end", () => {
		console.log(`Socket connection ended! Reconnecting..`)
		RconConnect();
	});
};

/*
* Bot start event
*/

bot.on("ready", () => {
	//connect to rcon
	RconConnect();

    console.log('Connected to Discord! Logged in as: '+ bot.user.username + ' - (' + bot.user.id + ')');
	bot.channels.cache.get(config.chatChannel).send("[Chat System]: Online!")
	
	//watch the log file for updates
	chokidar.watch(config.logFile, {ignored: /(^|[\/\\])\../}).on('all', (event, path) => {
		readLastLine(config.logFile);
	});
});

/*
* Discord message event
*/

bot.on("message", (message) => {
	if(!message.content.length > 0) return;
	if(message.author.bot) return;

	if(message.channel.id === config.chatChannel) {
		// send to the server
		if(config.cleanMessages == true) {
			rcon.send('/silent-command game.print("[color=#7289DA][Discord] ' + message.author.username + ': ' + message.content + '[/color]")');
		} else {
			rcon.send('[color=#7289DA][Discord] ' + message.author.username + ': ' + message.content+ '[/color]');
		}
		// send to the channel showing someone sent a message to the server and delete their message from the channel
		message.channel.send(":speech_balloon: | `"+ message.author.username+ "`: " + message.content);
		message.delete();
		
		} else if(message.channel.id === config.consoleChannel) {
		// send command to the server
		rcon.send('/'+ message.content);
		// send to the channel showing someone sent a command to the server
		message.channel.send("COMMAND RAN | `"+ message.author.username+ "`: " + message.content);
	}
});

/*
* Chat function
*/

function parseMessage(msg)
{
    var index = msg.indexOf(']');
    var indexName = msg.indexOf(': ');
    var newMsg = "`" + msg.slice(index+2, indexName) + "`" + msg.slice(indexName);

	if (msg.length && index > 1) {
		if(msg.slice(1,index).includes("LEAVE")) {
			// Send leave message to the Discord channel
			bot.channels.cache.get(config.chatChannel).send(":red_circle: | " + msg.slice(index+2))
			//Send leave message to the server
			if(config.cleanMessages == true) rcon.send('/silent-command game.print("[color=red]'+ msg.slice(index+2) + '[/color]")');
			else rcon.send('[color=red]' + msg.slice(index+2) + '[/color]');
		} else if(msg.slice(1,index).includes("JOIN")){
			// Send join message to the Discord channel
			bot.channels.cache.get(config.chatChannel).send(":green_circle: | " + msg.slice(index+2))
			// Send join message to the server
			if(config.cleanMessages == true) rcon.send('/silent-command game.print("[color=green]'+ msg.slice(index+2) + '[/color]")');
			else rcon.send('[color=red]' + msg.slice(index+2) + '[/color]');
		} else if(msg.slice(1,index).includes("CHAT") && !msg.includes("<server>")) {
			// Send incoming chat from the server to the Discord channel
			bot.channels.cache.get(config.chatChannel).send(":speech_left: | " + newMsg)
		} else if(!msg.includes("<server>") && config.consoleChannel !== "false") {
			// Send incoming message from the server, which has no category or user to the Discord console channel
			bot.channels.cache.get(config.consoleChannel).send("? | " + msg.slice(index+1))
		}
	}
}

/*
* Logging function
*/

function readLastLine(path)
{
	fs.readFile(path, 'utf-8', function(err, data) 
	{
		//get last line of file. 
		if (err) throw err;
		var lines = data.trim().split('\n');
		lastLine = lines.slice(-1)[0];

		// I should really optimize or completely remove this line
		if(config.logLines == true) console.log(lastLine);

		if(path == config.logFile && lastLine.length > 0) {
			// Parse name and message and send it
			parseMessage(lastLine);
		}		
	});
		
	
}

/*
* Will be used as listing the online players in the future
* DISABLES ACHIEVEMENTS
*/

/*async function onlinePlayers() {
	
    rcon.on("connect", () => console.log(`Connected`));
    rcon.on("error", (err) => {
		console.log(`Error: ${err}`);
    });
    rcon.on("authenticated", () => console.log(`Authenticated`));
	rcon.on("end", () => console.log(`End`));
	
	await rcon.connect();

	const res = await rcon.send(`/sc 
	local players = {}
	local max for _, player in pairs(game.connected_players) do 
	players[#players+1] = player.name
	end 
	rcon.print(unpack(players))
	`)
	rcon.end();
}*/