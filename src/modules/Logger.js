const { Signale, SignaleConfig } = require('signale');
const BaseClient = require('@core/BaseClient');

class Logger extends Signale {
	/**
	 *
	 * @param {SignaleConfig} config
	 * @param {BaseClient} client
	 */
	constructor(
		client,
		config = {
			displayTimestamp: true,
			displayDate: true,
			displayFilename: true,
			displayLabel: true,
			displayScope: true,
			displayBadge: true,
			displayLoggerName: true,
			underlineLabel: true,
			underlineMessage: false,
			underlinePrefix: false,
			underlineSuffix: false,
			underlineTimestamp: false,
			underlineFilename: false,
			underlineLoggerName: false,
			underlineScope: false,
			underlineBadge: false,
		}
	) {
		super({
			config: config,
			types: {
				info: {
					badge: 'ℹ',
					color: 'blue',
					label: 'info',
				},
				warn: {
					badge: '⚠',
					color: 'yellow',
					label: 'warn',
				},
				error: {
					badge: '✖',
					color: 'red',
					label: 'error',
				},
				debug: {
					badge: '🐛',
					color: 'magenta',
					label: 'debug',
				},
				cmd: {
					badge: '⌨️',
					color: 'green',
					label: 'cmd',
				},
				event: {
					badge: '🎫',
					color: 'cyan',
					label: 'event',
				},
				ready: {
					badge: '✔️',
					color: 'green',
					label: 'ready',
				},
				database: {
					badge: '🗄️',
					color: 'magenta',
					label: 'database',
				},
			},
			scope: client ? `Shard ${('00' + client.shard?.ids[0]).slice(-2)}` : 'Manager',
		});
	}
}

module.exports = Logger;
