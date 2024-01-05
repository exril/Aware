const { Listener } = require('@pheonix/framework');
const { GuildMember } = require('discord.js');

module.exports = class MemberUpdateListener extends Listener {
	constructor() {
		super('guildMemberUpdate', {
			emitter: 'client',
			event: 'guildMemberUpdate',
		});
	}

	/**
	 * @param {GuildMember} oldMember
	 * @param {GuildMember} newMember
	 * @returns {Promise<void>}
	 */
	async exec(oldMember, newMember) {
		if (oldMember.nickname !== newMember.nickname) {
			const stickyNick = await this.client.database.getNickname(newMember.guild.id, newMember.id);

			if (stickyNick) {
				await newMember.setNickname(stickyNick);

				return;
			}
		}
	}
};
