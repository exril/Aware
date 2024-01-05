const { Command, Argument } = require('@pheonix/framework');
const { Message, User } = require('discord.js');

module.exports = class Ban extends Command {
	constructor() {
		super('ban', {
			aliases: ['ban', 'fuckoff', 'fuckban'],
			category: 'Moderation',
			description: {
				content: 'Ban A User',
				usage: '.ban <user> [reason]',
				examples: [''],
			},
			slash: true,
			cooldown: 20000,
			args: [
				{
					id: 'user',
					type: Argument.union('user', 'string'),
				},
				{
					id: 'reason',
					type: 'string',
					default: (message) => {
						return `| Banned By: ${message.author.tag}`;
					},
				},
			],
			userPermissions: ['BanMembers'],
			clientPermissions: ['BanMembers'],
		});
	}

	/**
	 *
	 * @param {Message} message
	 * @param {{ user: User; reason: string; }} args
	 */
	async exec(message, args) {
		const { user, reason } = args;

		if (!user && !(user instanceof User)) {
			await message.util.reply({
				content: 'Please mention a user or provide a valid user ID',
			});

			return;
		}

		if (user.id === message.author.id) {
			await message.util.reply({
				content: `You can't ban yourself!`,
			});

			return;
		}

		if (user.id === message.guild.ownerId) {
			await message.util.reply({
				content: `You can't ban the server owner!`,
			});

			return;
		}

		await message.guild.members.ban(user, {
			reason: reason,
		});

		await message.util.reply({
			embeds: [
				this.client.util
					.embed()
					.setColor(this.client.config.colors.primary)
					.setDescription(`**${user.username}** has been banned!`),
			],
		});
	}
};
