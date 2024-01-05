const { Command, Argument } = require('@pheonix/framework');
const { Message, Role, Emoji, GuildPremiumTier } = require('discord.js');

module.exports = class Roleicon extends Command {
	constructor() {
		super('roleicon', {
			aliases: ['roleicon', 'ri', 'ricon'],
			category: 'Utility',
			description: {
				content: 'Set Role Icon!',
				usage: '.roleicon <role> <emoji>>',
				examples: [''],
			},
			slash: true,
			cooldown: 5000,
			args: [
				{
					id: 'role',
					type: Argument.union('role', 'string'),
				},
				{
					id: 'emoji',
					type: Argument.union('emoji', 'string'),
				},
			],
		});
	}

	/**
	 *
	 * @param {Message} message
	 * @param {{ role: Role, emoji: Emoji }} args
	 */
	async exec(message, args) {
		if (!args.role) {
			await message.util.send({
				content: 'Please Provide A Role And An Emoji To Set As Icon!',
			});

			return;
		}

		if (!args.emoji) {
			await message.util.send({
				content: 'Please Provide A Role And An Emoji To Set As Icon!',
			});

			return;
		}

		if (!(args.role instanceof Role)) {
			await message.util.send({
				content: 'Please Provide A Valid Role!',
			});

			return;
		}

		args.emoji = args.emoji.replace(/<a?:\w+:(\d+)>/, '$1');

		args.emoji = await message.guild.emojis.fetch(args.emoji).catch(() => null);

		if (!(args.emoji instanceof Emoji)) {
			await message.util.send({
				content: 'Please Provide A Valid Emoji!',
			});

			return;
		}

		// Prismo avg skill issue even if the role is managed they said this :(

		if (message.guild.premiumTier < GuildPremiumTier.Tier2 || args.role.managed) {
			await message.util.send({
				content: 'Guild Is Not In Level 2 Boosting Tier!',
			});

			return;
		}

		await args.role.edit({
			icon: args.emoji?.url,
		});

		await message.util.send({
			content: `Successfully Updated **${args.role.name}** Role Icon!`,
		});
	}
};
