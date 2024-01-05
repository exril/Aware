const { Command, Argument } = require('@pheonix/framework');
const { Message, GuildMember } = require('discord.js');

module.exports = class Friend extends Command {
	constructor() {
		super('friend', {
			aliases: ['friend', 'homie', 'bro', 'brother', 'sister', 'mate', 'dost'],
			category: 'Utility',
			description: {
				content: 'Gives Friend role to the user.',
				usage: '.friend <user>',
				examples: [''],
			},
			slash: true,
			cooldown: 5000,
			args: [
				{
					id: 'member',
					type: Argument.union('member', 'string'),
				},
			],
			userPermissions: ['ManageRoles'],
			clientPermissions: ['ManageRoles'],
		});
	}

	/**
	 *
	 * @param {Message} message
	 * @param {{ member: GuildMember }} args
	 */
	async exec(message, args) {
		const data = await this.client.database.getRole(message.guild.id, 'friend');

		if (!args.member) {
			await message.util.send({
				content: 'Please provide a valid user.',
			});

			return;
		}

		if (!data) {
			await message.util.send({
				content: 'Friend Role is not setupped in this server!Try `.rolesetup friend <role>',
			});

			return;
		}

		const role = await message.guild.roles.fetch(data).catch(() => null);

		if (!role) {
			await message.util.send({
				content: 'Friend Role is not present in this server!',
			});

			return;
		}

		if (args.member.roles.cache.has(role.id)) {
			await args.member.roles.remove(role.id);

			await message.util.send({
				content: `Removed **${role.name}** role from **${args.member.user.tag}**`,
			});

			return;
		}

		await args.member.roles.add(role.id);

		await message.util.send({
			content: `Added **${role.name}** role to **${args.member.user.tag}**`,
		});
	}
};
