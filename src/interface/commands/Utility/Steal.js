const { Command } = require('@pheonix/framework');
const { Message, FormattingPatterns } = require('discord.js');

module.exports = class Steal extends Command {
	constructor() {
		super('steal', {
			aliases: ['steal', 'stealemojis', 'stealemoji'],
			category: 'Utility',
			description: {
				content: 'Steal emojis and adds to the server.',
				usage: '.steal <emojis>',
				examples: [''],
			},
			slash: true,
			cooldown: 5000,
			args: [
				{
					id: 'assets',
					type: 'string',
					match: 'separate',
				},
			],
			userPermissions: ['ManageEmojisAndStickers'],
			clientPermissions: ['ManageEmojisAndStickers'],
		});
	}

	/**
	 *
	 * @param {Message} message
	 * @param {{ assets: string[] }} args
	 */
	async exec(message, args) {
		const { assets } = args;

		const baseUrl = 'https://cdn.discordapp.com/';

		if ((!assets?.length && assets !== null && message.stickers.size !== 0)) {
			await message.util.reply({
				content: 'Please provide the emojis/sticker to steal!',
			});

			return;
		}

		if ((assets?.length > 15 && assets !== null)) {
			await message.util.reply({
				content: 'You can only add 15 emojis at a time!',
			});

			return;
		}

		const validation = assets?.every(
			(asset) => FormattingPatterns.Emoji.test(asset) || FormattingPatterns.AnimatedEmoji.test(asset)
		);

		if ((!validation && assets !== null)) {
			await message.util.reply({
				content: 'Please provide valid emojis/stickers to steal!',
			});

			return;
		}

		if (message.reference) {
			const reference = await message.fetchReference();

			const stickers = reference.stickers.map((sticker) => sticker);
			const formats = {
				1: '.png',
				2: '.apng',
				3: '.lottie',
				4: '.gif',
			};

			const sticks = [];

			for (const sticker of stickers) {
				const stickerUrl = baseUrl + 'stickers/' + sticker.id + formats[sticker.format];

				const stick = await message.guild.stickers.create({
					attachment: stickerUrl,
					name: sticker.name,
					description: sticker.description,
					tags: sticker.tags,
				});

				sticks.push(stick);
			}

			for (const stick of sticks) {
				await message.util.reply({
					content: `Sticker **${stick.name}** has been added to the server!`,
					stickers: [stick],
				});
			}

			return;
		}

		if (message.stickers.size && message.guild.premiumTier >= 2) {
			const stickers = message.stickers.map((sticker) => sticker);
			const formats = {
				1: '.png',
				2: '.apng',
				3: '.lottie',
				4: '.gif',
			};

			const sticks = [];

			for (const sticker of stickers) {
				const stickerUrl = baseUrl + 'stickers/' + sticker.id + formats[sticker.format];

				const stick = await message.guild.stickers.create({
					attachment: stickerUrl,
					name: sticker.name,
					description: sticker.description,
					tags: sticker.tags,
				});

				sticks.push(stick);
			}

			for (const stick of sticks) {
				await message.util.reply({
					content: `Sticker **${stick.name}** has been added to the server!`,
					stickers: [stick],
				});
			}

			return;
		} else {
			const emojis = [];

			for (const asset of assets) {
				if (FormattingPatterns.Emoji.test(asset) || FormattingPatterns.AnimatedEmoji.test(asset)) {
					const emojiUrl = baseUrl + 'emojis/' + asset.replace(/\D/g, '');
					const emojiName = asset.split(':')[1];

					const emoji = await message.guild.emojis.create({
						attachment: emojiUrl,
						name: emojiName,
					});

					emojis.push(emoji);
				}
			}

			await message.util.reply({
				embeds: [
					this.client.util
						.embed()
						.setColor(this.client.config.colors.primary)
						.setTitle('Successfully added emojis to server.')
						.setDescription(`Emoji(s) : ${emojis.map((emoji) => emoji.toString()).join(' ')}`),
				],
			});

			return;
		}
	}
};
