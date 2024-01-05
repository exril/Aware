const { Command, Argument } = require('@pheonix/framework');
const { Message } = require('discord.js');

module.exports = class GiveawayEnd extends Command {
	constructor() {
		super('gdelete', {
			aliases: ['gdelete', 'giveawaydelete'],
			category: 'Giveaways',
			description: {
				content: 'Deletes a giveaway.',
				usage: '.gdelete <id>',
				examples: [''],
			},
			slash: true,
			cooldown: 5000,
			args: [
				{
					id: 'message',
					type: Argument.union('message', 'string'),
				},
			],
			userPermissions: ['ManageMessages', 'ManageChannels', 'ManageGuild'],
			clientPermissions: ['ManageMessages', 'ManageChannels', 'ManageGuild'],
		});
	}

	/**
	 *
	 * @param {Message} message
	 * @param {{ message: Message }} args
	 */
	async exec(ctx, args) {
		const { message } = args;

		if (!(message instanceof Message)) {
			await ctx.util.reply({
				embeds: [
					this.client.util
						.embed()
						.setColor(16711680)
						.setDescription(`I could not find a giveaway with that ID.`),
				],
			});

			return;
		}

		await this.client.giveaways.delete({
			message,
			ctx,
			channel: ctx.channel,
		});
	}
};
