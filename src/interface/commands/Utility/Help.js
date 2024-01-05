const { Command, Argument, Message } = require('@pheonix/framework');
const {
	Message,
	ApplicationCommandOptionType,
	AutocompleteInteraction,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	StringSelectMenuBuilder,
} = require('discord.js');

module.exports = class Help extends Command {
	constructor() {
		super('help', {
			aliases: ['help', 'h'],
			category: 'Utility',
			description: {
				content: 'The Help command',
				usage: '.help',
				examples: [''],
			},
			slash: true,
			cooldown: 5000,
			args: [
				{
					id: 'command',
					type: Argument.union('command', 'string'),
					match: 'rest',
					default: null,
				},
			],
			slashOptions: [
				{
					name: 'command',
					type: ApplicationCommandOptionType.String,
					description: 'The command you want to see help for',
					required: false,
					autocomplete: true,
				},
			],
		});
	}

	/**
	 *
	 * @param {Message} message
	 * @param {{ command: Command }} args
	 */
	async exec(message, args) {
		if (!args.command) {
			await this.help(message);
			return;
		}

		const command = args.command;

		if (!command) {
			await message.util.reply({
				content: 'Could not find that command!',
			});

			return;
		}

		const embed = this.client.util.embed();

		embed.setAuthor({
			name: `${command.category}`,
			iconURL: this.client.user.displayAvatarURL(),
		});

		embed.setDescription(`> ${command.description.content}`);

		embed.addFields(
			{
				name: 'Aliases',
				value: `${command.aliases.map((x) => `${x}`).join(', ')}`,
			},
			{
				name: 'Usage',
				value: `${command.description.usage}`,
			}
		);

		embed.setColor(this.client.config.colors.primary);

		await message.util.reply({
			embeds: [embed],
		});
	}

	/**
	 *
	 * @param {AutocompleteInteraction} interaction
	 */
	async autocomplete(interaction) {
		const option = interaction.options.get('command');

		let commands = this.handler.modules.filter((x) => x.id.startsWith(option.value.toLowerCase()));

		if (!commands.size) return;

		commands = commands.map((x) => x);

		await interaction.respond(
			commands.slice(0, 5).map((x) => ({
				name: x.id,
				value: x.description.content,
			}))
		);

		return;
	}

	/**
	 *
	 * @param {Message} message
	 */
	async help(message) {
		const embed = this.client.util.embed();

		embed.setAuthor({
			name: `${this.client.user.username} HelpDesk`,
			iconURL: this.client.user.displayAvatarURL(),
		});

		embed.setDescription(
			`\`.help [command/category]\` - View specific command/category.\nClick on the dropdown for more information.\n\`\`\`ml\n[] - Required Argument | () - Optional Argument\`\`\``
		);

		const mainFields = [
			{
				name: 'Categories:',
				value: `> <:giveaway:1108738071349956638> [**Giveaways**](https://awarebot.online/soon)\n> <:icons_stagemoderator:1107189242196656168> [**Security**](https://awarebot.online/soon)`,
				inline: true,
			},
			{
				name: '** **',
				value: `> <:icons_settings:1108738129143275673> [**Utility**](https://awarebot.online/soon)\n> <:astroz_mod:1108729507113873478> [**Moderation**](https://awarebot.online/soon)`,
				inline: true,
			},
			{
				name: '<:_:1108729043110613032> Links:',
				value: `> [**Purchase Premium**](https://awarebot.online/soon) **|** [**Support Server**](${this.client.config.links.support}) **|** [**Invite Me**](${this.client.config.links.invite}) **|** [**Website**](${this.client.config.links.website})\n> [**Documentation**](https://awarebot.online/soon) **|** [**Privacy Policy**](https://awarebot.online/soon) **|** [**Vote Me**](https://awarebot.online/soon)`,
				inline: false,
			},
		];

		embed.addFields(...mainFields);

		embed.setColor(this.client.config.colors.primary);

		const compos = [
			new ButtonBuilder()
				.setCustomId('home')
				.setLabel('Home')
				.setDisabled(true)
				.setStyle(ButtonStyle.Secondary)
				.setEmoji({
					name: '_',
					id: '1108732151513493614',
				}),
			new ButtonBuilder()
				.setCustomId('commands_list')
				.setLabel('Commands List')
				.setStyle(ButtonStyle.Secondary)
				.setEmoji({
					name: '_',
					id: '1108732777442062346',
				}),
			new ButtonBuilder()
				.setCustomId('buttons_menu')
				.setLabel('Buttons Menu')
				.setStyle(ButtonStyle.Secondary)
				.setEmoji({
					name: '_',
					id: '1108733413566984232',
				}),
		];

		const firstRow = new ActionRowBuilder().addComponents(compos);

		const emojis = {
			Giveaways: '1108738071349956638',
			Security: '1107189242196656168',
			Utility: '1108738129143275673',
			Moderation: '1108729507113873478',
		};

		const options = [];

		for (const category of this.handler.categories.values()) {
			if (category.id === "Owner") continue;
			options.push({
				label: category.id,
				value: category.id,
				emoji: {
					name: '_',
					id: emojis[this.client.helpers.capitalise(category.id)],
				},
			});
		}

		const secondRow = new ActionRowBuilder().addComponents(
			new StringSelectMenuBuilder()
				.setCustomId('help_select')
				.setPlaceholder('Choose a Category')
				.setMinValues(1)
				.setMaxValues(1)
				.addOptions(options)
		);

		const msg = await message.util.reply({
			embeds: [embed],
			components: [firstRow, secondRow],
		});

		const filter = (i) => i.user.id === message.author.id;

		const collector = msg.createMessageComponentCollector({ filter, time: 30000 });

		collector.on('collect', async (i) => {
			switch (i.customId) {
				case 'commands_list': {
					const fields = [];

					for (const category of this.handler.categories.values()) {
						if (category.id === "Owner") continue;
						fields.push({
							name: category.id,
							value: category
								.filter((cmd) => cmd.aliases.length > 0)
								.map((cmd) => `\`${cmd.aliases[0]}\``)
								.join(', '),
							inline: false,
						});
					}

					embed.setFields(fields);

					await i.update({
						embeds: [embed],
						components: [
							new ActionRowBuilder().addComponents(
								compos[0].setDisabled(false),
								compos[1].setDisabled(true),
								compos[2].setDisabled(false)
							),
						],
					});
					break;
				}

				case 'buttons_menu': {
					const pompos = [];

					for (const category of this.handler.categories.values()) {
						if (category.id === "Owner") continue;
						pompos.push(
							new ButtonBuilder()
								.setCustomId(category.id)
								.setStyle(ButtonStyle.Secondary)
								.setEmoji({
									name: '_',
									id: emojis[this.client.helpers.capitalise(category.id)],
								})
						);
					}

					await i.update({
						embeds: [embed.setFields(...mainFields)],
						components: [
							new ActionRowBuilder().addComponents(
								compos[0].setDisabled(false),
								compos[1].setDisabled(false),
								compos[2].setDisabled(true)
							),
							new ActionRowBuilder().addComponents(...pompos),
						],
					});
					break;
				}

				case 'home': {
					await i.update({
						embeds: [embed.setFields(...mainFields)],
						components: [firstRow, secondRow],
					});
					break;
				}
			}
		});

		collector.on('end', async (collected) => {
			if (collected.size === 0) {
				await msg.edit({
					embeds: [
						embed.setFooter({
							text: 'The help menu expired.',
						}),
					],
					components: [firstRow, secondRow],
				});
			}
		});
	}
};
