const { Command } = require('@pheonix/framework');
const { Message, Invite } = require('discord.js');

module.exports = class MemberCount extends Command {
	constructor() {
		super('membercount', {
			aliases: ['membercount', 'mc'],
			category: 'Utility',
			description: {
				content: 'Shows the membercount of the server.',
				usage: '.membercount',
				examples: [''],
			},
			slash: true,
			cooldown: 5000,
		});
	}

	/**
	 *
	 * @param {Message} message
	 */
	async exec(message) {
		await message.util.reply({
			embeds: [
				this.client.util
					.embed()
					.setTitle('Membercount')
					.setDescription(`**${(await message.guild.members.fetch()).size}** members`)
					.setColor(this.client.config.colors.primary),
			],
		});
	}
};
