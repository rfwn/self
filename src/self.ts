import { Client } from 'discord.js-selfbot-v13';
import Database from './db';
import { Event } from './event';
import CommandRegistry, { EventRegistry } from './registry';
import Command from './command';
import { Config } from './interfaces';
export default class Self extends Client {
	public readonly events: Map<string, Event>;
	public readonly commands: Map<string, Command>;
	public intervals: Map<string, NodeJS.Timeout>;
	public database: Database<any>;
	constructor() {
		super({
			allowedMentions: { parse: ['users'] }
		});
		this.events = new Map();
		this.commands = new Map();
		this.database = new Database<Config>('../.data.json');
		this.intervals = new Map();
		new EventRegistry(this).loadEvents();
		new CommandRegistry(this).loadCommands();
	}
}
