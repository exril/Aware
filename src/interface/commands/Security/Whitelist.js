const { Command, Argument } = require('@pheonix/framework');
const { Message, User } = require('discord.js');

module.exports = class Whitelist extends Command {
	constructor() {
		super('whitelist', {
			aliases: ['whitelist', 'wl'],
			category: 'Security',
			description: {
				content: 'Whitelist A User',
				usage: '.whitelist <add|remove|show> <user>',
				examples: [''],
			},
			slash: true,
			cooldown: 5000,
			args: [
				{
					id: 'option',
					type: 'string',
				},
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
	 * @param {{ option: string; user: User }} args
	 */
	async exec(message, args) {
		if (message.guild.ownerId !== message.author.id && !this.client.isSuperUser(message.author.id)) {
			return await message.util.reply({
				content: 'Only the guild owner can use this command.',
			});
		}

		const { option, user } = args;

		const data = await this.client.database.getAntinuke(message.guild.id);

		if (!data) {
			await message.util.reply({
				content: 'Anti-Nuke is not enabled.',
			});

			return;
		}

		if (!option) {
			await message.util.reply({
				content: 'Please provide a valid action. (add, remove, show)',
			});

			return;
		}

		if (!['add', 'remove', 'show'].includes(option)) return;

		switch (option) {
			case 'add': {
				if (!user || !(user instanceof User)) {
					await message.util.reply({
						content: 'Please provide a valid user.',
					});

					return;
				}

				const isWhitelisted = await this.client.database.getWhitelist(message.guild.id, user.id);

				if (isWhitelisted) {
					await message.util.reply({
						content: 'That user is already whitelisted.',
					});

					return;
				}

				if (data.whitelist.length >= 10) {
					await message.util.reply({
						content: 'You can only whitelist 10 users.',
					});

					return;
				}

				await message.util.reply({
					embeds: [
						this.client.util
							.embed()
							.setColor(this.client.config.colors.primary)
							.setDescription(`Successfully Whitelisted ${user.tag}.`),
					],
				});

				await this.client.database.addWhitelist(message.guild.id, user.id);
				break;
			}

			case 'remove': {
				if (!user || !(user instanceof User)) {
					await message.util.reply({
						content: 'Please provide a valid user.',
					});

					return;
				}

				const isWhitelisted = await this.client.database.getWhitelist(message.guild.id, user.id);

				if (!isWhitelisted) {
					await message.util.reply({
						content: 'That user is not whitelisted.',
					});

					return;
				}

				await message.util.reply({
					embeds: [
						this.client.util
							.embed()
							.setColor(this.client.config.colors.primary)
							.setDescription(`Successfully removed whitelist from ${user.tag}.`),
					],
				});

				await this.client.database.removeWhitelist(message.guild.id, user.id);
				break;
			}

			case 'show': {
				console.log(data);
				if (!data.whitelist.length) {
					await message.util.reply({
						content: 'There are no whitelisted users.',
					});

					return;
				}

				await message.util.reply({
					embeds: [
						this.client.util
							.embed()
							.setColor(this.client.config.colors.primary)
							.setDescription(`${data.whitelist.map((id) => `<@${id}>`).join('\n')}`)
							.setTitle('Whitelisted Users'),
					],
				});
			}
		}
	}
};
