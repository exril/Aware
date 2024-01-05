const { Listener } = require('@pheonix/framework');
const { Guild } = require('discord.js');
const { WebhookClient } = require('discord.js');

module.exports = class GuildDelete extends Listener {
	constructor() {
		super('guildDelete', {
			emitter: 'client',
			event: 'guildDelete',
		});
	}

	/**
	 *
	 * @param {Guild} guild
	 */
	async exec(guild) {
		const webhookURL =
			'https://discord.com/api/webhooks/1183811145824469094/xJwmUueLir7enmCxDcRdpJcq4OUkarMFCWRrd9e3Ver_kqZlhYNcKghj2jE8drEceqLx';

		const webhook = new WebhookClient({ url: webhookURL });

		await webhook
			.edit({
				name: `${this.client.user.tag} | Leave Logs`,
				avatar: this.client.user.displayAvatarURL(),
			})
			.catch(() => {});

		await webhook
			.send({
				embeds: [
					this.client.util
						.embed()
						.setTitle('Guild Left')
						.addFields(
							{
								name: 'Guild Information',
								value: `Server Name: ${guild.name}\nServer ID: ${guild.id}\nServer Owner: ${
									guild.ownerId
								}\nMember Count: ${
									guild.memberCount
								}\nServer Created At: <t:${Math.floor(
									guild.createdTimestamp / 1000
								)}:R>\nRoles: ${guild.roles.cache.size ?? 0}\nChannels: ${
									guild.channels.cache.size ?? 0
								}\nEmojis: ${guild.emojis.cache.size ?? 0}`,
								inline: true,
							},
							{
								name: 'Bot Information',
								value: `Servers: ${
									this.client.guilds.cache.size
								}\nUsers: ${this.client.guilds.cache.reduce(
									(a, b) => a + b.memberCount,
									0
								)}\nChannels: ${this.client.channels.cache.size}`,
								inline: true,
							}
						)
						.setThumbnail(guild.iconURL())
						.setFooter({
							text: this.client.user.tag,
							iconURL: this.client.user.displayAvatarURL(),
						})
						.setColor(this.client.config.colors.primary),
				],
			})
			.catch(() => {});
	}
};
