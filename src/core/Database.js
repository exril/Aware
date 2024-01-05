const { PrismaClient } = require('@prisma/client');
const BaseClient = require('@core/BaseClient');

class Database extends PrismaClient {
	/**
	 *
	 * @param {BaseClient} client
	 */
	constructor(client) {
		super({
			datasources: {
				db: {
					url: process.env.POSTGRES_URL,
				},
			},
			log: [
				{
					emit: 'event',
					level: 'query',
				},
				{
					emit: 'event',
					level: 'info',
				},
				{
					emit: 'event',
					level: 'warn',
				},
				{
					emit: 'event',
					level: 'error',
				},
			],
			errorFormat: 'minimal',
		});

		this.client = client;
		//this._init();

		this.ping = 0;

		this.calculateStats();
	}

	/**
	 * @private
	 */
	_init() {
		this.$on('query', (e) => this.client.logger.debug(e));
		this.$on('info', (e) => this.client.logger.info(e));
		this.$on('warn', (e) => this.client.logger.warn(e));
		this.$on('error', (e) => this.client.logger.error(e));
	}

	async calculateStats() {
		const currentNano = process.hrtime();
		await this.$queryRaw`SELECT 1;`;
		const time = process.hrtime(currentNano);
		const calc = (time[0] * 1e9 + time[1]) * 1e-6;
		this.ping = calc.toFixed(0);
	}

	async getUser(id) {
		const user = await this.users.findUnique({
			where: {
				id: id,
			},
		});

		return user;
	}

	async getAfk(id) {
		const afk = await this.afks
			.findUnique({
				where: {
					userId: id,
				},
			})
			.catch(() => {});

		return afk;
	}

	async deleteAfk(id) {
		const afk = await this.afks
			.delete({
				where: {
					userId: id,
				},
			})
			.catch(() => {});

		return afk;
	}

	async setAfk(id, reason) {
		const afk = await this.afks
			.upsert({
				where: {
					userId: id,
				},
				update: {
					reason: reason,
				},
				create: {
					userId: id,
					reason: reason,
					timestamp: Date.now(),
				},
			})
			.catch(() => {});

		return afk;
	}

	async createSettings(guildId) {
		const guild = await this.getGuild(guildId);

		if (!guild) {
			await this.createGuild(guildId);
		}

		const settings = await this.guildSettings.create({
			data: {
				id: guildId,
			},
		});

		return settings;
	}

	async getSettings(guildId) {
		const settings = await this.guildSettings.findUnique({
			where: {
				id: guildId,
			},
		});

		if (!settings) {
			return await this.createSettings(guildId);
		}

		return settings;
	}

	async updateSettings(guildId, data) {
		const dataa = await this.getSettings(guildId);

		if (!dataa) {
			await this.createSettings(guildId);
		}

		const settings = await this.guildSettings.update({
			where: {
				id: guildId,
			},
			data: data,
		});

		return settings;
	}

	async setRole(guildId, roleId, type) {
		const data = await this.getSettings(guildId);

		if (!data) {
			await this.createSettings(guildId);
		}

		const settings = await this.updateSettings(guildId, {
			roles: {
				[type]: roleId,
			},
		});

		return settings;
	}

	async getRole(guildId, type) {
		const data = await this.getSettings(guildId);

		if (!data) {
			await this.createSettings(guildId);
		}

		const settings = await this.getSettings(guildId);

		return settings?.roles[type];
	}

	async getPrefix(guildId) {
		const data = await this.getSettings(guildId);

		if (!data) {
			await this.createSettings(guildId);
		}

		const settings = await this.getSettings(guildId);

		return settings.prefix;
	}

	async setPrefix(guildId, prefix) {
		const data = await this.getSettings(guildId);

		if (!data) {
			await this.createSettings(guildId);
		}

		const settings = await this.updateSettings(guildId, {
			prefix: prefix,
		});

		return settings;
	}

	/**
	 *
	 * @param {string} guildId
	 * @param {{ userId: string; nickname: string }} data
	 * @returns
	 */
	async setNickname(guildId, data) {
		const settings = await this.updateSettings(guildId, {
			stickyNicknames: {
				[data.userId]: data.nickname,
			},
		});

		return settings;
	}

	async getNickname(guildId, userId) {
		const settings = await this.getSettings(guildId);

		try {
			const value = Object.values(settings.stickyNicknames.filter((x) => x[userId])[0])[0];

			return value;
		} catch (e) {
			return null;
		}
	}

	async deleteNickname(guildId, userId) {
		const settings = await this.updateSettings(guildId, {
			stickyNicknames: {
				[userId]: null,
			},
		});

		return settings;
	}

	async createGuild(guildId) {
		const settings = await this.guilds.create({
			data: {
				id: guildId,
			},
		});

		return settings;
	}

	async getGuild(guildId) {
		const settings = await this.guilds.findUnique({
			where: {
				id: guildId,
			},
		});

		return settings;
	}

	async updateGuild(guildId, data) {
		const settings = await this.guilds.update({
			where: {
				id: guildId,
			},
			data: data,
		});

		return settings;
	}

	async deleteGuild(guildId) {
		const settings = await this.guilds.delete({
			where: {
				id: guildId,
			},
		});

		return settings;
	}

	async createGiveaway(guildId, data) {
		const guild = await this.getGuild(guildId);

		if (!guild) {
			await this.createGuild(guildId);
		}

		const giveaway = await this.giveaways.create({
			data: {
				guildId: guildId,
				channelId: data.channelId,
				messageId: data.messageId,
				prize: data.prize,
				endAt: data.endAt,
				winners: data.winners,
				active: true,
				attachment: data.attachment ?? null,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		});

		return giveaway;
	}

	async getGiveaway(guildId, messageId) {
		const giveaway = await this.giveaways.findUnique({
			where: {
				guildId_messageId: {
					guildId: guildId,
					messageId: messageId,
				},
			},
		});

		return giveaway;
	}

	async getGiveaways(guildId) {
		const giveaways = await this.giveaways.findMany({
			where: {
				guildId: guildId,
			},
		});

		return giveaways;
	}

	async updateGiveaway(guildId, messageId, data) {
		const giveaway = await this.giveaways.update({
			where: {
				guildId_messageId: {
					guildId: guildId,
					messageId: messageId,
				},
			},
			data: data,
		});

		return giveaway;
	}

	async deleteGiveaway(guildId, messageId) {
		const giveaway = await this.giveaways.delete({
			where: {
				guildId_messageId: {
					guildId: guildId,
					messageId: messageId,
				},
			},
		});

		return giveaway;
	}

	async createAntinuke(guildId, data) {
		const guild = await this.getGuild(guildId);

		if (!guild) {
			await this.createGuild(guildId);
		}

		const antinuke = await this.antinuke
			.create({
				data: {
					guildId: guildId,
					events: data?.events ?? [],
					whitelist: data?.whitelist ?? [],
					punishment: 'ban',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			})
			.catch(() => {});

		return antinuke;
	}

	async getAntinuke(guildId) {
		const antinuke = await this.antinuke.findUnique({
			where: {
				guildId: guildId,
			},
		});

		return antinuke;
	}

	async updateAntinuke(guildId, data) {
		const prev = await this.getAntinuke(guildId);

		const antinuke = await this.antinuke.update({
			where: {
				guildId: guildId,
			},
			data: {
				events: data?.events?.length ? [...data.events, ...prev.events] : prev.events,
				whitelist: data?.whitelist?.length ? [...data.whitelist, ...prev.whitelist] : prev.whitelist,
				punishment: data.punishment ?? prev.punishment,
				updatedAt: new Date(),
			},
		});

		return antinuke;
	}

	async deleteAntinuke(guildId) {
		const antinuke = await this.antinuke.delete({
			where: {
				guildId: guildId,
			},
		});

		return antinuke;
	}

	async addWhitelist(guildId, userId) {
		const antinuke = await this.getAntinuke(guildId);

		if (!antinuke) {
			await this.createAntinuke(guildId, {
				whitelist: [userId],
			});
		}

		const whitelist = await this.antinuke.update({
			where: {
				guildId: guildId,
			},
			data: {
				whitelist: {
					push: userId,
				}
			},
		});

		return whitelist;
	}

	async removeWhitelist(guildId, userId) {
		const antinuke = await this.getAntinuke(guildId);

		if (!antinuke) {
			await this.createAntinuke(guildId, {
				whitelist: [userId],
			});
		}

		const whitelist = await this.antinuke.update({
			where: {
				guildId: guildId,
			},
			data: {
				whitelist: {
					set: antinuke.whitelist.filter((id) => id !== userId),
				}
			},
		});

		return whitelist;
	}

	async getWhitelist(guildId, userId) {
		const antinuke = await this.getAntinuke(guildId);

		if (!antinuke) {
			await this.createAntinuke(guildId, {
				whitelist: [userId],
			});
		}

		return antinuke?.whitelist?.includes(userId) ?? false;
	}

	async blacklistUser(userId) {
		const user = await this.users.findUnique({
			where: {
				id: userId,
			},
		});

		if (!user) {
			await this.users.create({
				data: {
					id: userId,
					blacklisted: true,
				},
			});
		} else {
			await this.users.update({
				where: {
					id: userId,
				},
				data: {
					blacklisted: true,
				},
			});
		}

		return user;
	}

	async unblacklistUser(userId) {
		const user = await this.users.findUnique({
			where: {
				id: userId,
			},
		});

		if (!user) {
			await this.users.create({
				data: {
					id: userId,
					blacklisted: false,
				},
			});
		} else {
			await this.users.update({
				where: {
					id: userId,
				},
				data: {
					blacklisted: false,
				},
			});
		}

		return user;
	}

	async getBlacklistedUsers() {
		const users = await this.users.findMany({
			where: {
				blacklisted: true,
			},
		});

		return users;
	}

	async blacklistGuild(guildId) {
		const guild = await this.guilds.findUnique({
			where: {
				id: guildId,
			},
		});

		if (!guild) {
			await this.guilds.create({
				data: {
					id: guildId,
					blacklisted: true,
				},
			});
		} else {
			await this.guilds.update({
				where: {
					id: guildId,
				},
				data: {
					blacklisted: true,
				},
			});
		}

		return guild;
	}

	async unblacklistGuild(guildId) {
		const guild = await this.guilds.findUnique({
			where: {
				id: guildId,
			},
		});

		if (!guild) {
			await this.guilds.create({
				data: {
					id: guildId,
					blacklisted: false,
				},
			});
		} else {
			await this.guilds.update({
				where: {
					id: guildId,
				},
				data: {
					blacklisted: false,
				},
			});
		}

		return guild;
	}

	async getBlacklistedGuilds() {
		const guilds = await this.guilds.findMany({
			where: {
				blacklisted: true,
			},
		});

		return guilds;
	}

	async isUserBlacklisted(userId) {
		const user = await this.users.findUnique({
			where: {
				id: userId,
			},
		});

		return user?.blacklisted ?? false;
	}

	async isGuildBlacklisted(guildId) {
		const guild = await this.guilds.findUnique({
			where: {
				id: guildId,
			},
		});

		return guild?.blacklisted ?? false;
	}

	async addNoprefix(userId) {
		const user = await this.users.findUnique({
			where: {
				id: userId,
			},
		});

		if (!user) {
			await this.users.create({
				data: {
					id: userId,
					noPrefix: true,
				},
			});
		} else {
			await this.users.update({
				where: {
					id: userId,
				},
				data: {
					noPrefix: true,
				},
			});
		}

		return user;
	}

	async removeNoprefix(userId) {
		const user = await this.users.findUnique({
			where: {
				id: userId,
			},
		});

		if (!user) {
			await this.users.create({
				data: {
					id: userId,
					noPrefix: false,
				},
			});
		} else {
			await this.users.update({
				where: {
					id: userId,
				},
				data: {
					noPrefix: false,
				},
			});
		}

		return user;
	}

	async getNoPrefixUsers() {
		const users = await this.users.findMany({
			where: {
				noPrefix: true,
			},
		});

		return users;
	}

	async hasNoprefix(userId) {
		const user = await this.users.findUnique({
			where: {
				id: userId,
			},
		});

		return user?.noPrefix ?? false;
	}
}

module.exports = Database;
