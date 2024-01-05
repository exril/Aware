const { Command } = require('@pheonix/framework');
const { Message, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = class Punishment extends Command {
	constructor() {
		super('punishment', {
			aliases: ['punishment'],
			category: 'Security',
			description: {
				content: 'Set the antinuke punishment',
				usage: '.punishment [ban|kick|timeout|removeroles]',
				examples: [''],
			},
			slash: true,
			cooldown: 5000,
			args: [
				{
					id: 'option',
					type: 'string',
				},
			],
		});
	}

	/**
	 *
	 * @param {Message} message
	 * @param {{ option: string; }} args
	 */
	async exec(message, args) {
		if (message.guild.ownerId !== message.author.id && !this.client.isSuperUser(message.author.id)) {
			return await message.util.reply({
				content: 'Only the guild owner can use this command.',
			});
		}

		const { option } = args;

		const data = await this.client.database.getAntinuke(message.guild.id);

		if (!data) {
			await message.util.reply({
				content: 'Anti-Nuke is not enabled.',
			});

			return;
		}

		const embed = this.client.util
			.embed()
			.setColor(this.client.config.colors.primary)
			.setTimestamp()
			.setFooter({
				text: message.guild.name,
				iconURL: message.guild.iconURL(),
			})
			.setAuthor({
				name: message.author.tag,
				iconURL: message.author.displayAvatarURL(),
			});

		if (!option) {
			embed.setDescription(`The current punishment is **${data?.punishment ?? 'Ban'}**.`);

			const punishments = ['Ban', 'Kick', 'Timeout', 'RemoveRoles'];

			const msg = await message.util.reply({
				embeds: [embed],
				components: [
					new ActionRowBuilder().addComponents(
						punishments.map((p) =>
							new ButtonBuilder()
								.setCustomId(`antinuke-punishment-${p.toLowerCase()}`)
								.setLabel(p)
								.setStyle(ButtonStyle.Secondary)
						)
					),
				],
				fetchReply: true,
			});

			const collector = msg.createMessageComponentCollector({
				filter: (i) => i.user.id === message.author.id,
				time: 30000,
			});

			collector.on('collect', async (i) => {
				await i.deferUpdate();

				const punishment = i.customId.split('-')[2];

				await this.client.database.updateAntinuke(message.guild.id, {
					punishment: punishment,
				});

				await i.editReply({
					embeds: [embed.setDescription(`The current punishment is **${punishment}**.`)],
					components: [],
				});
			});
		} else {
			if (!['ban', 'kick', 'timeout', 'removeroles'].includes(option.toLowerCase())) {
				await message.util.reply({
					content: 'Invalid punishment.',
				});

				return;
			}

			await this.client.database.updateAntinuke(message.guild.id, {
				punishment: option.toLowerCase(),
			});

			await message.util.reply({
				content: `The punishment has been set to **${option.toLowerCase()}**.`,
			});
		}
	}
};
