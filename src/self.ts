import { Client } from 'discord.js-selfbot-v13';
import Database from './db';
import { Event } from './event';
import CommandRegistry, { EventRegistry } from './registry';
import Command from './command';
export default class Self extends Client {
	public readonly events: Map<string, Event>;
	public readonly commands: Map<string, Command>;
	public database: Database<any>;
	constructor() {
		super({
			allowedMentions: { parse: ['users'] }
		});
		this.events = new Map();
		this.commands = new Map();
		this.database = new Database<any>('../.data.json');
		new EventRegistry(this).loadEvents();
		new CommandRegistry(this).loadCommands();
	}
}
