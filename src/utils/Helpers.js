const BaseClient = require('@core/BaseClient');
const { Guild, TextChannel } = require('discord.js');

class Helpers {
	/**
	 *
	 * @param {BaseClient} client
	 */
	constructor(client) {
		this.client = client;
	}

	/**
	 *
	 * @param {Object} options
	 * @param {String} options.format
	 * @param {Number} options.size
	 * @param {String} options.avatar
	 * @param {String} options.id
	 *
	 */
	resolveAvatar(options) {
		if (options.format === 'png') {
			return `https://cdn.discordapp.com/avatars/${options.id}/${options.avatar}.png?size=${options.size}`;
		} else {
			return `https://cdn.discordapp.com/avatars/${options.id}/${options.avatar}.gif?size=${options.size}`;
		}
	}

	/**
	 * @param {String} id
	 * @returns {Boolean}
	 */
	checkOwner(id) {
		return this.client.config.owners.includes(id);
	}

	/**
	 * @param {Number} uptime
	 * @returns {String}
	 */
	formatUptime(uptime) {
		const seconds = Math.floor((uptime / 1000) % 60);
		const minutes = Math.floor((uptime / (1000 * 60)) % 60);
		const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
		const days = Math.floor((uptime / (1000 * 60 * 60 * 24)) % 7);
		const weeks = Math.floor(uptime / (1000 * 60 * 60 * 24 * 7));
		const months = Math.floor(uptime / (1000 * 60 * 60 * 24 * 30));
		const years = Math.floor(uptime / (1000 * 60 * 60 * 24 * 365));

		return `${years > 0 ? `**${years}** year${years > 1 ? '(s)' : ''}, ` : ''}${
			months > 0 ? `**${months}** month${months > 1 ? '(s)' : ''}, ` : ''
		}${weeks > 0 ? `**${weeks}** week${weeks > 1 ? '(s)' : ''}, ` : ''}${
			days > 0 ? `**${days}** day${days > 1 ? '(s)' : ''}, ` : ''
		}${hours > 0 ? `**${hours}** hour${hours > 1 ? '(s)' : ''}, ` : ''}${
			minutes > 0 ? `**${minutes}** minute${minutes > 1 ? '(s)' : ''}, ` : ''
		}${seconds > 0 ? `**${seconds}** second${seconds > 1 ? '(s)' : ''}` : ''}`;
	}

	/**
	 *
	 * @param {string} search
	 * @param {Guild} guild
	 * @returns {TextChannel}
	 */
	async resolveChannel(search, guild) {
		let channel = null;
		if (!search || typeof search !== 'string') return;
		// Try ID search
		if (search.match(/^<#?(\d+)>$/)) {
			const id = search.match(/^<#?(\d+)>$/)[1];
			channel = guild.channels.cache.get(id);
			// eslint-disable-next-line consistent-return
			if (channel) return channel;
		}

		channel = await guild.channels.cache.get(search);
		// eslint-disable-next-line consistent-return
		return channel;
	}

	removeDuplicates(arr) {
		return [...new Set(arr)];
	}

	generateRandomChars(length) {
		let result = '';
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		for (let i = 0; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * chars.length);
			const randomChar = chars.charAt(randomIndex);
			result += randomChar;
		}
		return result;
	}

	capitalise(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	formatFeature(str) {
		return str
			.split('_')
			.map((word) => this.capitalise(word.toLowerCase()))
			.join(' ');
	}
}

module.exports = Helpers;
