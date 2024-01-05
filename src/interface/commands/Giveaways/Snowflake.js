const { Command, Argument } = require('@pheonix/framework');
const { Message } = require('discord.js');

module.exports = class Snowflake extends Command {
	constructor() {
		super('snowflake', {
			aliases: ['snowflake', 'timediff'],
			category: 'Giveaways',
			description: {
				content: 'Shows the time difference between between replied message and message ID.',
				usage: '.snowflake <id>',
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
	 * @param {Message} ctx
	 * @param {{ message: Message }} args
	 */
	async exec(ctx, args) {
		const { message } = args;

		if (typeof ctx.reference?.messageId === 'undefined') {
			await ctx.util.reply({
				content: 'You have to reply to a message to use this command.',
			});

			return;
		}

		if (!message || !(message instanceof Message)) {
			await ctx.util.reply({
				content: 'You have to provide a message ID to use this command.',
			});

			return;
		}

		const firstMessage = await ctx.fetchReference();
		const secondMessage = message;

		const timeDifference = (secondMessage.createdTimestamp - firstMessage.createdTimestamp) / 1000;

		await ctx.util.reply({
			embeds: [
				this.client.util
					.embed()
					.setColor(this.client.config.colors.primary)
					.setThumbnail(this.client.user.displayAvatarURL())
					.setDescription(`**${timeDifference.toFixed(2)}** seconds`)
					.setTitle('Snowflake')
					.setFooter({
						text: `Requested by ${ctx.author.tag}`,
						iconURL: ctx.author.displayAvatarURL(),
					})
					.setTimestamp()
					.addFields(
						{
							name: secondMessage.id,
							value: `Sent at <t:${Math.floor(
								secondMessage.createdTimestamp / 1000
							)}:D> (<t:${Math.floor(secondMessage.createdTimestamp / 1000)}:T>)`,
							inline: true,
						},
						{
							name: firstMessage.id,
							value: `Sent at <t:${Math.floor(
								firstMessage.createdTimestamp / 1000
							)}:D> (<t:${Math.floor(firstMessage.createdTimestamp)}:T>`,
							inline: true,
						}
					),
			],
		});
	}
};
