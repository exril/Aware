const { Command } = require('@pheonix/framework');
const { Message, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = class Invite extends Command {
	constructor() {
		super('invite', {
			aliases: ['invite', 'inv'],
			category: 'Utility',
			description: {
				content: 'Get the invite link for the bot',
				usage: '.invite',
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
		await message.util.send({
			content: 'Here You Go!',
			components: [
				new ActionRowBuilder().addComponents([
					new ButtonBuilder()
						.setLabel('Invite')
						.setStyle(ButtonStyle.Link)
						.setURL(this.client.config.links.invite),
					new ButtonBuilder()
						.setLabel('Support Server')
						.setStyle(ButtonStyle.Link)
						.setURL(this.client.config.links.support),
				]),
			],
		});
	}
};
