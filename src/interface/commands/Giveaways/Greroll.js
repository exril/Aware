const { Command, Argument } = require('@pheonix/framework');
const { Message } = require('discord.js');

module.exports = class GiveawayReroll extends Command {
	constructor() {
		super('greroll', {
			aliases: ['greroll', 'giveawayreroll', 'reroll'],
			category: 'Giveaways',
			description: {
				content: 'Rerolls a giveaway.',
				usage: '.greroll <id>',
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

		await this.client.giveaways.reroll({
			message,
			ctx,
			channel: ctx.channel,
		});
	}
};
