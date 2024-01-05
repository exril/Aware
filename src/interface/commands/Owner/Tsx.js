const { Command } = require('@pheonix/framework');
const BaseClient = require('@root/src/core/BaseClient');
const { Message } = require('discord.js');
const { default: Dokdo } = require('dokdo');

module.exports = class TSX extends Command {
	constructor() {
		super('tsx', {
			aliases: ['tsx', 'jsx'],
			category: 'Owner',
			description: {
				content: 'No description provided.',
				usage: '.tsx',
				examples: [''],
			},
			slash: false,
			cooldown: 5000,
			args: [
				{
					id: 'type',
					type: 'string',
					match: 'option',
					flag: ['--cat', '--curl', '--docs', '--exec', '--js', '--jsi', '--shard', '--raw'],
				},
				{
					id: 'code',
					type: 'string',
					match: 'rest',
				},
			],
			superUserOnly: true,
		});
	}

	/**
	 *
	 * @param {Message} message
	 */
	async exec(message, { type, code }) {
	}
};
