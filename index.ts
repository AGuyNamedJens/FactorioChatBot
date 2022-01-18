import Discord, { Client, Intents } from 'discord.js';
import fs from "fs";
import chokidar from "chokidar";
import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { APIMessage, Routes } from 'discord-api-types/v9';

import { Rcon } from "rcon-client";

var config: Config = require("./config.json");

const rest = new REST({version: '9'}).setToken(config.token);

const bot = new Discord.Client({ intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS], allowedMentions: { users: [], roles: [] } });

const Commands: Discord.Collection<string, Command> = new Discord.Collection();

bot.login(config.token);

interface Config {
	/**
	 * The file that the server is set to log to, as defined with the `--console-log` flag or config option.
	 */
	logFile: string;

	/**
	 * The channel the bot is set to send and receive messages from.
	 */
	chatChannel: string;

	/**
	 * Whether or not to clean log file messages upon startup.
	 */
	cleanMessages: boolean;

	/**
	 * Whether or not members with administrator permissions on the Discord server may run commands in-game via `?command`.
	 */
	adminsCanRunCommands: boolean;

	/**
	 * Whether or not to send miscellaneous server messages to the chat channel.
	 */
	sendServerMessages: boolean;

	/**
	 * Whether or not to log all lines read by the bot from the log file to the console.
	 */
	logLines: boolean;

	startupMessage: {
		/**
		 * Whether or not the startup message is enabled.
		 */
		enabled: boolean;

		/**
		 * The contents of the startup message, to be sent to the Factorio server.
		 */
		message: string;
	}

	/**
	 * The RCON IP. Most of the time, this should be set to the localhost, `127.0.0.1`, unless connecting to a remote Factorio server.
	 */
	RconIP: string;

	/**
	 * The RCON port, as defined with the `--rcon-port` flag or config option. Most of the time, this should be set to `8080`, unless connecting to a remote Factorio server.
	 */
	RconPort: number;

	/**
	 * The RCON password, as defined with the `--rcon-password` flag or config option.
	 */
	RconPassword: string;

	/**
	 * The bot's token.
	 */
	token: string;
}

interface Command {
    /**
     * The command name.
     */
    data: Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">;

    execute(interaction: Discord.CommandInteraction): void;
}

var rcon: Rcon;
var tries = 1;

function RconConnect() {
	rcon = new Rcon({ host: config.RconIP, port: config.RconPort, password: config.RconPassword });

	rcon.connect().catch(error => {
		console.error(error);

		// try again with a max of 10 tries in a cooldown of 5 seconds per try
		if (tries <= 10) {
			console.log(`Attempting to reconnect... (${tries}/10)`);
			setTimeout(function () {
				RconConnect();
				tries++;
			}, 5000)
		}
	});

	// Connected, which means the connection is successful
	rcon.on("connect", () => {
		console.log('Connected to the Factorio server!');
	});

	// Authenticated, which means the authentication is successful and the system is online
	rcon.on("authenticated", () => {
		console.log('Authenticated!');

		clearLogFile();

		if (config.startupMessage.enabled) {
			if (config.cleanMessages == true) {
				rcon.send('/silent-command game.print("[Chat System]: ' + config.startupMessage.message + '")');
			}
			else {
				rcon.send('[Chat System]: ' + config.startupMessage.message);
			}
		}
	});

	// In case any errors occour, log them to console and terminate the connection
	rcon.on("error", (err) => {
		console.error(`Error: ${err}`);
		rcon.end();
	});

	// In case the connection was ended, terminated or whatever else happened. Log a message
	rcon.on("end", () => {
		console.log('Socket connection ended!');
	});
};

/*
* Bot start event
*/

bot.on("ready", () => {
	//connect to rcon
	RconConnect();

	console.log(`Connected to Discord! Logged in as: ${bot.user.username} - (${bot.user.id})`);
	(bot.channels.cache.get(config.chatChannel) as Discord.TextChannel).send("[Chat System]: Online!");

	//watch the log file for updates
	chokidar.watch(config.logFile, { ignored: /(^|[\/\\])\../ }).on('all', (event, path) => {
		readLastLine(config.logFile);
	});

	Commands.set("online", {
		data: new SlashCommandBuilder()
			.setName('online')
			.setDescription('Lists online players'),
		async execute(interaction: Discord.CommandInteraction) {
			const players = await getOnlinePlayers();

			interaction.reply(`There ${players.length != 1 ? "are" : "is"} currently ${players.length} player${players.length != 1 ? "s" : ""} online${players.length > 0 ? `:\n- \`${players.join("`\n- `")}\`` : "."}`)
		},
	})
	Commands.set("command", {
		data: new SlashCommandBuilder()
			.setName('command')
			.setDescription('Executes a command on the Factorio server')
			.addStringOption(option => option.setName('command').setDescription('The command to run on the server').setRequired(true)),
		async execute(interaction: Discord.CommandInteraction) {
			const comm = interaction.options.getString('command');
			// send command to the server
			rcon.send('/' + comm);
			// send to the channel showing someone sent a command to the server
			if (!interaction.memberPermissions.any('ADMINISTRATOR')) {
				return interaction.reply("You do not have the required permissions to run this command.");
			}
			else if (!config.adminsCanRunCommands) {
				return interaction.reply("This command is disabled per the config option.");
			}
			interaction.reply("COMMAND RAN | `" + interaction.user.username + "`: " + comm);
		},
	})
	
	var commands2: any[] = [];
	Commands.forEach((command: any)=> {
		commands2.push(command.data.toJSON())
	})

	var guildID = "";
	bot.guilds.cache.forEach(guild => {
		if (guild.channels.cache.has(config.chatChannel)) {
			guildID = guild.id;
		}
	})

	rest.put(
		Routes.applicationGuildCommands("932401134524596256", guildID),
		{ body: commands2 }
	)
});

bot.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
    
    const command = Commands.get(interaction.commandName);

    if (!command) return;

    command.execute(interaction);
})

/*
* Discord message event
*/

bot.on("messageCreate", async (message) => {
	if (message.content.length <= 0) return;
	if (message.author.bot) return;

	if (message.channel.id === config.chatChannel) {
		// send to the server
		if (config.cleanMessages == true) {
			rcon.send(`/silent-command game.print("[color=#7289DA][Discord] ${message.member.nickname ?? message.author.username}: ${message.content} [/color])`);
		}
		else {
			rcon.send(`[color=#7289DA][Discord] ${message.member.nickname ?? message.author.username}: ${message.content}[/color]`);
		}

	}
});

// Get online players

async function getOnlinePlayers() {
	// Run the command "/players online"
	var res = await rconCommand("/p o");
	// Turn result into an array, remove the first and last array element
	var res2 = res.split("\n").slice(1, -1);
	// create a new array
	var onlinePlayers: string[] = [];

	res2.forEach(player => {
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

function parseMessage(msg: string | string[]) {
	var index = msg.indexOf(']');
	var indexName = msg.indexOf(': ');
	var newMsg = "`" + msg.slice(index + 2, indexName) + "`" + msg.slice(indexName);

	if (msg.length && index > 1) {
		if (msg.slice(1, index).includes("LEAVE")) {
			// Send leave message to the Discord channel
			(bot.channels.cache.get(config.chatChannel) as Discord.TextChannel).send(":red_circle: | " + msg.slice(index + 2));
			// Send leave message to the server
			if (config.cleanMessages == true) {
				rcon.send('/silent-command game.print("[color=red]' + msg.slice(index + 2) + '[/color]")');
			}
			else {
				rcon.send('[color=red]' + msg.slice(index + 2) + '[/color]');
			}
		}
		else if (msg.slice(1, index).includes("JOIN")) {
			// Send join message to the Discord channel
			(bot.channels.cache.get(config.chatChannel) as Discord.TextChannel).send(":green_circle: | " + msg.slice(index + 2))
			// Send join message to the server
			if (config.cleanMessages == true) {
				rcon.send('/silent-command game.print("[color=green]' + msg.slice(index + 2) + '[/color]")');
			}
			else {
				rcon.send('[color=green]' + msg.slice(index + 2) + '[/color]');
			}
		}
		else if (msg.slice(1, index).includes("CHAT") && !msg.includes("<server>")) {
			// Send incoming chat from the server to the Discord channel
			(bot.channels.cache.get(config.chatChannel) as Discord.TextChannel).send(":speech_left: | " + newMsg)
		}
		else if (!msg.includes("<server>") && config.sendServerMessages) {
			// Send incoming message from the server, which has no category or user to the Discord console channel
			(bot.channels.cache.get(config.chatChannel) as Discord.TextChannel).send("? | " + msg.slice(index + 1))
		}
	}
}

/*
* Logging function
*/

function readLastLine(path: fs.PathOrFileDescriptor) {
	fs.readFile(path, 'utf-8', function (err, data) {
		//get last line of file. 
		if (err) throw err;
		var lines = data.trim().split('\n');
		var lastLine = lines.slice(-1)[0];

		// I should really optimize or completely remove this line
		if (config.logLines == true) {
			console.log(lastLine);
		}

		if (path == config.logFile && lastLine.length > 0) {
			// Parse name and message and send it
			parseMessage(lastLine);
		}
	});


}

// Clear the logFile to prevent massive disk usage
function clearLogFile() {
	fs.writeFile(config.logFile, "", function () {
		console.log('Cleared previous chat log.');
	});
}

/*	rconCommand function
*	Returns an array of 2, first being the command response, second being the error (if there is one, otherwise it's empty)
*/
async function rconCommand(command: string) {
	if (!command.startsWith("/")) command = `/${command}`;
	try {
		let resp = await rcon.send(command);
		if (typeof resp == "string" && resp.length) {
			return resp;
		}
	}
	catch (error: any) {
		throw new Error(`RCON Error \n--- Details --- \nNAME: ${error.name} \nDESC: ${error.description}`);
	}
}