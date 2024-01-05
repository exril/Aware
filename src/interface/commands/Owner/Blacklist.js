const { Command } = require('@pheonix/framework');
const { Message } = require('discord.js');

module.exports = class Blacklist extends Command {
	constructor() {
		super('blacklist', {
			aliases: ['blacklist', 'bl'],
			category: 'Owner',
			description: {
				content: 'No description provided.',
				usage: '.blacklist',
				examples: [''],
			},
			slash: false,
			cooldown: 5000,
			args: [
				{
					id: 'option',
					type: 'string',
					flag: ['server', 'user'],
				},
				{
					id: 'id',
					type: 'string',
				},
			],
			superUserOnly: true,
		});
	}

	/**
	 *
	 * @param {Message} message
	 */
	async exec(message, { option, id }) {
		if (option === 'user') {
			if (!id) {
				await message.channel.send('Please provide a user ID to blacklist.');

				return;
			}

			const user = await this.client.users.fetch(id).catch(() => null);

			if (!user) {
				await message.channel.send('Invalid user ID provided.');

				return;
			}

			const isBlacklisted = await this.client.database.isUserBlacklisted(user.id);

			if (isBlacklisted) {
				await this.client.database.unblacklistUser(user.id);

				await message.channel.send(`Removed ${user.toString()} from my ignore list.`);

				return;
			}

			await this.client.database.blacklistUser(user.id);

			await message.channel.send(`Added ${user.toString()} to my ignore list.`);

			return;
		} else if (option === 'server') {
			if (!id) {
				await message.channel.send('Please provide a server ID to blacklist.');

				return;
			}

			const guild = await this.client.guilds.fetch(id).catch(() => null);

			if (!guild) {
				await message.channel.send('Invalid server ID provided.');

				return;
			}

			const isBlacklisted = await this.client.database.isGuildBlacklisted(guild.id);

			if (isBlacklisted) {
				await this.client.database.unblacklistGuild(guild.id);

				await message.channel.send(`Removed **${guild.name}** from my ignore list.`);

				return;
			}

			await this.client.database.blacklistGuild(guild.id);

			await message.channel.send(`Added **${guild.name}** to my ignore list.`);

			return;
		}
	}
};
