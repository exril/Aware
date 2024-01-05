const { Command, Argument } = require('@pheonix/framework');
const { Message } = require('discord.js');

module.exports = class Noprefix extends Command {
	constructor() {
		super('noprefix', {
			aliases: ['noprefix', 'np'],
			category: 'Owner',
			description: {
				content: 'No description provided.',
				usage: '.noprefix',
				examples: [''],
			},
			slash: false,
			cooldown: 5000,
			args: [
				{
					id: 'id',
					type: Argument.union('user', 'string'),
				},
			],
			superUserOnly: true,
		});
	}

	/**
	 *
	 * @param {Message} message
	 */
	async exec(message, { id }) {
		if (!id) {
			await message.channel.send('Please provide a user ID to give no prefix.');

			return;
		}

		const user = await this.client.users.fetch(id).catch(() => null);

		if (!user) {
			await message.channel.send('Invalid user ID provided.');

			return;
		}

		const hasNoprefix = await this.client.database.hasNoprefix(user.id);

		if (hasNoprefix) {
			await this.client.database.removeNoprefix(user.id);

			await message.channel.send(`Removed ${user.toString()} from my no prefix list.`);

			return;
		}

		await this.client.database.addNoprefix(user.id);

		await message.channel.send(`Added ${user.toString()} to my no prefix list.`);

        return;
	}
};
