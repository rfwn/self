import { ClientEvents } from 'discord.js-selfbot-v13';
import Self from './self';

export class Event {
	public readonly name: keyof ClientEvents;
	public readonly client: Self;
	private readonly _event;

	constructor(client: Self, name: keyof ClientEvents) {
		this.name = name;
		this.client = client;
		this._event = this.safeRun.bind(this);
	}

	private async safeRun(...args: any) {
		try {
			return await this.run(...args, this.client);
		} catch (error) {
			console.error(`event ${this.name} failed to execute.`, error);
		}
	}

	public async run(..._args: any): Promise<any> {}

	public listen() {
		return this.client.on(this.name, this._event);
	}

	public turnOff() {
		return this.client.off(this.name, this._event);
	}
}
