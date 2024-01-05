const { Command, Argument } = require('@pheonix/framework');
const { Message, User, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = class Banner extends Command {
	constructor() {
		super('banner', {
			aliases: ['banner'],
			category: 'Utility',
			description: {
				content: 'gives a banner image',
				usage: '.banner',
				examples: [''],
			},
			slash: true,
			cooldown: 5000,
			args: [
				{
					id: 'user',
					type: Argument.union('user', 'string'),
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
		if (!args?.user) args['user'] = await message.author.fetch(true);
		if (!(args.user instanceof User))
			args['user'] = await this.client.users.fetch(args.user, { force: true }).catch(() => null);

		if (args.user === null) return;

		if (args.user.banner === null) {
			await message.util.send({
				content: 'User does not have a banner.',
			});

			return;
		}

		const banner = args.user.bannerURL({ size: 4096 });
		const isAnimated = args.user.banner?.startsWith('a_');

		const buttons = [
			new ButtonBuilder()
				.setLabel('PNG')
				.setStyle(ButtonStyle.Link)
				.setURL(isAnimated ? banner.replace('.gif', '.png') : banner.replace('.webp', '.png')),
			new ButtonBuilder()
				.setLabel('JPG')
				.setStyle(ButtonStyle.Link)
				.setURL(isAnimated ? banner.replace('.gif', '.jpg') : banner.replace('.webp', '.jpg')),
			new ButtonBuilder()
				.setLabel('WEBP')
				.setStyle(ButtonStyle.Link)
				.setURL(isAnimated ? banner.replace('.gif', '.webp') : banner),
		];

		if (isAnimated) buttons.push(new ButtonBuilder().setLabel('GIF').setStyle(ButtonStyle.Link).setURL(banner));

		await message.util.send({
			embeds: [
				this.client.util
					.embed()
					.setTitle(`Banner`)
					.setImage(banner)
					.setColor(this.client.config.colors.primary),
			],
			components: [new ActionRowBuilder().addComponents(buttons)],
		});
	}
};
