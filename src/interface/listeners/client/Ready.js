const { Listener } = require('@pheonix/framework');

module.exports = class ReadyListener extends Listener {
	constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready',
		});
	}

	async exec() {
		this.client.logger.info(`Logged in as ${this.client.user.tag}!`);
	}
};
