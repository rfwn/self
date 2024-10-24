import { CustomStatus, Message, TextChannel } from 'discord.js-selfbot-v13';
import Command from '../command';
import { ICommandArgument, ICommandFlag, ICommandOptions } from '../interfaces';
import Self from '../self';

export default class DeleteIntervalCommand extends Command {
	constructor(client: Self) {
		const options: ICommandOptions = {
			name: 'deleteInterval',
			description: 'autobump in this channel',
			args: [
				{
					name: 'name',
					description: 'interval identifier (used to delete it)',
					required: true,
				},
				{
					name: 'name',
					description: 'interval identifier',
					required: true
				}
			], 
			flags: []
		};
		super(options, client);
	}

	public async run(
		message: Message,
		args: ICommandArgument[],
		flags: ICommandFlag[]
	): Promise<any> {
		const nameArg = args.find((arg) => arg.name === 'name')?.value!;
		if (this.client.intervals.has(nameArg)) {
			clearInterval(this.client.intervals.get(nameArg));
			this.client.intervals.delete(nameArg);
			return this.timedDelete(message.reply({ content: 'Interval stopped successfully.' }));
		} else {
			return this.timedDelete(message.reply({ content: 'No active interval with that name' }));
		}
	};
}
