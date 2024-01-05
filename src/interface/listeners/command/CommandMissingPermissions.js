const { Listener, Command } = require('@pheonix/framework');
const { Message, Colors } = require('discord.js');

module.exports = class MissingPermissions extends Listener {
	constructor() {
		super('', {
			emitter: 'commands',
			event: 'missingPermissions',
		});
	}

	/**
	 * @param {Message} message
	 * @param {Command} command
	 * @param {'client' | 'user'} type
	 * @param {any} missing
	 * @returns {Promise<void>}
	 */
	async exec(message, command, type, missing) {
		this.client.logger.error(`Command Blocked ${command?.id}:`);

		if (type === 'client') {
			this.client.logger.error(`Missing Client Permissions: ${missing}`);
		} else {
			this.client.logger.error(`Missing User Permissions: ${missing}`);
		}

		await message.util.reply({
			embeds: [
				this.client.util
					.embed()
					.setColor(Colors.Red)
					.setDescription(
						`${
							type === 'client' ? 'I am' : 'You are'
						} missing the following permission(s):\n**${missing.join('\n')}**`
					)
					.setFooter({
						text: `Command Blocked ${command?.id}`,
						iconURL: this.client.user.displayAvatarURL(),
					})
					.setTimestamp()
					.setAuthor({
						name: message.author.tag,
						iconURL: message.author.displayAvatarURL(),
					}),
			],
		});
	}
};
