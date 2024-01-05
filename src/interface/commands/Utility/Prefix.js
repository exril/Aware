const { Command } = require('@pheonix/framework');
const { Message } = require('discord.js');

module.exports = class Prefix extends Command {
	constructor() {
		super('prefix', {
			aliases: ['prefix', 'setprefix'],
			category: 'Utility',
			description: {
				content: 'Set the prefix for the bot',
				usage: '.prefix <prefix>',
				examples: [''],
			},
			slash: true,
			cooldown: 5000,
			args: [
				{
					id: 'prefix',
					type: 'string',
					match: 'rest',
				},
			],
		});
	}

	/**
	 *
	 * @param {Message} message
	 * @param {{ prefix: string }} args
	 */
	async exec(message, args) {
		const prefix = await this.client.database.getPrefix(message.guild.id);

		if (!args.prefix) {
			await message.util.send({
				content: `The current prefix is \`${prefix ?? this.client.config.prefix}\``,
			});

			return;
		}

		if (args.prefix.length > 5) {
			await message.util.send({
				content: `Prefix can only be 5 characters long`,
			});

			return;
		}

		await this.client.database.setPrefix(message.guild.id, args.prefix);

		await message.util.reply({
			content: `Prefix has been set to \`${args.prefix}\``,
		});
	}
};
