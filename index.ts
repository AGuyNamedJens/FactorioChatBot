import Discord, { Client, Intents } from 'discord.js';
import fs from "fs";
import chokidar from "chokidar";
import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { PythonShell } from 'python-shell';

import { Rcon } from "rcon-client";

var config: Config = require("./config.json");

const rest = new REST({version: '9'}).setToken(config.token);

const bot = new Discord.Client({ intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_INTEGRATIONS], allowedMentions: { users: [], roles: [] } });

const Commands: Discord.Collection<string, Command> = new Discord.Collection();

bot.login(config.token);

interface Config {
	logFile: string;

	chatChannel: string;

	cleanMessages: boolean;

	adminsCanRunCommands: boolean;

	sendServerMessages: boolean;

	logLines: boolean;

	startupMessage: {
		
		enabled: boolean;

		message: string;
	}

	factorioPath: string;

	autoCheckUpdates: boolean;

	userToNotify: string;

	checkTime: number;

	silentCheck: boolean;

	RconIP: string;

	RconPort: number;

	RconPassword: string;

	RconTimeout: number;

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

/**
 * Connects to the server via RCON.
 */
function RconConnect() {
	rcon = new Rcon({ host: config.RconIP, port: config.RconPort, password: config.RconPassword, timeout: config.RconTimeout > 0 ? config.RconTimeout : 2000 });

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

		if (config.startupMessage.enabled) {
			if (config.cleanMessages == true) {
				rcon.send('/silent-command game.print("[Chat System]: ' + config.startupMessage.message + '")');
			}
			else {
				rcon.send('[Chat System]: ' + config.startupMessage.message);
			}
		}
	});

	// In case any errors occur, log them to console and terminate the connection
	rcon.on("error", (err) => {
		console.error(`Error: ${err}`);
		rcon.end();
	});

	// Log a message on connection end
	rcon.on("end", () => {
		console.log('Socket connection ended!');
	});
};

/*
* Bot start event
*/

async function updateCheck() {
	fs.access('update_factorio.py', function (err) {
		if (err) {
			console.log('Auto-retrieval of Factorio package updates has been set to true, but the update script was not found. Did you forget to clone the repository?')
			return;
		}
	});
	PythonShell.run('update_factorio.py', {args:['-d', '-a', config.factorioPath]}, function (err, results: string[]) {
		if (results == null) {
			console.log('Error while checking for updates for the Factorio binary. Ensure the provided path in the config file is set correctly.');
			return;
		}
		if (results[1].includes("No updates available") && !config.silentCheck) {
			console.log(`No updates found for provided Factorio binary (version ${results[0].slice(results[0].indexOf('version as') + 11, results[0].indexOf('from') - 1)}).`);
		}
		else if (results[1].includes("Dry run:")) {
			bot.users.resolve(config.userToNotify)?.send(`Newer Factorio packages were found.\nCurrent version: \`${results[0].slice(results[0].indexOf('version as') + 11, results[0].indexOf('from') - 1)}\`\nLatest version: \`${results[results.length - 1].slice(results[results.length - 1].indexOf('to ') + 3, results[results.length - 1].length - 1)}\``);
			if (!config.silentCheck) {
				console.log(`Updates available for provided Factorio binary (${results[0].slice(results[0].indexOf('version as') + 11, results[0].indexOf('from') - 1)} --> ${results[results.length - 1].slice(results[results.length - 1].indexOf('to ') + 3, results[results.length - 1].length - 1)}).`);
			}
		}
		console.log(results)
	})
}

async function runUpdateCheckAsync() {
	updateCheck();
	if (config.checkTime > 0) {
		setTimeout(runUpdateCheckAsync, config.checkTime);
	}
}

bot.on("ready", () => {
	//connect to rcon
	RconConnect();

	console.log(`Connected to Discord! Logged in as: ${bot.user.username} - (${bot.user.id})`);
	(bot.channels.cache.get(config.chatChannel) as Discord.TextChannel).send("[Chat System]: Online!");

	clearLogFile();

	//watch the log file for updates
	chokidar.watch(config.logFile, { ignored: /(^|[\/\\])\../ }).on('all', (event, path) => {
		readLastLine(config.logFile);
	});

	console.log('Watching log file.');

	if (config.autoCheckUpdates) {
		runUpdateCheckAsync();
	}

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
		Routes.applicationGuildCommands(bot.user.id, guildID),
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
	if (message.content.length <= 0 && message.attachments.size <= 0) return;
	if (message.author.bot) return;

	if (message.channel.id === config.chatChannel) {
		// send to the server
		if (message.content.length > 0) {
			if (config.cleanMessages == true) {
				rcon.send(`/silent-command game.print("[color=#7289DA][Discord] ${message.member.nickname ?? message.author.username}: ${message.content} [/color]\n${message.attachments?.size > 0 ? ('[' + message.attachments.size + ' attachment' + (message.attachments.size != 1 ? 's' : '')) + ']' : ''}")`);
			}
			else {
				rcon.send(`[color=#7289DA][Discord] ${message.member.nickname ?? message.author.username}: ${message.content}[/color]\n${message.attachments?.size > 0 ? ('[' + message.attachments.size + ' attachment' + (message.attachments.size != 1 ? 's' : '')) + ']' : ''}`);
			}
		}
		else {
			if (config.cleanMessages == true) {
				rcon.send(`/silent-command game.print("[color=#7289DA][Discord] ${message.member.nickname ?? message.author.username}: [/color]${message.attachments?.size > 0 ? ('[' + message.attachments.size + ' attachment' + (message.attachments.size != 1 ? 's' : '')) + ']' : ''}")`);
			}
			else {
				rcon.send(`[color=#7289DA][Discord] ${message.member.nickname ?? message.author.username}: [/color]${message.attachments?.size > 0 ? ('[' + message.attachments.size + ' attachment' + (message.attachments.size != 1 ? 's' : '')) + ']' : ''}`);
			}
		}
	}
});

/**
 * Gets all players currently online on the Factorio server.
 * @returns A promise that will be resolved with the list of the names of the currently online players.
 */
async function getOnlinePlayers(): Promise<string[]> {
	// Run the command "/players online"
	var res = await rcon.send("/p o");
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

/**
 * Parses messages from the server log.
 * @param msg The message to parse.
 */
function parseMessage(msg: string) {
	var index = msg.indexOf(']');
	var indexName = msg.indexOf(': ');
	var newMsg = "`" + msg.slice(index + 2, indexName) + "`" + msg.slice(indexName);

	if (msg.length && index > 1) {
		if (msg.includes('[LEAVE]')) {
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
		else if (msg.includes('[JOIN]')) {
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
		else if (msg.includes("[CHAT]") && !msg.includes("[CHAT] <server>")) {
			// Send incoming chat from the server to the Discord channel
			(bot.channels.cache.get(config.chatChannel) as Discord.TextChannel).send(":speech_left: | " + newMsg)
		}
		else if (msg.includes("[WARNING]")) {
			(bot.channels.cache.get(config.chatChannel) as Discord.TextChannel).send(":warning: | " + newMsg)
		}
		else if (!msg.includes("] <server>") && config.sendServerMessages) {
			// Send incoming message from the server, which has no category or user to the Discord console channel
			(bot.channels.cache.get(config.chatChannel) as Discord.TextChannel).send("? | " + msg)
		}
	}
}

/**
 * Reads the last line of a logging file.
 * @param path The absolute path to the file.
 */
function readLastLine(path: fs.PathOrFileDescriptor) {
	fs.readFile(path, 'utf-8', function (err, data) {
		//get last line of file. 
		if (err) throw err;
		console.log(data.trim().replace(/\n/g, ''));
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

/**
 * Clears the log file.
 */
function clearLogFile() {
	fs.writeFileSync(config.logFile, "");
	console.log('Cleared previous chat log.');
}