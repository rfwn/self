import  { PresenceStatusData } from 'discord.js-selfbot-v13';

export interface Config {
	status: PresenceStatusData;
	webHookUrl: string;
}

export interface IParsedCommand {
	name: string;
	args: ICommandArgument[];
	flags: ICommandFlag[];
}

export interface ICommandOptions {
	name: string;
	description: string;
	flags: ICommandFlag[];
	args: ICommandArgument[];
	guildOnly?: boolean;
}

export interface ICommandFlag {
	name: string;
	type: 'boolean' | 'string' | 'number';
	description: string;
	value?: boolean | string | number;
	short?: string;
}

export interface ICommandArgument {
	name: string;
	required: boolean;
	description: string;
	value?: string;
}