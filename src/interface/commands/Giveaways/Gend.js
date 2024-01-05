const { Command, Argument } = require('@pheonix/framework');
const { Message } = require('discord.js');

module.exports = class GiveawayEnd extends Command {
	constructor() {
		super('gend', {
			aliases: ['gend', 'giveawayend'],
			category: 'Giveaways',
			description: {
				content: 'Ends a giveaway.',
				usage: '.gend <id>',
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

		await this.client.giveaways.update({
			message,
			ctx,
			channel: ctx.channel,
		});
	}
};
