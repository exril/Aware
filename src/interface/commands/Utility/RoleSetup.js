const { Command, Argument } = require('@pheonix/framework');
const { Message, Role, FormattingPatterns } = require('discord.js');

module.exports = class RoleSetup extends Command {
	constructor() {
		super('rolesetup', {
			aliases: ['rs', 'rolesetup', 'setuproles', 'setuprole'],
			category: 'Utility',
			description: {
				content: 'Setup Roles!',
				usage: '.rolesetup <girl|guest|friend|vip|supporter|mod|staff> <role>',
				examples: [''],
			},
			slash: true,
			cooldown: 5000,
			args: [
				{
					id: 'type',
					type: 'string',
				},
				{
					id: 'role',
					type: Argument.union('role', 'string'),
				},
			],
			userPermissions: ['ManageRoles', 'ManageGuild'],
			clientPermissions: ['ManageRoles', 'ManageGuild'],
		});
	}

	/**
	 *
	 * @param {Message} message
	 * @param {{ type: string, role: Role }} args
	 */
	async exec(message, args) {
		const types = ['girl', 'guest', 'friend', 'vip', 'supporter', 'mod', 'staff', 'girls', 'artist'];

		if (!args.type || !types.includes(args.type.toLowerCase())) {
			// Why i am doing this? Because prismo has some fuckery validations in the code which makes no sense
			if (!args.role && !FormattingPatterns.Role.exec(args.type)) {
				await message.util.send({
					content: 'Please Mention A Role!',
				});

				return;
			}

			return;
		}

		if (!args.role) {
			await message.util.send({
				content: 'Please Mention A Role!',
			});

			return;
		}

		if (args.type === 'girl') args.type = 'girls';

		await this.client.database.setRole(message.guild.id, args.role.id, args.type.toLowerCase());

		await message.util.send({
			content: `<:icons_Correct:1106127305308393492> Successfully setuped **${
				args.role.name
			}** to **${this.client.helpers.capitalise(args.type)}** role in this server!`,
		});
	}
};
