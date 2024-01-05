const { Command } = require('@pheonix/framework');
const { Message, hyperlink, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = class Botinfo extends Command {
	constructor() {
		super('botinfo', {
			aliases: ['botinfo'],
			category: 'Utility',
			description: {
				content: 'Get information about the bot.',
				usage: '.botinfo',
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
		await message.util.send({
			embeds: [
				this.client.util
					.embed()
					.setTitle('<:emoji_7:1106847836047409196> __Bot Information__')
					.setDescription(
						`**Name** : ${this.client.user.username}\n**Bot ID** : ${
							this.client.user.id
						}\n**Library** : ${hyperlink(
							'Discord.js',
							'https://discord.js.org/#/'
						)}\n**Shards** : 14\n**Uptime** : Last Booted <t:${Math.floor(
							(Date.now() - this.client.uptime) / 1000
						)}:R>\n**Ping** : ${this.client.ws.ping}.5ms\n**Servers** : ${
							this.client.guilds.cache.size
						}\n**Cached Channels** : ${this.client.channels.cache.size.toLocaleString()}\n**Commands** : ${
							this.client.commandHandler.modules.size
						}\n**Users** : ${this.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)}`
					)
					.setFooter({
						text: `Requested by ${message.author.tag}`,
						iconURL: message.author.displayAvatarURL(),
					})
					.setThumbnail(this.client.user.displayAvatarURL())
					.setColor(this.client.config.colors.primary),
			],
			components: [
				new ActionRowBuilder().addComponents([
					new ButtonBuilder()
						.setStyle(ButtonStyle.Link)
						.setLabel('Invite')
						.setURL(this.client.config.links.invite),
					new ButtonBuilder()
						.setStyle(ButtonStyle.Link)
						.setLabel('Support')
						.setURL(this.client.config.links.support),
				]),
			],
		});
	}
};
