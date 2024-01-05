const { Listener } = require('@pheonix/framework');
const {
	GuildAuditLogsEntry,
	Guild,
	AuditLogEvent,
	GuildMember,
	Role,
	GuildChannel,
	Webhook,
	Colors,
} = require('discord.js');

module.exports = class AntinukeListener extends Listener {
	constructor() {
		super('guildAuditLogEntryCreate', {
			emitter: 'client',
			event: 'guildAuditLogEntryCreate',
		});
	}

	/**
	 *
	 * @param {GuildAuditLogsEntry} auditLogEntry
	 * @param {Guild} guild
	 */
	async exec(auditLogEntry, guild) {
		/**
		 * @type {{ whitelist: string[]; events: Array<{ name: string; enabled: boolean; action: AuditLogEvent; }>; punishment: 'timeout' | 'removeroles' | 'ban' | 'kick'; }}
		 */
		const data = await this.client.database.getAntinuke(guild.id);

		if (!data) return;

		if (auditLogEntry?.executorId === this.client.user.id) return;

		switch (auditLogEntry?.action) {
			case AuditLogEvent.MemberBanAdd: {
				if (!data.events.find((e) => e.action === AuditLogEvent.MemberBanAdd)?.enabled) return;

				const { executor, target } = auditLogEntry;

				if (data.whitelist.includes(executor.id)) return;

				if (target.id === executor.id) return;
				if (target.id === this.client.user.id) return;
				if (target.id === guild.ownerId) return;

				/**
				 * @type {GuildMember}
				 */
				const member = await guild.members.fetch(executor.id).catch(() => false);

				if (!member) return;

				if (member.roles.highest.position >= guild.members.me.roles.highest.position) return;

				if (data.punishment === 'ban' && member.bannable) {
					await member.ban({ reason: 'Antinuke (Anti Ban) | User Not Whitelisted!' });

					await guild.members.unban(target.id, 'Antinuke (Anti Ban) | User Recovery!');

					return;
				}

				if (data.punishment === 'kick' && member.kickable) {
					await member.kick('Antinuke (Anti Ban) | User Not Whitelisted!');

					await guild.members.unban(target.id, 'Antinuke (Anti Ban) | User Recovery!');

					return;
				}

				if (data.punishment === 'removeroles' && member.manageable) {
					await member.roles.set([]);

					await guild.members.unban(target.id, 'Antinuke (Anti Ban) | User Recovery!');

					return;
				}

				if (data.punishment === 'timeout' && member.moderatable) {
					await member.timeout(2.419e9, 'Antinuke (Anti Ban) | User Not Whitelisted!');

					await guild.members.unban(target.id, 'Antinuke (Anti Ban) | User Recovery!');

					return;
				}
				break;
			}

			case AuditLogEvent.MemberKick: {
				if (!data.events.find((e) => e.action === AuditLogEvent.MemberKick)?.enabled) return;

				const { executor, target } = auditLogEntry;

				if (data.whitelist.includes(executor.id)) return;

				if (target.id === executor.id) return;
				if (target.id === this.client.user.id) return;
				if (target.id === guild.ownerId) return;

				/**
				 * @type {GuildMember}
				 */
				const member = await guild.members.fetch(executor.id).catch(() => false);

				if (!member) return;

				if (member.roles.highest.position >= guild.members.me.roles.highest.position) return;

				if (data.punishment === 'ban' && member.bannable) {
					await member.ban({ reason: 'Antinuke (Anti Kick) | User Not Whitelisted!' });

					return;
				}

				if (data.punishment === 'kick' && member.kickable) {
					await member.kick('Antinuke (Anti Kick) | User Not Whitelisted!');

					return;
				}

				if (data.punishment === 'removeroles' && member.manageable) {
					await member.roles.set([]);

					return;
				}

				if (data.punishment === 'timeout' && member.moderatable) {
					await member.timeout(2.419e9, 'Antinuke (Anti Kick) | User Not Whitelisted!');

					return;
				}

				break;
			}

			case AuditLogEvent.RoleCreate: {
				if (!data.events.find((e) => e.action === AuditLogEvent.RoleCreate)?.enabled) return;

				const { executor, target } = auditLogEntry;

				if (data.whitelist.includes(executor.id)) return;

				if (target.id === executor.id) return;
				if (target.id === this.client.user.id) return;
				if (target.id === guild.ownerId) return;

				/**
				 * @type {GuildMember}
				 */
				const member = await guild.members.fetch(executor.id).catch(() => false);

				if (!member) return;

				if (member.roles.highest.position >= guild.members.me.roles.highest.position) return;

				/**
				 * @type {Role}
				 */
				const role = await guild.roles.fetch(target.id).catch(() => false);

				if (!role) return;

				if (role.position >= guild.members.me.roles.highest.position) return;

				if (data.punishment === 'ban' && member.bannable) {
					await member.ban({ reason: 'Antinuke (Anti Role Create) | User Not Whitelisted!' });

					if (role.editable) await role.delete('Antinuke (Anti Role Create) | Role Recovery!');

					return;
				}

				if (data.punishment === 'kick' && member.kickable) {
					await member.kick('Antinuke (Anti Role Create) | User Not Whitelisted!');

					if (role.editable) await role.delete('Antinuke (Anti Role Create) | Role Recovery!');

					return;
				}

				if (data.punishment === 'removeroles' && member.manageable) {
					await member.roles.set([]);

					if (role.editable) await role.delete('Antinuke (Anti Role Create) | Role Recovery!');

					return;
				}

				if (data.punishment === 'timeout' && member.moderatable) {
					await member.timeout(2.419e9, 'Antinuke (Anti Role Create) | User Not Whitelisted!');

					if (role.editable) await role.delete('Antinuke (Anti Role Create) | Role Recovery!');

					return;
				}

				break;
			}

			case AuditLogEvent.RoleDelete: {
				if (!data.events.find((e) => e.action === AuditLogEvent.RoleDelete)?.enabled) return;

				const { executor, target } = auditLogEntry;

				if (data.whitelist.includes(executor.id)) return;

				if (target.id === executor.id) return;
				if (target.id === this.client.user.id) return;
				if (target.id === guild.ownerId) return;

				/**
				 * @type {GuildMember}
				 */
				const member = await guild.members.fetch(executor.id).catch(() => false);

				if (!member) return;

				if (member.roles.highest.position >= guild.members.me.roles.highest.position) return;

				/**
				 * @type {Role}
				 */
				const role = target;

				if (!role) return;

				if (role.position >= guild.members.me.roles.highest.position)
					role.position = guild.members.me.roles.highest.position - 1;

				if (data.punishment === 'ban' && member.bannable) {
					await member.ban({ reason: 'Antinuke (Anti Role Delete) | User Not Whitelisted!' });

					await guild.roles
						.create({
							...role,
							reason: 'Antinuke (Anti Role Delete) | Role Recovery!',
						})
						.catch(() => false);

					return;
				}

				if (data.punishment === 'kick' && member.kickable) {
					await member.kick('Antinuke (Anti Role Delete) | User Not Whitelisted!');

					await guild.roles
						.create({
							...role,
							reason: 'Antinuke (Anti Role Delete) | Role Recovery!',
						})
						.catch(() => false);

					return;
				}

				if (data.punishment === 'removeroles' && member.manageable) {
					await member.roles.set([]);

					await guild.roles
						.create({
							...role,
							reason: 'Antinuke (Anti Role Delete) | Role Recovery!',
						})
						.catch(() => false);

					return;
				}

				if (data.punishment === 'timeout' && member.moderatable) {
					await member.timeout(2.419e9, 'Antinuke (Anti Role Delete) | User Not Whitelisted!');

					await guild.roles
						.create({
							...role,
							reason: 'Antinuke (Anti Role Delete) | Role Recovery!',
						})
						.catch(() => false);

					return;
				}

				break;
			}

			case AuditLogEvent.RoleUpdate: {
				if (!data.events.find((e) => e.action === AuditLogEvent.RoleUpdate)?.enabled) return;

				const { executor, target } = auditLogEntry;

				if (data.whitelist.includes(executor.id)) return;

				if (target.id === executor.id) return;
				if (target.id === this.client.user.id) return;
				if (target.id === guild.ownerId) return;

				/**
				 * @type {GuildMember}
				 */
				const member = await guild.members.fetch(executor.id).catch(() => false);

				if (!member) return;

				if (member.roles.highest.position >= guild.members.me.roles.highest.position) return;

				/**
				 * @type {Role}
				 */
				const role = await guild.roles.fetch(target.id).catch(() => false);

				if (!role) return;

				if (role.position >= guild.members.me.roles.highest.position) return;

				if (data.punishment === 'ban' && member.bannable) {
					await member.ban({ reason: 'Antinuke (Anti Role Update) | User Not Whitelisted!' });

					if (role.editable)
						await role.edit({ ...role, reason: 'Antinuke (Anti Role Update) | Role Recovery!' });

					return;
				}

				if (data.punishment === 'kick' && member.kickable) {
					await member.kick('Antinuke (Anti Role Update) | User Not Whitelisted!');

					if (role.editable)
						await role.edit({ ...role, reason: 'Antinuke (Anti Role Update) | Role Recovery!' });

					return;
				}

				if (data.punishment === 'removeroles' && member.manageable) {
					await member.roles.set([]);

					if (role.editable)
						await role.edit({ ...role, reason: 'Antinuke (Anti Role Update) | Role Recovery!' });

					return;
				}

				if (data.punishment === 'timeout' && member.moderatable) {
					await member.timeout(2.419e9, 'Antinuke (Anti Role Update) | User Not Whitelisted!');

					if (role.editable)
						await role.edit({ ...role, reason: 'Antinuke (Anti Role Update) | Role Recovery!' });

					return;
				}

				break;
			}

			case AuditLogEvent.ChannelCreate: {
				if (!data.events.find((e) => e.action === AuditLogEvent.ChannelCreate)?.enabled) return;

				const { executor, target } = auditLogEntry;

				if (data.whitelist.includes(executor.id)) return;

				if (target.id === executor.id) return;
				if (target.id === this.client.user.id) return;
				if (target.id === guild.ownerId) return;

				/**
				 * @type {GuildMember}
				 */
				const member = await guild.members.fetch(executor.id).catch(() => false);

				if (!member) return;

				if (member.roles.highest.position >= guild.members.me.roles.highest.position) return;

				/**
				 * @type {GuildChannel}
				 */
				const channel = await guild.channels.fetch(target.id).catch(() => false);

				if (!channel) return;

				if (data.punishment === 'ban' && member.bannable) {
					await member.ban({ reason: 'Antinuke (Anti Channel Create) | User Not Whitelisted!' });

					if (channel.deletable)
						await channel.delete('Antinuke (Anti Channel Create) | Channel Recovery!');

					return;
				}

				if (data.punishment === 'kick' && member.kickable) {
					await member.kick('Antinuke (Anti Channel Create) | User Not Whitelisted!');

					if (channel.deletable)
						await channel.delete('Antinuke (Anti Channel Create) | Channel Recovery!');

					return;
				}

				if (data.punishment === 'removeroles' && member.manageable) {
					await member.roles.set([]);

					if (channel.deletable)
						await channel.delete('Antinuke (Anti Channel Create) | Channel Recovery!');

					return;
				}

				if (data.punishment === 'timeout' && member.moderatable) {
					await member.timeout(2.419e9, 'Antinuke (Anti Channel Create) | User Not Whitelisted!');

					if (channel.deletable)
						await channel.delete('Antinuke (Anti Channel Create) | Channel Recovery!');

					return;
				}

				break;
			}

			case AuditLogEvent.ChannelDelete: {
				if (!data.events.find((e) => e.action === AuditLogEvent.ChannelDelete)?.enabled) return;

				const { executor, target } = auditLogEntry;

				if (data.whitelist.includes(executor.id)) return;

				if (target.id === executor.id) return;
				if (target.id === this.client.user.id) return;
				if (target.id === guild.ownerId) return;

				/**
				 * @type {GuildMember}
				 */
				const member = await guild.members.fetch(executor.id).catch(() => false);

				if (!member) return;

				if (member.roles.highest.position >= guild.members.me.roles.highest.position) return;

				/**
				 * @type {GuildChannel}
				 */
				const channel = target;

				if (!channel) return;

				if (data.punishment === 'ban' && member.bannable) {
					await member.ban({ reason: 'Antinuke (Anti Channel Delete) | User Not Whitelisted!' });

					await guild.channels
						.create({
							...channel,
							reason: 'Antinuke (Anti Channel Delete) | Channel Recovery!',
						})
						.catch(() => false);

					return;
				}

				if (data.punishment === 'kick' && member.kickable) {
					await member.kick('Antinuke (Anti Channel Delete) | User Not Whitelisted!');

					await guild.channels
						.create({
							...channel,
							reason: 'Antinuke (Anti Channel Delete) | Channel Recovery!',
						})
						.catch(() => false);

					return;
				}

				if (data.punishment === 'removeroles' && member.manageable) {
					await member.roles.set([]);

					await guild.channels
						.create({
							...channel,
							reason: 'Antinuke (Anti Channel Delete) | Channel Recovery!',
						})
						.catch(() => false);

					return;
				}

				if (data.punishment === 'timeout' && member.moderatable) {
					await member.timeout(2.419e9, 'Antinuke (Anti Channel Delete) | User Not Whitelisted!');

					await guild.channels
						.create({
							...channel,
							reason: 'Antinuke (Anti Channel Delete) | Channel Recovery!',
						})
						.catch(() => false);

					return;
				}

				break;
			}

			case AuditLogEvent.ChannelUpdate: {
				if (!data.events.find((e) => e.action === AuditLogEvent.ChannelUpdate)?.enabled) return;

				const { executor, target } = auditLogEntry;

				if (data.whitelist.includes(executor.id)) return;

				if (target.id === executor.id) return;
				if (target.id === this.client.user.id) return;
				if (target.id === guild.ownerId) return;

				/**
				 * @type {GuildMember}
				 */
				const member = await guild.members.fetch(executor.id).catch(() => false);

				if (!member) return;

				if (member.roles.highest.position >= guild.members.me.roles.highest.position) return;

				/**
				 * @type {GuildChannel}
				 */
				const channel = await guild.channels.fetch(target.id).catch(() => false);

				if (!channel) return;

				if (data.punishment === 'ban' && member.bannable) {
					await member.ban({ reason: 'Antinuke (Anti Channel Update) | User Not Whitelisted!' });

					if (channel.manageable)
						await channel.edit({
							...channel,
							reason: 'Antinuke (Anti Channel Update) | Channel Recovery!',
						});

					return;
				}

				if (data.punishment === 'kick' && member.kickable) {
					await member.kick('Antinuke (Anti Channel Update) | User Not Whitelisted!');

					if (channel.manageable)
						await channel.edit({
							...channel,
							reason: 'Antinuke (Anti Channel Update) | Channel Recovery!',
						});

					return;
				}

				if (data.punishment === 'removeroles' && member.manageable) {
					await member.roles.set([]);

					if (channel.manageable)
						await channel.edit({
							...channel,
							reason: 'Antinuke (Anti Channel Update) | Channel Recovery!',
						});

					return;
				}

				if (data.punishment === 'timeout' && member.moderatable) {
					await member.timeout(2.419e9, 'Antinuke (Anti Channel Update) | User Not Whitelisted!');

					if (channel.manageable)
						await channel.edit({
							...channel,
							reason: 'Antinuke (Anti Channel Update) | Channel Recovery!',
						});

					return;
				}

				break;
			}

			case AuditLogEvent.BotAdd: {
				if (!data.events.find((e) => e.action === AuditLogEvent.BotAdd)?.enabled) return;

				const { executor, target } = auditLogEntry;

				if (data.whitelist.includes(executor.id)) return;

				if (target.id === executor.id) return;
				if (target.id === this.client.user.id) return;
				if (target.id === guild.ownerId) return;

				/**
				 * @type {GuildMember}
				 */
				const member = await guild.members.fetch(executor.id).catch(() => false);

				if (!member) return;

				if (member.roles.highest.position >= guild.members.me.roles.highest.position) return;

				/**
				 * @type {GuildMember}
				 */
				const bot = await this.client.users.fetch(target.id).catch(() => false);

				if (!bot || !bot.user.bot) return;

				if (bot.roles && bot.roles.highest.position >= guild.members.me.roles.highest.position) return;

				if (data.punishment === 'ban' && member.bannable) {
					await member.ban({ reason: 'Antinuke (Anti Bot Add) | User Not Whitelisted!' });

					if (bot.bannable) await bot.ban({ reason: 'Antinuke (Anti Bot Add) | User Not Whitelisted!' });

					return;
				}

				if (data.punishment === 'kick' && member.kickable) {
					await member.kick('Antinuke (Anti Bot Add) | User Not Whitelisted!');

					if (bot.bannable) await bot.ban({ reason: 'Antinuke (Anti Bot Add) | User Not Whitelisted!' });

					return;
				}

				if (data.punishment === 'removeroles' && member.manageable) {
					await member.roles.set([]);

					if (bot.bannable) await bot.ban({ reason: 'Antinuke (Anti Bot Add) | User Not Whitelisted!' });

					return;
				}

				if (data.punishment === 'timeout' && member.moderatable) {
					await member.timeout(2.419e9, 'Antinuke (Anti Bot Add) | User Not Whitelisted!');

					if (bot.bannable) await bot.ban({ reason: 'Antinuke (Anti Bot Add) | User Not Whitelisted!' });

					return;
				}

				break;
			}

			case AuditLogEvent.GuildUpdate: {
				if (!data.events.find((e) => e.action === AuditLogEvent.GuildUpdate)?.enabled) return;

				const { executor, target } = auditLogEntry;

				if (data.whitelist.includes(executor.id)) return;

				if (target.id === executor.id) return;
				if (executor.id === this.client.user.id) return;
				if (executor.id === guild.ownerId) return;

				/**
				 * @type {GuildMember}
				 * */
				const member = await guild.members.fetch(executor.id).catch(() => false);

				if (!member) return;

				if (member.roles.highest.position >= guild.members.me.roles.highest.position) return;

				/**
				 * @type {Guild}
				 */
				const server = target;

				if (server.id !== guild.id) return;

				if (data.punishment === 'ban' && member.bannable) {
					await member.ban({ reason: 'Antinuke (Anti Guild Update) | User Not Whitelisted!' });

					await server
						.edit({
							...server,
							reason: 'Antinuke (Anti Guild Update) | Server Recovery!',
						})
						.catch(() => false);

					return;
				}

				if (data.punishment === 'kick' && member.kickable) {
					await member.kick('Antinuke (Anti Guild Update) | User Not Whitelisted!');

					await server
						.edit({
							...server,
							reason: 'Antinuke (Anti Guild Update) | Server Recovery!',
						})
						.catch(() => false);

					return;
				}

				if (data.punishment === 'removeroles' && member.manageable) {
					await member.roles.set([]);

					await server
						.edit({
							...server,
							reason: 'Antinuke (Anti Guild Update) | Server Recovery!',
						})
						.catch(() => false);

					return;
				}

				if (data.punishment === 'timeout' && member.moderatable) {
					await member.timeout(2.419e9, 'Antinuke (Anti Guild Update) | User Not Whitelisted!');

					await server
						.edit({
							...server,
							reason: 'Antinuke (Anti Guild Update) | Server Recovery!',
						})
						.catch(() => false);

					return;
				}

				break;
			}

			case AuditLogEvent.WebhookCreate: {
				if (!data.events.find((e) => e.action === AuditLogEvent.WebhookCreate)?.enabled) return;

				const { executor, target } = auditLogEntry;

				if (data.whitelist.includes(executor.id)) return;

				if (target.id === executor.id) return;
				if (executor.id === this.client.user.id) return;
				if (executor.id === guild.ownerId) return;

				/**
				 * @type {GuildMember}
				 * */
				const member = await guild.members.fetch(executor.id).catch(() => false);

				if (!member) return;

				if (member.roles.highest.position >= guild.members.me.roles.highest.position) return;

				/**
				 * @type {Webhook}
				 */
				const webhook = target;

				if (!webhook.channel) return;

				if (data.punishment === 'ban' && member.bannable) {
					await member.ban({ reason: 'Antinuke (Anti Webhook Create) | User Not Whitelisted!' });

					await webhook.delete('Antinuke (Anti Webhook Create) | Recovery!').catch(() => false);

					return;
				}

				if (data.punishment === 'kick' && member.kickable) {
					await member.kick('Antinuke (Anti Webhook Create) | User Not Whitelisted!');

					await webhook.delete('Antinuke (Anti Webhook Create) | Recovery!').catch(() => false);

					return;
				}

				if (data.punishment === 'removeroles' && member.manageable) {
					await member.roles.set([]);

					await webhook.delete('Antinuke (Anti Webhook Create) | Recovery!').catch(() => false);

					return;
				}

				if (data.punishment === 'timeout' && member.moderatable) {
					await member.timeout(2.419e9, 'Antinuke (Anti Webhook Create) | User Not Whitelisted!');

					await webhook.delete('Antinuke (Anti Webhook Create) | Recovery!').catch(() => false);

					return;
				}

				break;
			}

			case AuditLogEvent.WebhookDelete: {
				if (!data.events.find((e) => e.action === AuditLogEvent.WebhookDelete)?.enabled) return;

				const { executor, target } = auditLogEntry;

				if (data.whitelist.includes(executor.id)) return;

				if (target.id === executor.id) return;
				if (executor.id === this.client.user.id) return;
				if (executor.id === guild.ownerId) return;

				/**
				 * @type {GuildMember}
				 * */
				const member = await guild.members.fetch(executor.id).catch(() => false);

				if (!member) return;

				if (member.roles.highest.position >= guild.members.me.roles.highest.position) return;

				/**
				 * @type {Webhook}
				 */
				const webhook = target;

				if (!webhook.channel) return;

				if (data.punishment === 'ban' && member.bannable) {
					await member.ban({ reason: 'Antinuke (Anti Webhook Delete) | User Not Whitelisted!' });

					await webhook.delete('Antinuke (Anti Webhook Delete) | Recovery!').catch(() => false);

					return;
				}

				if (data.punishment === 'kick' && member.kickable) {
					await member.kick('Antinuke (Anti Webhook Delete) | User Not Whitelisted!');

					await webhook.delete('Antinuke (Anti Webhook Delete) | Recovery!').catch(() => false);

					return;
				}

				if (data.punishment === 'removeroles' && member.manageable) {
					await member.roles.set([]);

					await webhook.delete('Antinuke (Anti Webhook Delete) | Recovery!').catch(() => false);

					return;
				}

				if (data.punishment === 'timeout' && member.moderatable) {
					await member.timeout(2.419e9, 'Antinuke (Anti Webhook Delete) | User Not Whitelisted!');

					await webhook.delete('Antinuke (Anti Webhook Delete) | Recovery!').catch(() => false);

					return;
				}

				break;
			}

			case AuditLogEvent.WebhookUpdate: {
				if (!data.events.find((e) => e.action === AuditLogEvent.WebhookUpdate)?.enabled) return;

				const { executor, target } = auditLogEntry;

				if (data.whitelist.includes(executor.id)) return;

				if (target.id === executor.id) return;
				if (executor.id === this.client.user.id) return;
				if (executor.id === guild.ownerId) return;

				/**
				 * @type {GuildMember}
				 * */
				const member = await guild.members.fetch(executor.id).catch(() => false);

				if (!member) return;

				if (member.roles.highest.position >= guild.members.me.roles.highest.position) return;

				/**
				 * @type {Webhook}
				 */
				const webhook = target;

				if (!webhook.channel) return;

				if (data.punishment === 'ban' && member.bannable) {
					await member.ban({ reason: 'Antinuke (Anti Webhook Update) | User Not Whitelisted!' });

					await webhook
						.edit({
							...webhook,
						})
						.catch(() => false);

					return;
				}

				if (data.punishment === 'kick' && member.kickable) {
					await member.kick('Antinuke (Anti Webhook Update) | User Not Whitelisted!');

					await webhook
						.edit({
							...webhook,
						})
						.catch(() => false);

					return;
				}

				if (data.punishment === 'removeroles' && member.manageable) {
					await member.roles.set([]);

					await webhook
						.edit({
							...webhook,
						})
						.catch(() => false);

					return;
				}

				if (data.punishment === 'timeout' && member.moderatable) {
					await member.timeout(2.419e9, 'Antinuke (Anti Webhook Update) | User Not Whitelisted!');

					await webhook
						.edit({
							...webhook,
						})
						.catch(() => false);

					return;
				}

				break;
			}
		}
	}
};
