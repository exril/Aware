const BaseClient = require('@core/BaseClient');
const { Message } = require('@pheonix/framework');
const { TextChannel, User, Message } = require('discord.js');

class Giveaways {
	/**
	 *
	 * @param {BaseClient} client
	 */
	constructor(client) {
		/**
		 * @type {BaseClient}
		 */
		this.client = client;

		Array.prototype.random = () => {
			return this[Math.floor(Math.random() * this.length)];
		};
	}

	async _ready() {
		this._initiateCheck();
	}

	/**
	 *
	 * @param {{ channel: TextChannel; prize: string; endAt: number; winnerCount: number; hostedBy: User; }} data
	 */
	async create(data) {
		if (data.prefix) {
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
				].includes(data.prefix)
			) {
				if (['s', 'sec', 'secs', 'second', 'seconds'].includes(data.prefix)) {
					data.endAt = data.endAt * 1000;
				} else if (['m', 'min', 'mins', 'minute', 'minutes'].includes(data.prefix)) {
					data.endAt = data.endAt * 1000 * 60;
				} else if (['h', 'hour', 'hours'].includes(data.prefix)) {
					data.endAt = data.endAt * 1000 * 60 * 60;
				} else if (['d', 'day', 'days'].includes(data.prefix)) {
					data.endAt = data.endAt * 1000 * 60 * 60 * 24;
				} else if (['w', 'week', 'weeks'].includes(data.prefix)) {
					data.endAt = data.endAt * 1000 * 60 * 60 * 24 * 7;
				} else if (['month', 'months'].includes(data.prefix)) {
					data.endAt = data.endAt * 1000 * 60 * 60 * 24 * 30;
				} else if (['y', 'year', 'years'].includes(data.prefix)) {
					data.endAt = data.endAt * 1000 * 60 * 60 * 24 * 365;
				}
			}
		}

		const { channel, prize, endAt, winnerCount, hostedBy, attachment } = data;

		const time = Math.floor((Date.now() + endAt) / 1000);

		const msg = await channel.send({
			content: '🎉 **GIVEAWAY STARTED** 🎉',
			embeds: [
				this.client.util
					.embed()
					.setColor(this.client.config.colors.primary)
					.setAuthor({
						name: prize,
						iconURL: this.client.user.displayAvatarURL(),
					})
					.setDescription(`Ends at <t:${time}:R> <t:${time}:T>\nHosted by ${hostedBy.toString()}`)
					.setFooter({
						text: `Ends at`,
					})
					.setTimestamp(time * 1000),
			],
		});

		await msg.react('🎉');

		await this.client.database.createGiveaway(msg.guildId, {
			messageId: msg.id,
			channelId: channel.id,
			endAt: time,
			winners: winnerCount,
			attachment: attachment,
			prize,
		});

		return;
	}

	/**
	 *
	 * @param {{ channel: TextChannel; message: Message; ctx: Message; }} data
	 */
	async update(data) {
		const { channel, message, ctx } = data;

		const giveaway = await this.client.database.getGiveaway(channel.guild.id, message.id);

		if (!giveaway) {
			await ctx.util.reply({
				embeds: [
					this.client.util
						.embed()
						.setColor(16711680)
						.setDescription('I could not find a giveaway with that ID.'),
				],
			});

			return;
		}

		await this.client.database.updateGiveaway(channel.guild.id, message.id, {
			active: false,
		});

		await ctx.util.reply({
			content: 'Giveaway ended.',
		});

		await message.edit({
			content: '🎉 **GIVEAWAY ENDED** 🎉',
		});

		const winners = await this._getWinners(giveaway, message);

		if (!winners.length) {
			await message.reply({
				content: 'No one won the giveaway.',
			});

			return;
		}

		const winnerList = winners.map((winner) => winner.toString()).join(', ');

		await message.reply({
			content: `Congratulations ${winnerList}! You won **${giveaway.prize}**!`,
		});

		return;
	}

	/**
	 *
	 * @param {{ channel: TextChannel; message: Message; ctx: Message; }} data
	 */
	async delete(data) {
		const { channel, message, ctx } = data;

		const giveaway = await this.client.database.getGiveaway(channel.guild.id, message.id);

		if (!giveaway) {
			await ctx.util.reply({
				embeds: [
					this.client.util
						.embed()
						.setColor(16711680)
						.setDescription('I could not find a giveaway with that ID.'),
				],
			});

			return;
		}

		await this.client.database.deleteGiveaway(channel.guild.id, message.id);

		await message.delete().catch(() => {});

		await ctx.util.reply({
			content: 'Giveaway deleted.',
		});

		return;
	}

	/**
	 *
	 * @param {{ channel: TextChannel; message: Message; ctx: Message; }} data
	 */
	async reroll(data) {
		const { channel, message, ctx } = data;

		const giveaway = await this.client.database.getGiveaway(channel.guild.id, message.id);

		if (!giveaway) {
			await ctx.util.reply({
				embeds: [
					this.client.util
						.embed()
						.setColor(16711680)
						.setDescription('I could not find a giveaway with that ID.'),
				],
			});

			return;
		}

		if (giveaway.active) {
			await ctx.util.reply({
				embeds: [
					this.client.util.embed().setColor(16711680).setDescription('This giveaway is not yet ended!'),
				],
			});

			return;
		}

		await ctx.util.reply({
			content: 'Giveaway rerolled.',
		});

		const winners = await this._getWinners(giveaway, message);

		if (!winners.length) {
			await message.reply({
				content: 'No one won the giveaway.',
			});

			return;
		}

		const winnerList = winners.map((winner) => winner.toString()).join(', ');

		await message.reply({
			content: `Congratulations ${winnerList}! You won **${giveaway.prize}**!`,
		});

		return;
	}

	/**
	 *
	 * @param {any} giveaway
	 * @param {Message} message
	 * @returns
	 */
	async _getWinners(giveaway, message) {
		const { winners } = giveaway;
		const reactions = message.reactions.cache.get('🎉');
		const users = await reactions.users.fetch();

		const winnerCount = users.filter((user) => !user.bot).random(winners);

		return winnerCount;
	}
}

module.exports = Giveaways;
