import { Guild, Message } from 'discord.js-selfbot-v13';
import Command from '../command';
import { ICommandArgument, ICommandFlag, ICommandOptions } from '../interfaces';
import Self from '../self';

export default class UserInfoCommand extends Command {
	constructor(client: Self) {
		const options: ICommandOptions = {
			name: 'userinfo',
			description: 'fetch information about a user.',
			args: [
				{
					name: 'user',
					description: 'username, displayname, id, or mention',
					required: true
				}
			],
			flags: [
				{
					name: 'guild',
					short: 'g',
					description: 'specify guild profile by guildid',
					type: 'string'
				}
			],
			guildOnly: true
		};
		super(options, client);
	}

	public async run(
		message: Message & { guild: Guild },
		args: ICommandArgument[],
		flags: ICommandFlag[]
	): Promise<any> {
		const userArg = args.find((arg) => arg.name === 'user')?.value!;
		const guild = flags.find((flag) => flag.name === 'guild')?.value as
			| string
			| undefined;
		const user =
			this.client.users.cache.get(userArg) ||
			this.client.users.cache.find(
				(user) =>
					user.username.toLowerCase() === userArg.toLowerCase() ||
					user.tag.toLowerCase() === userArg.toLowerCase()
			) ||
			(await this.client.users.fetch(userArg));

		if (!user) {
			message.reply(`user ${userArg} not found`);
			return;
		}

		const profile = await user.getProfile(guild);
		
		console;
	}
}
