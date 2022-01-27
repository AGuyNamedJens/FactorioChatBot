const Discord = require("discord.js");
var fs = require("fs");
var chokidar = require("chokidar");

var { Rcon } = require("rcon-client");

var config = require("./config.json");

const bot = new Discord.Client({ intents: ['GUILD_MESSAGES', 'GUILDS'], allowedMentions: { users: [], roles: [] } });

bot.login(config.token);


var rcon;
var tries = 1;

function RconConnect() {
	rcon = new Rcon({ host: config.RconIP, port: config.RconPort, password: config.RconPassword });

	rcon.connect().catch(error => {
		console.error(error);

		// try again with a max of 10 tries in a cooldown of 5 seconds per try
		if (tries <= 10) {
			console.log(`Reconnect attempt ${tries}/10..`)
			setTimeout(function () {
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

		clearLogFile();

		if (config.startupMessage.enabled) {
			if (config.cleanMessages == true) {
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

	console.log('Connected to Discord! Logged in as: ' + bot.user.username + ' - (' + bot.user.id + ')');
	bot.channels.cache.get(config.chatChannel).send("[Chat System]: Online!")

	//watch the log file for updates
	chokidar.watch(config.logFile, { ignored: /(^|[\/\\])\../ }).on('all', (event, path) => {
		readLastLine(config.logFile);
	});
});

/*
* Discord message event
*/

bot.on("messageCreate", async (message) => {
	if (!message.content.length > 0) return;
	if (message.author.bot) return;

	if (message.channel.id === config.chatChannel) {
		// send to the server
		if (config.cleanMessages) {
			rcon.send('/silent-command game.print("[color=#7289DA][Discord] ' + message.author.username + ': ' + message.content + '[/color]")');
		} else {
			rcon.send('[color=#7289DA][Discord] ' + message.author.username + ': ' + message.content + '[/color]');
		}
		// send to the channel showing someone sent a message to the server and delete their message from the channel
		message.channel.send(":speech_balloon: | `" + message.author.username + "`: " + message.content);
		message.delete();

	} else if (message.channel.id === config.consoleChannel) {
		// send command to the server
		rcon.send('/' + message.content);
		// send to the channel showing someone sent a command to the server
		message.channel.send("COMMAND RAN | `" + message.author.username + "`: " + message.content);
	} else if (message.content.startsWith(`${config.prefix}online`)) {
		// Command with the prefix defined in config.js to show online players
		const players = await getOnlinePlayers();
		const isMulti = players.length > 0 ? "(s)" : "";
		// Send the message to the Discord channel
		message.channel.send(`There are currently ${players.length} player${isMulti} online with the name${isMulti}:\n- \`${players.join("`\n- `")}\`.`);
	}
});

// Get online players

async function getOnlinePlayers() {
	// Run the command "/players online"
	var res = await rconCommand("/p o");
	// Turn result into an array, remove the first and last array element
	res = res.split("\n").slice(1, -1);
	// create a new array
	var onlinePlayers = [];

	res.forEach(player => {
		// remove white spaces at the start and remove (online) from the end
		player = player.trim().split(" (online)")[0];
		// push result to a new array
		onlinePlayers.push(player);
	})
	return onlinePlayers;
}

/*
* Chat function to parse the messages
*/

function parseMessage(msg) {
	var index = msg.indexOf(']');
	var indexName = msg.indexOf(': ');
	var newMsg = "`" + msg.slice(index + 2, indexName) + "`" + msg.slice(indexName);

	var indication = msg.slice(index + 2, indexName);
	var message;

	if (!msg.length && index == 0) return;

	console.log(newMsg, index);

	switch (indication) {
		case "LEAVE":
			// Send leave message to the Discord channel
			bot.channels.cache.get(config.chatChannel).send(":red_circle: | " + msg.slice(index + 2))
			// Send leave message to the server
			message = '[color=red]' + msg.slice(index + 2) + '[/color]")';
			break;
		case "JOIN":
			// Send join message to the Discord channel
			bot.channels.cache.get(config.chatChannel).send(":green_circle: | " + msg.slice(index + 2))
			// Send join message to the server
			message = '[color=green]' + msg.slice(index + 2) + '[/color]")'
			break;
		case "CHAT":
			if (msg.includes("<server>")) break;
			// Send incoming chat from the server to the Discord channel
			bot.channels.cache.get(config.chatChannel).send(":speech_left: | " + newMsg)
			break;
		case "<server>":
			if (!config.consoleChannel) break;
			// Send incoming console message from the server to the Discord channel
			bot.channels.cache.get(config.consoleChannel).send(":console: | " + newMsg)
			break;
		default:
			if (indication == "<server>" || !config.consoleChannel) break;
			// Send incoming message from the server, which has no category or user to the Discord console channel
			bot.channels.cache.get(config.consoleChannel).send("? | " + msg.slice(index + 1))
			break;
	}

	if (config.cleanMessages) {
		rcon.send('/silent-command game.print(' + message + ')');
	}
	else {
		rcon.send(message);
	}
}

/*
* Logging function
*/

function readLastLine(path) {
	fs.readFile(path, 'utf-8', function (err, data) {
		//get last line of file. 
		if (err) throw err;
		var lines = data.trim().split('\n');
		let lastLine = lines.slice(-1)[0];

		// Debugging feature. If enabled, sends the last line to the console
		if (config.logLines) console.log(lastLine);

		if (path == config.logFile && lastLine.length > 0) {
			// Parse name and message and send it
			parseMessage(lastLine);
		}
	});


}

// Clear the logFile to prevent massive disk usage
function clearLogFile() {
	fs.writeFile(config.logFile, "", function () {
		console.log("Cleared previous chat log");
	});

}

/*	rconCommand function
*	Returns an array of 2, first being the command response, second being the error (if there is one, otherwise it's empty)
*/
async function rconCommand(command) {
	if (!command.startsWith("/")) command = `/${command}`;
	try {
		let resp = await rcon.send(command);
		if (typeof resp == "string" && resp.length) return resp;
		else throw new Error("No length");
	} catch (error) {
		throw Error(`RCON Error --- Details --- \nNAME: ${error.name} \nDESC: ${error.description}`);
	}
}