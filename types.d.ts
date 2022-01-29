import { SlashCommandBuilder } from "@discordjs/builders";
import Discord from "discord.js";

interface Config {
	sentMessages: any;
	deleteMessages: any;
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

	autoCheckModUpdates: boolean;

	factorioSettingsPath: string;

	factorioModsPath: string;
}

interface Command {
	/**
	 * The command name.
	 */
	data: Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">;

	execute(interaction: Discord.CommandInteraction): void;
}