const { Command } = require('@pheonix/framework');
const { Message, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = class About extends Command {
	constructor() {
		super('about', {
			aliases: ['about', 'aboutme'],
			category: 'Utility',
			description: {
				content: 'Get information about the bot',
				usage: '.about',
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
		const { developers, website_designers, contributers } = this.client.config.positions;

		const mems = [];

		for (const u of [...developers, ...website_designers, ...contributers]) {
			const user = await this.client.users.fetch(u).catch(() => null);
                        
                        if (!user) continue;

			let position;

			if (developers.includes(u)) position = 'developer';
			if (website_designers.includes(u)) position = 'website_designer';
			if (contributers.includes(u)) position = 'contributer';

			mems.push({
				name: user.username,
				value: user.id,
				position,
			});
		}

		const baseUrl = 'https://discord.com/users/';

		const embed = this.client.util
			.embed()
			.setColor(this.client.config.colors.primary)
			.setAuthor({
				name: `About ${this.client.user.username}`,
				iconURL: this.client.user.displayAvatarURL(),
			})
			.setDescription(
				`Hey, **${
					this.client.user.username
				}** Is A Multi-Purpose Discord Bot With Many\nFeatures. You Can Use The \`${
					message.util.isSlash ? `/` : `.`
				}help\` Command To Get Started.\n\n**Developers**\n${mems
					.filter((x) => x.position === 'developer')
					.map((x) => `[${x.name}](${baseUrl}${x.value})`)
					.join(', ')}\n\n**Website Designers**\n${mems
					.filter((x) => x.position === 'website_designer')
					.map((x) => `[${x.name}](${baseUrl}${x.value})`)
					.join(', ')}\n\n**Contributers**\n${mems
					.filter((x) => x.position === 'contributer')
					.map((x) => `[${x.name}](${baseUrl}${x.value})`)
					.join(', ')}`
			)
			.setFooter({
				text: `Requested by ${message.author.tag}`,
				iconURL: message.author.displayAvatarURL(),
			})
			.setThumbnail(this.client.user.displayAvatarURL());

		const row = new ActionRowBuilder().addComponents([
			new ButtonBuilder()
				.setLabel('Invite')
				.setStyle(ButtonStyle.Link)
				.setURL(this.client.config.links.invite),
			new ButtonBuilder()
				.setLabel('Support')
				.setStyle(ButtonStyle.Link)
				.setURL(this.client.config.links.support),
			new ButtonBuilder()
				.setLabel('Website')
				.setStyle(ButtonStyle.Link)
				.setURL(this.client.config.links.website),
		]);

		await message.util.send({
			embeds: [embed],
			components: [row],
		});
	}
};
