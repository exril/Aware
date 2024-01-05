const { Command } = require('@pheonix/framework');
const { GuildMFALevel } = require('discord.js');
const { GuildDefaultMessageNotifications } = require('discord.js');
const { Message, ActionRowBuilder, StringSelectMenuBuilder, ChannelType } = require('discord.js');

module.exports = class ServerInfo extends Command {
	constructor() {
		super('serverinfo', {
			aliases: ['serverinfo', 'si'],
			category: 'Utility',
			description: {
				content: 'Shows Server Information',
				usage: '.serverinfo',
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
		const fields = ['members', 'channels', 'boosts', 'features', 'moderation'];

		const emojis = {
			members: '<:icons_people:1107204583895355402>',
			channels: '<:icons_channel:1107189211926376460>',
			boosts: '<:icons_colorboostnitro:1107189195279175750>',
			features: '<:icons_star:1107189230070939718> ',
			moderation: '<:icons_stagemoderator:1107189242196656168>',
		};

		const options = [];

		for (const field of fields)
			options.push({
				label: this.client.helpers.capitalise(field),
				value: field,
				emoji: {
					id: emojis[field].split(':')[2].replace('>', ''),
					name: '_',
				},
			});

		const menu = new ActionRowBuilder().addComponents([
			new StringSelectMenuBuilder()
				.setCustomId('serverinfo')
				.setPlaceholder('Server Info Panel')
				.addOptions(options)
				.setMaxValues(1)
				.setMinValues(1),
		]);

		const msg = await message.util.send({
			embeds: [
				this.client.util
					.embed()
					.setTitle('Server Information')
					.setAuthor({
						name: this.client.user.username,
						iconURL: this.client.user.displayAvatarURL(),
					})
					.setThumbnail(message.guild.iconURL())
					.setDescription(message.guild.description ?? 'No Description')
					.addFields(
						{
							name: 'ID',
							value: message.guild.id,
						},
						{
							name: 'Created At',
							value: `<t:${Math.floor(message.guild.createdTimestamp / 1000)}:f> | <t:${Math.floor(
								message.guild.createdTimestamp / 1000
							)}:R>`,
						},
						{
							name: 'Owner',
							value: `${(await message.guild.fetchOwner()).toString()}`,
						}
					)
					.setTimestamp()
					.setColor(this.client.config.colors.primary),
			],
			components: [menu],
		});

		const collector = msg.createMessageComponentCollector({
			filter: (i) => i.user.id === message.author.id,
			time: 60000,
		});

		collector.on('collect', async (i) => {
			switch (i.values[0]) {
				case 'members':
					const members = await message.guild.members.fetch();
					await i.update({
						embeds: [
							this.client.util
								.embed()
								.setAuthor({
									name: i.guild.name,
									iconURL: i.guild.iconURL(),
								})
								.setThumbnail(i.guild.iconURL())
								.setColor(this.client.config.colors.primary)
								.addFields({
									name: 'Members',
									value: `Total Members: ${members.size}\nHumans: ${
										members.filter((m) => !m.user.bot).size
									}\nBots: ${members.filter((m) => m.user.bot).size}`,
								}),
						],
					});
					break;
				case 'channels':
					const channels = await message.guild.channels.fetch();
					await i.update({
						embeds: [
							this.client.util
								.embed()
								.setAuthor({
									name: i.guild.name,
									iconURL: i.guild.iconURL(),
								})
								.setThumbnail(i.guild.iconURL())
								.setTimestamp()
								.setColor(this.client.config.colors.primary)
								.addFields(
									{
										name: 'Text Channels',
										value: `Total Channels: ${channels.size}\nText Channels: ${
											channels.filter((x) => x.type === ChannelType.GuildText).size
										}\nVoice Channels: ${
											channels.filter((x) => x.type === ChannelType.GuildVoice).size
										}\nCategories: ${
											channels.filter((x) => x.type === ChannelType.GuildCategory).size
										}`,
									},
									{
										name: 'AFK Channel',
										value: `${
											i.guild.afkChannelID
												? `${i.guild.afkChannel.toString()}`
												: 'None'
										}`,
									},
									{
										name: 'Hidden Channels',
										value: `Total Channels: ${
											channels.filter(
												(x) =>
													!x
														.permissionsFor(i.guild.roles.everyone.id)
														.has('ViewChannel')
											).size
										}\nText Channels: ${
											channels.filter(
												(x) =>
													x.type === ChannelType.GuildText &&
													!x
														.permissionsFor(i.guild.roles.everyone.id)
														.has('ViewChannel')
											).size
										}\nVoice Channels: ${
											channels.filter(
												(x) =>
													x.type === ChannelType.GuildVoice &&
													!x
														.permissionsFor(i.guild.roles.everyone.id)
														.has('ViewChannel')
											).size
										}\nCategories: ${
											channels.filter(
												(x) =>
													x.type === ChannelType.GuildCategory &&
													!x
														.permissionsFor(i.guild.roles.everyone.id)
														.has('ViewChannel')
											).size
										}`,
									}
								),
						],
					});
					break;
				case 'boosts':
					const memsWithP = await message.guild.members.fetch();
					await i.update({
						embeds: [
							this.client.util
								.embed()
								.setAuthor({
									name: i.guild.name,
									iconURL: i.guild.iconURL(),
								})
								.setThumbnail(i.guild.iconURL())
								.setTimestamp()
								.setColor(15418782)
								.addFields(
									{
										name: 'Boosts',
										value: `${i.guild.premiumSubscriptionCount} Boosts`,
									},
									{
										name: 'Level',
										value: `Level ${i.guild.premiumTier}`,
									},
									{
										name: 'Boosters',
										value: `${
											i.guild.premiumSubscriptionCount !== 0
												? memsWithP
														.filter((m) => m.premiumSince)
														.map((m) => m.toString())
														.join(', ').length > 1024
													? 'Too many boosters to display'
													: memsWithP
															.filter((m) => m.premiumSince)
															.map((m) => m.toString())
															.join(', ')
												: 'None'
										}`,
									},
									{
										name: 'Latest Boosters',
										value: `${
											i.guild.premiumSubscriptionCount !== 0
												? memsWithP
														.filter((m) => m.premiumSince)
														.sort((a, b) => b.premiumSince - a.premiumSince)
														.map((m) => m.toString())
														.slice(0, 5)
														.join(', ').length > 1024
													? 'Too many boosters to display'
													: memsWithP
															.filter((m) => m.premiumSince)
															.sort(
																(a, b) =>
																	b.premiumSince - a.premiumSince
															)
															.map((m) => m.toString())
															.slice(0, 5)
															.join(', ')
												: 'None'
										}`,
									}
								),
						],
					});
					break;
				case 'features':
					await i.update({
						embeds: [
							this.client.util
								.embed()
								.setAuthor({
									name: i.guild.name,
									iconURL: i.guild.iconURL(),
								})
								.setThumbnail(i.guild.iconURL())
								.setTimestamp()
								.setTitle('Server Information')
								.setColor(this.client.config.colors.primary)
								.addFields(
									{
										name: 'ID',
										value: i.guild.id,
									},
									{
										name: 'Created At',
										value: `<t:${Math.floor(
											i.guild.createdTimestamp / 1000
										)}:f> | <t:${Math.floor(i.guild.createdTimestamp / 1000)}:R>`,
									},
									{
										name: 'Owner',
										value: `${(await i.guild.fetchOwner()).toString()}`,
									},
									{
										name: 'Features',
										value: `${
											i.guild.features.length !== 0
												? `${i.guild.features
														.map(
															(x) =>
																`<:icons_Correct:1106127305308393492> ${this.client.helpers.formatFeature(
																	x
																)}`
														)
														.join('\n')}...`
												: '...'
										}`,
									}
								),
						],
					});
					break;
				case 'moderation':
					const levels = {
						0: 'None',
						1: 'Must Have Verified Email On Account',
						2: 'Must Be Registered On Discord For Longer Than 5 Minutes',
						3: 'Must Be A Member Of This Guild For Longer Than 10 Minutes',
						4: 'Must Have A Verified Phone Number',
					};

					const filters = {
						0: 'Disabled',
						1: 'Members Without Roles',
						2: 'All Members',
					};

					await i.update({
						embeds: [
							this.client.util
								.embed()
								.setAuthor({
									name: i.guild.name,
									iconURL: i.guild.iconURL(),
								})
								.setThumbnail(i.guild.iconURL())
								.setTimestamp()
								.addFields(
									{
										name: `Verification Level: ${i.guild.verificationLevel}`,
										value: `${levels[i.guild.verificationLevel]}`,
									},
									{
										name: `Explicit Content Filter`,
										value: `${filters[i.guild.explicitContentFilter]}`,
									},
									{
										name: `Default Notifications`,
										value: `${
											i.guild.defaultMessageNotifications ===
											GuildDefaultMessageNotifications.AllMessages
												? 'All Messages'
												: 'Only @mentions'
										}`,
									},
									{
										name: 'Moderators Require 2FA?',
										value: `${i.guild.mfaLevel === GuildMFALevel.None ? 'No' : 'Yes'}`,
									}
								)
								.setColor(this.client.config.colors.primary),
						],
					});
					break;
			}
		});

		collector.on('end', () => {
			return;
		});
	}
};
