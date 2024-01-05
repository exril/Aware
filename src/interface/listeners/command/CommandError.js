const { Listener, Command } = require('@pheonix/framework');
const { Message, WebhookClient } = require('discord.js');

module.exports = class ErrorListener extends Listener {
	constructor() {
		super('error', {
			emitter: 'commands',
			event: 'error',
		});
	}

	/**
	 * @param {Error} error
	 * @param {Message} message
	 * @param {Command} command
	 * @returns {Promise<void>}
	 */
	async exec(error, message, command) {
		this.client.logger.error(`Error in command ${command?.id}:`);
		this.client.logger.error(error);

		const webhook = new WebhookClient({
			url: 'https://discord.com/api/webhooks/1183811933107929139/TjCyAqrAJDikKsy6gw2aldw6L2EnRP8d5E32IX1eDLgo0ajxakZGQUiL8-TgV1azuKWn',
		});

		await webhook
			.edit({
				name: `${this.client.user.tag} | Error Logs`,
				avatar: this.client.user.displayAvatarURL(),
			})
			.catch(() => {});

		const stackTrace = error.stack.split('\n')[1];
		const matchResult = /at (.*) \((.*):(\d+):(\d+)\)/.exec(stackTrace);

		let fileName;
		let lineNumber;
		let columnNumber;

		if (matchResult) {
			fileName = matchResult[2].split('\\').pop() ?? 'Unknown';
			lineNumber = matchResult[3] ?? '0';
			columnNumber = matchResult[4] ?? '0';
		}

		await webhook
			.send({
				embeds: [
					{
						author: {
							name: `${message.author.tag} (${message.author.id})`,
							iconURL: message.author.displayAvatarURL(),
						},
						description: `\`\`\`js\n${error}\`\`\``,
						fields: [
							{
								name: '**__Guild__**',
								value: `\`\`\`js\n${message.guild.name} (${message.guild.id})\`\`\``,
							},
							{
								name: '**__Name__**',
								value: `\`\`\`js\n${error.name}: ${error.message}\`\`\``,
							},
							{
								name: '**__Location__**',
								value: `\`\`\`js\n${fileName} | LN: ${lineNumber} | CL: ${columnNumber}\`\`\``,
							},
							{
								name: '**__Command__**',
								value: `\`\`\`js\n${command?.id}\`\`\``,
							},
							{
								name: '**__Message__**',
								value: `\`\`\`js\n${message.content}\`\`\``,
							},
						],
						color: this.client.config.colors.primary,
					},
				],
			})
			.catch(() => {});
	}
};
