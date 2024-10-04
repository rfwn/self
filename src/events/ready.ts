import { Event } from '../event';

export default class Ready extends Event {
	override async run(..._args: any): Promise<any> {
		console.info(`[✓] logged in as ${this.client.user?.username}`);
	}
}
