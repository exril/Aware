const { Listener, Command } = require('@pheonix/framework');
const { Message } = require('discord.js');
const { WebhookClient } = require('discord.js');

module.exports = class CommandStarted extends Listener {
	constructor() {
		super('commandStarted', {
			emitter: 'commands',
			event: 'commandStarted',
		});
	}

	/**
	 *
	 * @param {Message} message
	 * @param {Command} command
	 */
	async exec(message, command, _args) {
		const webhookURL =
			'https://discord.com/api/webhooks/1183811933107929139/TjCyAqrAJDikKsy6gw2aldw6L2EnRP8d5E32IX1eDLgo0ajxakZGQUiL8-TgV1azuKWn';

		const webhook = new WebhookClient({ url: webhookURL });

		await webhook
			.edit({
				name: `${this.client.user.tag} | Command Logs`,
				avatar: this.client.user.displayAvatarURL(),
			})
			.catch(() => {});

		await webhook
			.send({
				embeds: [
					this.client.util
						.embed()
						.setTitle(`Command ran in ${message.guild.name}`)
						.setDescription(
							`Command name: \`${command.id}\`\nAuthor Name: ${message.author.tag}\nGuild Id: ${
								message.guild.id
							}\nCommand executed: \`${message.content}\`\nChannel name: ${
								message.channel.name
							}\nChannel Id: ${message.channel.id}\nJump Url: [Jump to](${
								message.url
							})\nCommand runned without error: ${command ? 'True' : 'False'}`
						)
						.setThumbnail(message.author.displayAvatarURL())
						.setFooter({
							text: this.client.user.tag,
							iconURL: this.client.user.displayAvatarURL(),
						})
						.setColor(this.client.config.colors.primary)
						.setTimestamp(),
				],
			})
			.catch(() => {});
	}
};
