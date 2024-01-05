const { Listener } = require('@pheonix/framework');
const { Interaction } = require('discord.js');

module.exports = class InteractionListener extends Listener {
	constructor() {
		super('interactionCreate', {
			emitter: 'client',
			event: 'interactionCreate',
		});
	}

	/**
	 *
	 * @param {Interaction} interaction
	 */
	async exec(interaction) {
		if (interaction.isCommand()) return;
		if (interaction.isContextMenuCommand()) return;

		let id;

		if (interaction.isButton()) id = interaction.customId;
		if (interaction.isStringSelectMenu() && interaction.customId === 'help_select') id = interaction.values[0];

		const commands = this.client.commandHandler.modules.filter((cmd) => cmd.categoryID === id);

		if (!commands.size) return;

		const emojis = {
			Giveaways: '1108738071349956638',
			Security: '1107189242196656168',
			Utility: '1108738129143275673',
			Moderation: '1108729507113873478',
		};

		const embed = this.client.util
			.embed()
			.setColor(this.client.config.colors.primary)
			.setAuthor({
				name: `${id}`,
				iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
			})
			.setDescription(commands.map((cmd) => `\`${cmd.id}\` - ${cmd.description.content}`).join('\n'))
			.setFooter({
				text: `Requested by ${interaction.user.tag}`,
				iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
			})
			.setThumbnail(`https://cdn.discordapp.com/emojis/${emojis[id]}.png`);

		await interaction.update({ embeds: [embed] });
	}
};
