const { Partials, LimitedCollection, OAuth2Scopes } = require('discord.js');
const Logger = require('@modules/Logger');
const Helpers = require('../utils/Helpers');
const { Collection } = require('@modules/Collection');
const Database = require('@core/Database');
const Redis = require('@core/Redis');
const { ListenerHandler, CommandHandler, InhibitorHandler, Client } = require('@pheonix/framework');
const Dokdo = require('dokdo');
const Giveaways = require('../modules/Giveaways');

class BaseClient extends Client {
	/**
	 *
	 * @param {import('discord.js').ClientOptions} options
	 */
	constructor(options) {
		options.makeCache = (manager) => {
			switch (manager.name) {
				// Disable Cache
				case 'GuildEmojiManager':
				case 'GuildBanManager':
				case 'GuildInviteManager':
				case 'GuildStickerManager':
				case 'StageInstanceManager':
				case 'PresenceManager':
				case 'ThreadManager':
					return new LimitedCollection({ maxSize: 0 });
				/*case 'MessageManager':
					return new LimitedCollection({ maxSize: 1 });
					*/
				default:
					return new Collection();
			}
		};

		super({
			closeTimeout: 2000,
			allowedMentions: {
				parse: [],
				repliedUser: false,
			},
			partials: [Partials.Reaction, Partials.GuildMember, Partials.Message, Partials.User, Partials.Channel],
			failIfNotExists: false,
			waitGuildTimeout: 10000,
			ws: {
				large_threshold: 100,
			},
			ownerID: ['847770840266833961', '602900188549611543'],
			superUserID: ['847770840266833961', '602900188549611543'],
			...options,
		});

		// Configurations

		this.config = require('@config/production.json');
		this.location = process.cwd();

		// Managers

		/**
		 * @type {Dokdo.default}
		 */
		this.dokdo = new Dokdo(this, {
			aliases: ['tsx'],
			prefix: '.',
			owners: this.superUserID,
		});

		this.database = new Database(this);

		this.redis = new Redis(this);

		this.commandHandler = new CommandHandler(this, {
			directory: `${this.location}/src/interface/commands`,
			automateCategories: true,
			extensions: ['.js'],
			prefix: async (message) => {
				if (message.guild) {
					const prefix = await this.database.getPrefix(message.guild.id);

					// No prefix check
					const hasNoprefix = await this.database.hasNoprefix(message.author.id);

					if (hasNoprefix) {
						return [''].concat(prefix ? [prefix] : [this.config.prefix]);
					} else {
						return [prefix ? prefix : this.config.prefix];
					}
				}
			},
			allowMention: true,
			commandUtil: true,
			commandUtilLifetime: 3e5,
			defaultCooldown: 5000,
			autoRegisterSlashCommands: true,
			handleEdits: true,
			ignoreCooldown: this.superUserID,
			ignorePermissions: this.superUserID,
		})

		this.listenerHandler = new ListenerHandler(this, {
			directory: `${this.location}/src/interface/listeners`,
			automateCategories: true,
			extensions: ['.js'],
		});

		this.inhibitorHandler = new InhibitorHandler(this, {
			directory: `${this.location}/src/interface/inhibitors`,
			automateCategories: true,
			extensions: ['.js'],
		});

		// Cache

		this.cache = new Collection();

		// Classes

		this.logger = new Logger(this);
		this.helpers = new Helpers(this);
		this.giveaways = new Giveaways(this);
	}

	async calculateStats() {
		const currentNano = process.hrtime();
		await this.rest.get('/users/@me');
		const time = process.hrtime(currentNano);
		const calc = (time[0] * 1e9 + time[1]) * 1e-6;
		this.rest.ping = calc.toFixed(0);
	}

	async startTasks() {
		await this.calculateStats();
		const inviteUrl = this.generateInvite({
			permissions: ['Administrator'],
			scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
		});

		this.config.links.invite = inviteUrl;
	}

	async init() {
		this.logger.info('Initializing Handlers');
		this.commandHandler.loadAll();
		this.listenerHandler.loadAll();
		this.inhibitorHandler.loadAll();
		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
		this.listenerHandler.setEmitters({
			commands: this.commandHandler,
			listeners: this.listenerHandler,
			process,
		});
		this.logger.info('Initializing Discord Client');
		await this.login(process.env.TOKEN);
		this.logger.info('Connected to Discord API');
		await this.startTasks();
	}
}

module.exports = BaseClient;
