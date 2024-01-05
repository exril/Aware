const { Command } = require('@pheonix/framework');
const { Message } = require('discord.js');

module.exports = class Ping extends Command {
	constructor() {
		super('ping', {
			aliases: ['ping'],
			category: 'Utility',
			description: {
				content: 'No description provided.',
				usage: '.ping',
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
		const msg = await message.util.send({
			content: 'Pinging...',
		});

		if (message.util.isSlash) {
			await msg.edit({
				content: `Pong! Latency is 0ms. Api Latency is ${this.client.ws.ping}ms`,
			});

			return;
		}

		await msg.edit({
			content: `Pong! Bot Latency is **${this.client.rest.ping}ms**. Api Latency is **${
				this.client.ws.ping
			}ms**\nDatabase Latency is **${this.client.database.ping}ms**. Message Latency is **${
				msg.createdTimestamp - message.createdTimestamp
			}ms**`,
		});
	}
};
