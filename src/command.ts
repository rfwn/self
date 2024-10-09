import { Guild, Message } from 'discord.js-selfbot-v13';
import { ICommandArgument, ICommandFlag, ICommandOptions } from './interfaces';
import Self from './self';

export default class Command {
	public readonly name: string;
	public readonly client: Self;
	public readonly options: ICommandOptions;
	private readonly _command: (...args: any[]) => Promise<any>;

	constructor(options: ICommandOptions, client: Self) {
		this.name = options.name;
		this.options = options;
		this.client = client;
		this._command = this.safeRun.bind(this);
	}

	private async safeRun(
		message: Message,
		args: ICommandArgument[],
		flags: ICommandFlag[]
	): Promise<any> {
		try {
			return await this.run(message, args, flags);
		} catch (error) {
			console.error(`Command ${this.name} failed to execute`, error);
		}
	}

	public async run(
		message: Message,
		args: ICommandArgument[],
		flags: ICommandFlag[]
	): Promise<any> {
		throw new Error("Method 'run' must be implemented.");
	}

	public async timedDelete(message: Message, delay: number = 5000) {
		setTimeout(() => {
			message.delete().catch(console.error);
		}, delay);
	}

	public getHelp(): string {
		let helpMessage = `Command: ${this.name}\n${this.options.description || ''}\n\n`;

		helpMessage += `Usage:\n ${this.name} `;

		this.options.args?.forEach((arg: ICommandArgument) => {
			helpMessage += arg.required ? `<${arg.name}> ` : `[${arg.name}] `;
		});

		this.options.flags?.forEach((flag: ICommandFlag) => {
			helpMessage += flag.short
				? `[-${flag.short}] `
				: `[--${flag.name}] `;
		});

		helpMessage += `\n\nArguments:\n`;
		this.options.args?.forEach((arg: ICommandArgument) => {
			helpMessage += `  ${arg.name}: ${arg.description} ${arg.required ? '(required)' : '(optional)'}\n`;
		});

		helpMessage += `\nFlags:\n`;
		this.options.flags?.forEach((flag: ICommandFlag) => {
			helpMessage += `  --${flag.name} (${flag.type}): ${flag.description}\n`;
			if (flag.short) {
				helpMessage += `  -${flag.short} (alias for --${flag.name})\n`;
			}
		});

		return helpMessage;
	}

	public validateArguments(
		args: ICommandArgument[],
		message: Message
	): boolean {
		const missingArgs = this.options.args?.filter(
			(arg) => arg.required && !args.find((a) => a.name === arg.name)
		);
		if (missingArgs && missingArgs.length > 0) {
			const missingArgNames = missingArgs
				.map((arg) => arg.name)
				.join(', ');
			message.reply(
				`Missing required arguments: ${missingArgNames}\n\`\`\`\n${this.getHelp()}\`\`\``
			);
			return false;
			return false;
		}
		return true;
	}

	public async triggerHelp(message: Message): Promise<Message<boolean>> {
		return await message.reply('```\n' + this.getHelp() + '\n```');
	}

	public handleHelpFlag(message: Message, flags: ICommandFlag[]): boolean {
		const helpFlag = flags.find((flag) => flag.name === 'help');
		if (helpFlag) {
			this.triggerHelp(message);
			return true;
		}
		return false;
	}

	public async execute(
		message: Message &
			(this['options']['guildOnly'] extends true
				? { guild: Guild }
				: { guild: Guild | null }),
		args: ICommandArgument[],
		flags: ICommandFlag[]
	): Promise<any> {
		if (this.handleHelpFlag(message, flags)) return;
		if (!this.validateArguments(args, message)) return;
		await this.safeRun(message, args, flags);
	}
}
