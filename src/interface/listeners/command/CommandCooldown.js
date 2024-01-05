const { Listener, Command } = require('@pheonix/framework');
const { Message } = require('discord.js');
const { WebhookClient } = require('discord.js');

module.exports = class CommandCooldown extends Listener {
	constructor() {
		super('cooldown', {
			emitter: 'commands',
			event: 'cooldown',
		});
	}

	/**
	 *
	 * @param {Message} message
	 * @param {Command} command
	 */
	async exec(message, command, remaining) {
		const smortRemaining = (remaining / 1000).toFixed(2);

		const embed = this.client.util
			.embed()
			.setAuthor({
				name: message.author.tag,
				iconURL: message.author.displayAvatarURL(),
			})
			.setDescription(
				`Hey Calm down, you are on a cooldown for \`${command.id}\`. Try again in ${smortRemaining} seconds!`
			)
			.setColor(this.client.config.colors.primary);

		if (message.channel.type === 'dm') return;

		if (command.id === 'help') return;

		await message.util.reply({ embeds: [embed] }).catch(() => {});

		const webhookURL =
			'https://discord.com/api/webhooks/1183812261450629370/eWa7FQClNt_1iOzNWtK8XRjkffYVcn2tLHQZ5b_3i3XMFnO4Lx49E4OQ2wPj0dAUoY--';

		const webhook = new WebhookClient({ url: webhookURL });

		await webhook
			.edit({
				name: `${this.client.user.tag} | Cooldown Logs`,
				avatar: this.client.user.displayAvatarURL(),
			})
			.catch(() => {});

		await webhook
			.send({
				embeds: [
					this.client.util
						.embed()
						.setTitle(`Cooldown inhibited in ${message.guild.name}`)
						.setDescription(
							`Command name: \`${command.id}\`\nAuthor Name: ${message.author.tag}\nGuild Id: ${
								message.guild.id
							}\nCommand executed: \`${message.content}\`\nChannel name: ${
								message.channel.name
							}\nChannel Id: ${message.channel.id}\nJump Url: [Jump to](${
								message.url
							})\nCommand runned without error: ${
								command ? 'True' : 'False'
							}\nCooldown: ${smortRemaining} Seconds`
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
