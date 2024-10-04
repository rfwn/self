import Self from './self';
import { promisify } from 'util';
import fs from 'fs';
const readdir = promisify(fs.readdir);

export default class CommandRegistry {
	private client: Self;
	private _dir = './dist/commands/';

	constructor(client: Self) {
		this.client = client;
	}

	public async loadCommands(): Promise<void> {
		try {
			let commandsLoaded = 0;

			const commandFiles = await readdir(`${this._dir}/`);
			for (const commandFile of commandFiles) {
				delete require.cache[
					require.resolve(`./commands/${commandFile}`)
				];
				try {
					const commandClass = await import(
						`./commands/${commandFile}`
					);
					const command = new commandClass.default(
						this.client,
						commandFile.split('.js')[0]
					);

					this.client.commands.set(command.name, command);
					commandsLoaded++;

					console.info(
						`[${commandsLoaded}] command "${command.name}" loaded`
					);
				} catch (error) {
					console.error(
						`failed to load command ${commandFile}: ${error.message}`,
						error
					);
				}
			}

			console.info(`[✓] loaded ${commandsLoaded} commands`);
		} catch (error) {
			console.error(
				`error occurred while loading commands: ${error.message}`,
				error
			);
		}
	}
}
export class EventRegistry {
	private client: Self;
	private _dir = './dist/events/';

	constructor(client: Self) {
		this.client = client;
	}

	public async loadEvents(): Promise<void> {
		try {
			let eventsLoaded = 0;
			const eventFiles = await readdir(`${this._dir}/`);
			for (const eventFile of eventFiles) {
				delete require.cache[require.resolve(`./events/${eventFile}`)];
				try {
					const eventClass = await import(`./events/${eventFile}`);
					const event = new eventClass.default(
						this.client,
						eventFile.split('.js')[0]
					);
					event.listen();
					eventsLoaded++;
					console.info(
						`[${eventsLoaded}] event "${eventFile.split('.js')[0]}" loaded`
					);
					this.client.events.set(event.name, event);
				} catch (error) {
					console.error(
						`failed to load event "${eventFile}": ${error.message}`,
						error
					);
				}
			}

			console.info(`[✓] loaded ${eventsLoaded} events`);
		} catch (error) {
			console.error(
				`error occurred while loading events: ${error.message}`,
				error
			);
		}
	}

	public unloadEvents(): void {
		this.client.events.forEach((event) => event.turnOff());
		console.info(`[✓] all events have been unloaded`);
	}

	public async reloadEvents(): Promise<void> {
		this.unloadEvents();
		await this.loadEvents();
		console.info(`[✓] all events have been reloaded`);
	}
}
