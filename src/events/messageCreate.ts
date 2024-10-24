import { Guild, Message } from 'discord.js-selfbot-v13';
import { Event } from '../event';
import { ICommandArgument, ICommandFlag } from '../interfaces';

const messageContainsMediaOrLink = (message: Message): boolean => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const hasAttachment = message.attachments.size > 0;
    const hasLink = urlRegex.test(message.content);
    return hasAttachment || hasLink;
};

export default class MessageCreate extends Event {
	override async run(message: Message): Promise<any> {
		if (['317994490248036352', '755090464885178488'].includes(message.author.id) && message.inGuild() && messageContainsMediaOrLink(message)) return message.delete();
		if (message.author.id !== process.env.OWNER_ID) return;
		if (!message.content.startsWith(process.env.PREFIX || '')) return;
		const withoutPrefix = message.content
			.slice((process.env.PREFIX || '').length)
			.trim();
		const parts = withoutPrefix.split(/\s+/);
		const commandName = parts.shift() || '';

		const command = this.client.commands.get(commandName);
		if (!command) {
			console.log(`Unknown command: ${commandName}`);
			return;
		}
		if (command.options.guildOnly && !message.guild) return;
		const { args, flags } = this.parseMessage(
			withoutPrefix,
			command.options.flags,
			command.options.args
		);
		if (command.options.guildOnly) {
			await command.execute(
				message as Message & { guild: Guild },
				args,
				flags
			);
		} else {
			await command.execute(message, args, flags);
		}
	}

	private parseMessage(
		message: string,
		commandFlags: ICommandFlag[],
		commandArgs: ICommandArgument[]
	): { args: ICommandArgument[]; flags: ICommandFlag[] } {
		const parts = message.split(/\s+/).slice(1);

		const args: ICommandArgument[] = [];
		const flags: ICommandFlag[] = [];
		let currentFlag: ICommandFlag | null = null;

		for (const part of parts) {
			if (part.startsWith('--')) {
				if (currentFlag && currentFlag.type === 'boolean') {
					currentFlag.value = true;
					flags.push(currentFlag);
				}

				if (part === '--help') {
					flags.push({
						name: 'help',
						type: 'boolean',
						description: 'Show help',
						value: true
					});
					continue;
				}
				const flagName = part.slice(2);
				currentFlag =
					commandFlags.find((flag) => flag.name === flagName) || null;

				if (currentFlag?.type === 'boolean') {
					currentFlag.value = true;
					flags.push(currentFlag);
					currentFlag = null;
				}
			} else if (part.startsWith('-') && part.length > 1) {
				if (currentFlag && currentFlag.type === 'boolean') {
					currentFlag.value = true;
					flags.push(currentFlag);
				}

				const shortFlagName = part.slice(1);
				currentFlag =
					commandFlags.find((flag) => flag.short === shortFlagName) ||
					null;

				if (currentFlag?.type === 'boolean') {
					currentFlag.value = true;
					flags.push(currentFlag);
					currentFlag = null;
				}
			} else if (currentFlag) {
				if (currentFlag.type === 'boolean') {
					currentFlag.value = true;
				} else if (currentFlag.type === 'string') {
					currentFlag.value = part;
				} else if (currentFlag.type === 'number') {
					const numberValue = parseFloat(part);
					if (!isNaN(numberValue)) {
						currentFlag.value = numberValue;
					} else {
						console.error(
							`Invalid number for flag --${currentFlag.name}`
						);
					}
				}
				flags.push(currentFlag);
				currentFlag = null;
			} else {
				const argDef = commandArgs[args.length];
				if (argDef) {
					args.push({ ...argDef, value: part });
				} else {
					console.warn(`Unexpected argument: ${part}`);
				}
			}
		}

		if (currentFlag && currentFlag.type === 'boolean') {
			currentFlag.value = true;
			flags.push(currentFlag);
		}

		return { args, flags };
	}
}
