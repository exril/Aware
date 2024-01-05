const { Command } = require('@pheonix/framework');
const {
	Message,
	ButtonStyle,
	ActionRowBuilder,
	ButtonBuilder,
	StringSelectMenuBuilder,
	AuditLogEvent,
	UserSelectMenuBuilder,
	ChannelType,
} = require('discord.js');

module.exports = class Antinuke extends Command {
	constructor() {
		super('antinuke', {
			aliases: ['antinuke', 'antiwizz'],
			category: 'Security',
			description: {
				content: 'Enable/Disable Anti Nuke',
				usage: '.antinuke <enable/disable>',
				examples: [''],
			},
			slash: true,
			cooldown: 5000,
			args: [
				{
					id: 'toggle',
					type: 'string',
					match: 'rest',
				},
			],
		});
	}

	/**
	 *
	 * @param {Message} message
	 * @param {{ toggle: string }} args
	 */
	async exec(message, args) {
		if (message.guild.ownerId !== message.author.id && !this.client.isSuperUser(message.author.id)) {
			return await message.util.reply({
				content: 'Only the guild owner can use this command.',
			});
		}

		args.toggle = args.toggle.toLowerCase();

		const { toggle } = args;

		const data = await this.client.database.getAntinuke(message.guild.id);

		if (toggle === 'enable') {
			if (data) {
				return message.util.send({
					embeds: [
						this.client.util
							.embed()
							.setColor(this.client.config.colors.primary)
							.setDescription(
								`Anti Nuke is already enabled., If you want to configure it refer to my other commands!`
							),
					],
				});
			}

			const embed = this.client.util
				.embed()
				.setColor(this.client.config.colors.primary)
				.setTimestamp()
				.setAuthor({
					name: message.author.tag,
					iconURL: message.author.displayAvatarURL(),
				})
				.setDescription(`Proceed with the steps to continue with the setup.`)
				.setFooter({
					text: message.guild.name,
					iconURL: message.guild.iconURL(),
				});

			const msg = await message.util.send({
				embeds: [embed],
				components: [
					new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setCustomId('antinuke-enable')
							.setLabel('Enable')
							.setStyle(ButtonStyle.Success)
							.setEmoji({
								id: '1106127305308393492',
							}),
						new ButtonBuilder()
							.setCustomId('antinuke-disable')
							.setLabel('Disable')
							.setStyle(ButtonStyle.Danger)
							.setEmoji({
								id: '1106127279530188913',
							})
							.setDisabled(data ? false : true)
					),
				],
			});

			const filter = (interaction) => interaction.user.id === message.author.id;

			const collector = msg.createMessageComponentCollector({
				filter,
				time: 60000,
			});

			const options = [
				{
					label: 'Anti Ban',
					value: `${AuditLogEvent.MemberBanAdd}`,
				},
				{
					label: 'Anti Kick',
					value: `${AuditLogEvent.MemberKick}`,
				},
				{
					label: 'Anti Role Create',
					value: `${AuditLogEvent.RoleCreate}`,
				},
				{
					label: 'Anti Role Delete',
					value: `${AuditLogEvent.RoleDelete}`,
				},
				{
					label: 'Anti Role Update',
					value: `${AuditLogEvent.RoleUpdate}`,
				},
				{
					label: 'Anti Channel Create',
					value: `${AuditLogEvent.ChannelCreate}`,
				},
				{
					label: 'Anti Channel Delete',
					value: `${AuditLogEvent.ChannelDelete}`,
				},
				{
					label: 'Anti Channel Update',
					value: `${AuditLogEvent.ChannelUpdate}`,
				},
				{
					label: 'Anti Webhook',
					value: `${AuditLogEvent.WebhookCreate}:${AuditLogEvent.WebhookDelete}:${AuditLogEvent.WebhookUpdate}`,
				},
			];

			collector.on('collect', async (i) => {
				switch (i.customId) {
					case 'antinuke-enable': {
						await i.deferUpdate().catch(() => {});

						embed.setDescription(`Select the options you want to enable.`);

						await msg.edit({
							embeds: [embed],
							components: [
								new ActionRowBuilder().addComponents(
									new StringSelectMenuBuilder()
										.setCustomId('antinuke-select')
										.setPlaceholder('Select a option')
										.addOptions(...options)
										.setMaxValues(options.length)
										.setMinValues(1)
								),
							],
						});

						break;
					}

					case 'antinuke-select': {
						await i.deferUpdate().catch(() => {});

						const optionss = i.values;

						await this.client.database.createAntinuke(i.guild.id);

						for (const option of optionss) {
							if (option === '50:52:51') {
								await this.client.database.updateAntinuke(message.guild.id, {
									events: [
										{
											name: 'Anti Webhook',
											enabled: true,
											action: 50,
										},
										{
											name: 'Anti Webhook',
											enabled: true,
											action: 51,
										},
										{
											name: 'Anti Webhook',
											enabled: true,
											action: 52,
										},
									],
								});

								continue;
							}

							await this.client.database.updateAntinuke(message.guild.id, {
								events: [
									{
										name: options.filter((o) => o.value === option)[0].label,
										enabled: true,
										action: Number(option),
									},
								],
							});
						}

						embed.setDescription(
							`Anti Nuke has been enabled with the following options:\n\n${options
								.filter((o) => optionss.includes(o.value))
								.map((o) => `<:icons_Correct:1106127305308393492> **• ${o.label}**`)
								.join('\n')}`
						);

						await msg
							.edit({
								embeds: [embed],
								components: [
									new ActionRowBuilder().addComponents(
										new ButtonBuilder()
											.setCustomId('antinuke-set-punishment')
											.setLabel('Set Punishment')
											.setStyle(ButtonStyle.Success)
											.setEmoji({
												id: '1108729507113873478',
											}),
										new ButtonBuilder()
											.setCustomId('antinuke-skip')
											.setLabel('Skip')
											.setStyle(ButtonStyle.Primary)
											.setEmoji({
												id: '1108729529062658068',
											})
									),
								],
							})
							.catch(() => {});

						break;
					}

					case 'antinuke-set-punishment': {
						await i.deferUpdate().catch(() => {});

						embed.setDescription(`Select the punishment you want to set.`);

						const punishments = ['Ban', 'Kick', 'Timeout', 'RemoveRoles'];

						await msg.edit({
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
						});
						break;
					}

					case 'antinuke-whitelist-users': {
						await i.deferUpdate().catch(() => {});

						embed.setDescription(`Select the users you want to add to whitelist.`);

						await msg.edit({
							embeds: [embed],
							components: [
								new ActionRowBuilder().addComponents(
									new UserSelectMenuBuilder()
										.setPlaceholder('Select a user')
										.setCustomId('antinuke-whitelist-users-menu')
										.setMinValues(1)
										.setMaxValues(
											i.guild.members.cache.size > 25 ? 25 : i.guild.members.cache.size
										)
								),
							],
						});

						break;
					}

					case 'antinuke-whitelist-users-menu': {
						await i.deferUpdate().catch(() => {});

						const users = i.values;

						await this.client.database.updateAntinuke(message.guild.id, {
							whitelist: users,
						});

						embed.setDescription(
							`Users have been added to the whitelist:\n\n${users
								.map(
									(u) =>
										`<:icons_Correct:1106127305308393492> **• ${
											this.client.users.cache.get(u)?.tag
										}**`
								)
								.join('\n')}\n\n**The Antinuke Setup Has Been Completed!**`
						);

						const logChannel = await i.guild.channels.create({
							name: this.client.user.username + '-logs',
							type: ChannelType.GuildText,
							reason: 'Antinuke Setup',
							permissionOverwrites: [
								{
									id: i.guild.id,
									deny: ['ViewChannel'],
								},
								{
									id: this.client.user.id,
									allow: ['ViewChannel', 'SendMessages', 'EmbedLinks', 'AttachFiles'],
								},
							],
						});

						await this.client.database.updateAntinuke(message.guild.id, {
							logChannel: logChannel.id,
						});

						await msg
							.edit({
								embeds: [embed],
								components: [],
							})
							.catch(() => {});

						break;
					}

					case 'antinuke-skip': {
						await i.deferUpdate().catch(() => {});

						embed.setDescription(
							`**The Antinuke Setup Has Been Completed!**\n\n**Note:** You skipped some step(s) in the setup. You can set them later with my sub group commands`
						);

						await msg.edit({
							embeds: [embed],
							components: [],
						});
						break;
					}

					case 'antinuke-disable': {
						await i.deferUpdate().catch(() => {});

						await this.client.database.deleteAntinuke(message.guild.id);

						embed.setDescription(`Anti Nuke has been disabled`);

						await msg.edit({
							embeds: [embed],
							components: [],
						});
						break;
					}
				}

				if (i.customId.startsWith('antinuke-punishment')) {
					await i.deferUpdate().catch(() => {});

					const punishment = i.customId.split('-')[2];

					await this.client.database.updateAntinuke(message.guild.id, {
						punishment,
					});

					embed.setDescription(`Punishment has been set to **${punishment}**`);

					const compos = msg.components[0].components;
					const index = compos.findIndex(
						(c) => c.customId === 'antinuke-punishment-' + punishment.toLowerCase()
					);

					compos.forEach((c) => (c.data.disabled = true));

					compos.splice(
						index,
						1,
						new ButtonBuilder()
							.setCustomId('antinuke-punishment-' + punishment.toLowerCase())
							.setLabel(this.client.helpers.capitalise(punishment))
							.setStyle(ButtonStyle.Success)
							.setDisabled(true)
					);

					await msg.edit({
						embeds: [embed],
						components: [
							new ActionRowBuilder().addComponents(...compos),
							new ActionRowBuilder().addComponents(
								new ButtonBuilder()
									.setCustomId('antinuke-whitelist-users')
									.setLabel('Whitelist Users')
									.setStyle(ButtonStyle.Success)
									.setEmoji({
										id: '1107189230070939718',
									}),
								new ButtonBuilder()
									.setCustomId('antinuke-skip')
									.setLabel('Skip')
									.setStyle(ButtonStyle.Primary)
									.setEmoji({
										id: '1108729529062658068',
									})
							),
						],
					});

					return;
				}
			});
		} else if (toggle === 'disable') {
			if (data) await this.client.database.deleteAntinuke(message.guild.id);

			await message.util.send({
				embeds: [
					this.client.util
						.embed()
						.setColor(this.client.config.colors.primary)
						.setTimestamp()
						.setAuthor({
							name: message.author.tag,
							iconURL: message.author.displayAvatarURL(),
						})
						.setDescription(`Anti Nuke has been disabled`)
						.setFooter({
							text: message.guild.name,
							iconURL: message.guild.iconURL(),
						}),
				],
			});
		} else {
		}
	}
};
