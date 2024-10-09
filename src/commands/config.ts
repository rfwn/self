import { Message } from 'discord.js-selfbot-v13';
import Command from '../command';
import { ICommandArgument, ICommandFlag, ICommandOptions } from '../interfaces';
import Self from '../self';

export default class ConfigCommand extends Command {
	constructor(client: Self) {
		const options: ICommandOptions = {
			name: 'config',
			description: 'modify or view config entries',
			args: [
				{
					name: 'action',
					description: 'valid options: set, get, delete',
					required: true
				},
				{
					name: 'key',
					description: 'config key accessor',
					required: true
				},
				{
					name: 'value',
					description: 'value to push (if options is set, leaving empty will delete, if get, leaving * will return everything)',
					required: false
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
		const actionArg = args.find((arg) => arg.name === 'action')?.value;
		const keyArg = args.find((arg) => arg.name === 'key')?.value || '*';
		const valueArg = args.find((arg) => arg.name === 'value')?.value || '';
		switch(actionArg){
			case 'get': 
				let data;
				if(keyArg === '*') {
					data = await this.client.database.getAll();
				} else {
					data = await this.client.database.get(keyArg);
				}
				return message.reply(`\`\`\`json\n${JSON.stringify(data, null, 2)}\`\`\``);
			case 'set':
				if(!valueArg.length) {
					const result = await this.client.database.get(keyArg);
					if(result === null || result === undefined) {
						return message.reply('no value provided');
					}
					await this.client.database.delete(keyArg);
					return message.reply(`deleted \`${keyArg}\` with value \`${result}\``);
				}
				await this.client.database.set(keyArg, valueArg);
				return message.reply(`set \`${keyArg}\` with value \`${valueArg}\``);
			default: 
				return message.reply('invalid option provided (set, get)')
		}

		
	}
}
