const { Module, ModuleOptions, Error } = require('@pheonix/framework');
const { ButtonInteraction, ModalSubmitInteraction } = require('discord.js');

module.exports = class Component extends Module {
	/**
	 *
	 * @param {string} id
	 * @param {ModuleOptions} options
	 */
	constructor(
		id,
		options = {
			enabled: true,
			disableAfterUse: false,
		}
	) {
		super(id, {});

		this.enabled = options.enabled;
		this.disableAfterUse = options.disableAfterUse;
	}

	/**
	 * @param {ButtonInteraction | import('discord.js').AnySelectMenuInteraction | ModalSubmitInteraction} interaction
	 */
	async exec(interaction) {
		throw new Error('NOT_IMPLEMENTED', this.constructor.name, 'exec');
	}
};
