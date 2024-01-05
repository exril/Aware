const { Command, Argument } = require('@pheonix/framework');
const { Message } = require('discord.js');

module.exports = class GiveawayStart extends Command {
	constructor() {
		super('gstart', {
			aliases: ['gstart', 'giveawaystart'],
			category: 'Giveaways',
			description: {
				content: 'Start a giveaway.',
				usage: '.gstart <time> <winners> <prize>',
				examples: [''],
			},
			slash: true,
			cooldown: 5000,
			args: [
				{
					id: 'time',
					type: 'string',
				},
				{
					id: 'winners',
					type: Argument.union('number', 'string'),
				},
				{
					id: 'prize',
					type: 'string',
				},
			],
			userPermissions: ['ManageMessages', 'ManageChannels', 'ManageGuild'],
			clientPermissions: ['ManageMessages', 'ManageChannels', 'ManageGuild'],
		});
	}

	/**
	 *
	 * @param {Message} message
	 * @param {{ time: string; winners: number; prize: string; }} args
	 */
	async exec(message, args) {
		const { time, winners, prize } = args;

		if (!time) {
			await message.util.reply({
				embeds: [
					this.client.util
						.embed()
						.setColor(16711680)
						.setDescription(
							`You have missed an option \`time\`. Example:\n\`\`\`yml\n.gstart <time> <winners> <prize>\n\`\`\``
						),
				],
			});

			return;
		}

		if (!winners) {
			await message.util.reply({
				embeds: [
					this.client.util
						.embed()
						.setColor(16711680)
						.setDescription(
							`You have missed an option \`winners\`. Example:\n\`\`\`yml\n.gstart <time> <winners> <prize>\n\`\`\``
						),
				],
			});

			return;
		}

		if (!prize) {
			await message.util.reply({
				embeds: [
					this.client.util
						.embed()
						.setColor(16711680)
						.setDescription(
							`You have missed an option \`prize\`. Example:\n\`\`\`yml\n.gstart <time> <winners> <prize>\n\`\`\``
						),
				],
			});

			return;
		}

		if (
			[
				's',
				'sec',
				'secs',
				'second',
				'seconds',
				'm',
				'min',
				'mins',
				'minute',
				'minutes',
				'h',
				'hour',
				'hours',
				'd',
				'day',
				'days',
				'w',
				'week',
				'weeks',
				'month',
				'months',
				'y',
				'year',
				'years',
			].some((x) => time.endsWith(x)) &&
			isNaN(parseInt(time))
		) {
			await message.util.reply({
				embeds: [this.client.util.embed().setColor(16711680).setDescription(`The time must be a number.`)],
			});

			return;
		}

		if (isNaN(winners)) {
			await message.util.reply({
				embeds: [
					this.client.util.embed().setColor(16711680).setDescription(`The winners must be a number.`),
				],
			});

			return;
		}

		if (winners > 10) {
			await message.util.reply({
				embeds: [
					this.client.util
						.embed()
						.setColor(16711680)
						.setDescription(`The winners must be less than 10.`),
				],
			});

			return;
		}

		await message.delete().catch(() => {});

		await this.client.giveaways.create({
			channel: message.channel,
			prize: prize,
			endAt: parseInt(time),
			prefix:
				String(
					time
						.split('')
						.filter((x) => isNaN(x))
						.join('')
				) || 's',
			winnerCount: winners,
			hostedBy: message.author,
			attachment: message.attachments?.first()?.url ?? null,
		});
	}
};
