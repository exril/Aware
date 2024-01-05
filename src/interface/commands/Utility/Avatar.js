const { Command, Argument } = require('@pheonix/framework');
const { Message, User, ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors } = require('discord.js');

module.exports = class Avatar extends Command {
	constructor() {
		super('avatar', {
			aliases: ['avatar', 'av'],
			category: 'Utility',
			description: {
				content: 'Shows the avatar of the mentioned user.',
				usage: '.avatar <user>',
				examples: [''],
			},
			slash: true,
			cooldown: 5000,
			args: [
				{
					id: 'user',
					type: Argument.union('user', 'string'),
					match: 'rest',
				},
			],
		});
	}

	/**
	 *
	 * @param {Message} message
	 * @param {{ user: User }} args
	 */
	async exec(message, args) {
		if (!args?.user) args['user'] = message.author;
		if (!(args.user instanceof User)) args['user'] = await this.client.users.fetch(args.user).catch(() => null);

		if (args.user === null) {
			const msg = await message.util.reply({
				embeds: [
					this.client.util
						.embed()
						.setTitle('Error')
						.setDescription('Invalid user provided.')
						.setColor(16711680)
						.setTimestamp(),
				],
			});

			setTimeout(async () => await msg.delete(), 5000);

			return;
		}

		const member = await this.client.util.fetchMember(message.guild, args.user, false).catch(() => null);

		let msg;
		let collector;

		if (member?.avatar !== null && member !== null) {
			msg = await message.util.send({
				embeds: [
					this.client.util
						.embed()
						.setDescription('which avatar would you like to see?')
						.setColor(this.client.config.colors.primary),
				],
				components: [
					new ActionRowBuilder().addComponents([
						new ButtonBuilder()
							.setCustomId('global')
							.setLabel('Global Avatar')
							.setStyle(ButtonStyle.Primary),
						new ButtonBuilder()
							.setCustomId('server')
							.setLabel('Server Avatar')
							.setStyle(ButtonStyle.Primary),
					]),
				],
			});
		}

		if (msg) {
			collector = msg.createMessageComponentCollector({
				filter: (i) => i.user.id === message.author.id,
				time: 30000,
			});
		} else {
			const buttons = [
				new ButtonBuilder()
					.setStyle(ButtonStyle.Link)
					.setLabel('JPEG')
					.setURL(args.user.displayAvatarURL({ size: 2048, extension: 'jpeg' })),
				new ButtonBuilder()
					.setStyle(ButtonStyle.Link)
					.setLabel('PNG')
					.setURL(args.user.displayAvatarURL({ size: 2048, extension: 'png' })),
			];

			if (args.user.avatar.startsWith('a_'))
				buttons.push(
					new ButtonBuilder()
						.setStyle(ButtonStyle.Link)
						.setLabel('GIF')
						.setURL(args.user.displayAvatarURL({ size: 2048, extension: 'gif' }))
				);

			await message.util.send({
				embeds: [
					this.client.util
						.embed()
						.setImage(args.user.displayAvatarURL({ size: 2048 }))
						.setDescription(`**${args.user.tag}'s** global avatar`)
						.setColor(this.client.config.colors.primary),
				],
				components: [new ActionRowBuilder().addComponents(buttons)],
			});

			return;
		}

		collector.on('collect', async (i) => {
			if (i.customId === 'global') {
				const buttons = [
					new ButtonBuilder()
						.setStyle(ButtonStyle.Link)
						.setLabel('JPEG')
						.setURL(args.user.displayAvatarURL({ size: 2048, extension: 'jpeg' })),
					new ButtonBuilder()
						.setStyle(ButtonStyle.Link)
						.setLabel('PNG')
						.setURL(args.user.displayAvatarURL({ size: 2048, extension: 'png' })),
				];

				if (args.user.avatar.startsWith('a_'))
					buttons.push(
						new ButtonBuilder()
							.setStyle(ButtonStyle.Link)
							.setLabel('GIF')
							.setURL(args.user.displayAvatarURL({ size: 2048, extension: 'gif' }))
					);

				await i.update({
					embeds: [
						this.client.util
							.embed()
							.setImage(args.user.displayAvatarURL({ size: 2048 }))
							.setDescription(`**${args.user.tag}'s** global avatar`)
							.setColor(this.client.config.colors.primary),
					],
					components: [new ActionRowBuilder().addComponents(buttons)],
				});
			} else if (i.customId === 'server') {
				const buttons = [
					new ButtonBuilder()
						.setStyle(ButtonStyle.Link)
						.setLabel('JPEG')
						.setURL(member.displayAvatarURL({ size: 2048, extension: 'jpeg' })),
					new ButtonBuilder()
						.setStyle(ButtonStyle.Link)
						.setLabel('PNG')
						.setURL(member.displayAvatarURL({ size: 2048, extension: 'png' })),
				];

				if (member.avatar.startsWith('a_'))
					buttons.push(
						new ButtonBuilder()
							.setStyle(ButtonStyle.Link)
							.setLabel('GIF')
							.setURL(member.displayAvatarURL({ size: 2048, extension: 'gif' }))
					);

				await i.update({
					embeds: [
						this.client.util
							.embed()
							.setImage(member.displayAvatarURL({ size: 2048 }))
							.setDescription(`**${member.user.tag}'s** Server avatar:`)
							.setColor(this.client.config.colors.primary),
					],
					components: [new ActionRowBuilder().addComponents(buttons)],
				});
			}
		});
	}
};
