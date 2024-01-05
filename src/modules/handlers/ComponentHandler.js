const { Handler, HandlerOptions } = require('@pheonix/framework');
const BaseClient = require('@core/BaseClient');
const Component = require('../extensions/Component');

module.exports = class ComponentHandler extends Handler {
	/**
	 *
	 * @param {BaseClient} client
	 * @param {HandlerOptions} options
	 */
	constructor(
		client,
		options = {
			directory: null,
			classToHandle: Component,
			extensions: ['.js'],
			automateCategories: true,
			loadFilter: (filepath) => filepath.endsWith('.js') && !filepath.endsWith('.test.js'),
		}
	) {
		super(client, {
			directory: options.directory,
			classToHandle: Component,
			extensions: options.extensions,
			automateCategories: options.automateCategories,
			loadFilter: options.loadFilter,
		});

		this.init();
	}

	async init() {
		this.client.on('interactionCreate', async (interaction) => {
			if (interaction.isCommand()) return;
			if (!interaction.isButton() && !interaction.isAnySelectMenu() && !interaction.isMessageComponent())
				return;

			const component = this.modules.get(interaction.customId);
			if (!component) return;

			if (component.disableAfterUse) {
				await interaction.deferUpdate();
			}

			try {
				await component.exec(interaction);
			} catch (error) {
				this.client.logger.error(error);
			}

			if (component.disableAfterUse) {
				await interaction.message.delete();
			}
		});
	}
};
