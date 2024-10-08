import { Message, TextChannel } from 'discord.js-selfbot-v13';
import Command from '../command';
import { ICommandArgument, ICommandFlag, ICommandOptions } from '../interfaces';
import Self from '../self';

export default class PurgeCommand extends Command {
	constructor(client: Self) {
		const options: ICommandOptions = {
			name: 'purge',
			description: 'delete previous messages within a channel',
			args: [],
			flags: [
				{
					name: 'limit',
					short: 'l',
					description: 'amount of messages to delete',
					type: 'number'
				},
				{
					name: 'time',
					short: 't',
					description:
						'message time period (like 1m will delete messages sent within the past minute)',
					type: 'string'
				},
				{
					name: 'channel',
					short: 'c',
					description: 'channel id',
					type: 'string'
				},
				{
					name: 'guild',
					short: 'g',
					description: 'guild id',
					type: 'string'
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
		const limit =
			flags.find((flag) => flag.name === 'limit')?.value || Infinity;
		const guildFlag = flags.find((flag) => flag.name === 'guild')?.value;
		const channelFlag = flags.find(
			(flag) => flag.name === 'channel'
		)?.value;
		const guild = guildFlag
			? await this.client.guilds.fetch(String(guildFlag))
			: message.guild;
		let channel = channelFlag
			? ((guild
					? await guild.channels.fetch(String(channelFlag))
					: message.channel) as TextChannel)
			: (message.channel as TextChannel);
		const itime =
			flags.find((flag) => flag.name === 'time')?.value || undefined;
		let messagesLeft = Number(limit);
		let deletedMessages = 0;
		let timeLimit: number | undefined;
		if (itime) {
			const { error, success: time } = this.getTotalTime(String(itime));
			if (error) return message.reply({ content: error });
			timeLimit = time;
		}

		if (!channel) channel = message.channel! as TextChannel;
		if (channel.isText()) {
			while (messagesLeft > 0) {
				let messages = (
					await channel.messages.fetch({ limit: 100 })
				).toJSON();
				if (timeLimit)
					messages = messages.filter(
						(m: Message) =>
							Date.now() - m.createdTimestamp <= timeLimit
					);
				// messages.filter(
				// 	(m: Message) =>
				// 		m.createdTimestamp >
				// 		Date.now() - 14 * 24 * 60 * 60 * 1000
				// );
				messages = messages.filter(
					(m: Message) => m.author.id == message.author.id
				);
				if (messages.length >= messagesLeft)
					messages = messages.slice(0, messagesLeft);
				console.log(messages.length);
				if (messages.length == 0) break;
				for (const message of messages) {
					if (message.deletable) await message.delete();
					messagesLeft--;
					deletedMessages++;
				}
			}
		} else {
			return message.reply({
				content: 'the specified channel is not a text channel'
			});
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
