const { Command, Argument } = require('@pheonix/framework');
const { Message, User, Colors } = require('discord.js');

module.exports = class StickyNick extends Command {
	constructor() {
		super('stickynick', {
			aliases: ['stickynick', 'snick', 'stickynickname', 'snickname'],
			category: 'Utility',
			description: {
				content: 'Sticks a nickname to an user.',
				usage: '.snick <set/remove> <user> <nickname>',
				examples: [''],
			},
			slash: true,
			cooldown: 5000,
			args: [
				{
					id: 'toggle',
					type: 'string',
				},
				{
					id: 'user',
					type: Argument.union('user', 'string'),
				},
				{
					id: 'nickname',
					type: 'string',
				},
			],
			userPermissions: ['ManageNicknames', 'ManageGuild'],
		});
	}

	/**
	 *
	 * @param {Message} message
	 * @param {{ toggle: 'set' | 'remove'; user: User; nickname: string; }} args
	 */
	async exec(message, args) {
		const { toggle, user, nickname } = args;

		if (!toggle || !['set', 'remove'].includes(toggle)) {
			await message.util.reply({
				content: 'You Must Choose: `set`, `remove`',
			});

			return;
		}

		const member = await this.client.util.fetchMember(message.guild, user.id).catch(() => null);

		switch (toggle) {
			case 'set':
				if (!user || !nickname || !(user instanceof User)) {
					await message.util.reply({
						content: 'Please provide a user.',
					});

					return;
				}

				await this.client.database.setNickname(message.guild.id, {
					userId: user.id,
					nickname,
				});

				await message.util.reply({
					embeds: [
						this.client.util
							.embed()
							.setColor(1752220)
							.setTitle('StickyNickname Added!')
							.setDescription(`\`\`\`User: ${user.username}\nNickname: ${nickname}\`\`\``),
					],
				});

				if (member) member.setNickname(nickname);
				break;
			case 'remove':
				if (!user || !(user instanceof User)) {
					await message.util.reply({
						content: 'Please mention a user or provide a valid user ID',
					});

					return;
				}

				await this.client.database.deleteNickname(message.guild.id, user.id);

				await message.util.reply({
					embeds: [
						this.client.util
							.embed()
							.setColor(15548997)
							.setTitle('StickyNickname Removed!')
							.setDescription(`\`\`\`User: ${user.username}\`\`\``),
					],
				});

				if (member) member.setNickname(null);

				break;
		}
	}
};
