import { CustomStatus, Message, TextChannel } from 'discord.js-selfbot-v13';
import Command from '../command';
import { ICommandArgument, ICommandFlag, ICommandOptions } from '../interfaces';
import Self from '../self';

export default class IntervalCommand extends Command {
	constructor(client: Self) {
		const options: ICommandOptions = {
			name: 'interval',
			description: 'add a message interval to this channel',
			args: [
				{
					name: 'name',
					description: 'interval identifier (used to delete it)',
					required: true,
				},
				{
					name: 'message',
					description: 'Message or command (must be one word)',
					required: true
				},
				{
					name: 'delay',
					description: 'Delay between messages',
					required: true
				},
			],
			flags: [
				{
					name: "quiet",
					short: "q",
					type: "boolean",
					description: "Delete sent messages after seconds"
				}
			]
		};
		super(options, client);
	}

	public async run(
		message: Message,
		args: ICommandArgument[],
		flags: ICommandFlag[]
	): Promise<any> {
		const nameArg = args.find((arg) => arg.name === 'name')?.value!;
		const messageArg = args.find((arg) => arg.name === 'message')?.value!;
		const delayArg = args.find((arg) => arg.name === 'delay')?.value!;
		const quiet = flags.find((flag) => flag.name === 'quiet')?.value as boolean;
		const { error, success: delay } = this.getTotalTime(String(delayArg));
		if (error) return message.reply({ content: error });
		let channel = (message.channel as TextChannel);
		if (channel.isText()) {
			const interval = setInterval(() => {
				quiet ? this.timedDelete(channel.send({ content: messageArg })) : this.timedDelete(channel.send({ content: messageArg }));
			}, delay);
			this.client.intervals.set(nameArg, interval);
		}

	}

	private getTotalTime = (timeFormat: string) => {
		if (
			!timeFormat.endsWith('d') &&
			!timeFormat.endsWith('h') &&
			!timeFormat.endsWith('m') &&
			!timeFormat.endsWith('s')
		) {
			return {
				error: 'use one of the following time delimiters: `d`,  `h`,  `m`, `s`'
			};
		}
		if (isNaN(Number(timeFormat.slice(0, -1))))
			return {
				error: 'an invalid number was entered. (example: 1m or 16h)'
			};

		const time: number = require('ms')(timeFormat);

		if (time >= 864000000) return { error: "can't be longer than 10days" };

		return { success: time };
	};
}
