/*const { Command } = require('@pheonix/framework');
const { Message, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const { readdir, readdirSync, unlink } = require('node:fs');
const Wait = require('node:timers/promises').setTimeout;

module.exports = class Record extends Command {
	constructor() {
		super('record', {
			aliases: ['record', 'rec'],
			category: 'Utility',
			description: {
				content: 'Record your voice',
				usage: '.record [time]',
				examples: [''],
			},
			slash: true,
			cooldown: 10000,
			args: [
				{
					id: 'time',
					type: 'number',
				},
			],
		});

		this.writeSteam = null;
	}

	async exec(message) {
		if (!message.member.voice?.channel) {
			await message.util.send({
				content: 'You must be in a voice channel to use this command!',
			});

			return;
		}

		if (
			message.guild.members.me.voice.channel &&
			message.guild.members.me.voice.channel.id !== message.member.voice.channel.id
		) {
			await message.util.send({
				content: `I'm already in a voice channel!`,
			});

			return;
		}

		const connection = this.client.recorder.join({
			adapterCreator: message.guild.voiceAdapterCreator,
			debug: true,
			channelId: message.member.voice.channel.id,
			guildId: message.guild.id,
			selfDeaf: true,
			selfMute: false,
		});

		await this.client.recorder.start(connection, message);

		const msg = await message.util.send({
			content: `**Recording Started**`,
			components: [
				new ActionRowBuilder().addComponents([
					new ButtonBuilder().setCustomId('stop').setLabel('Stop').setStyle(ButtonStyle.Danger),
				]),
			],
		});

		const collector = msg.createMessageComponentCollector({
			filter: (i) => i.user.id === message.author.id,
			time: message.args?.time ? parseInt(message.args.time) * 1000 : 60000,
			max: 1,
		});

		collector.on('collect', async (i) => {
			await i.deferUpdate();

			const file = await this.client.recorder.stop();

			await msg.delete().catch(() => {});

			await Wait(5000);

			await message.util.send({
				content: `Recording ended!`,
				files: [
					new AttachmentBuilder(file, {
						name: 'voice-message.mp3',
					}),
				],
			});

			readdirSync('./recordings').forEach((file) => {
				if (file.endsWith('.mp3')) {
					readdir('./recordings', (err, files) => {
						if (err) throw err;

						for (const file of files) {
							unlink(`./recordings/${file}`, (err) => {
								if (err) throw err;
							});
						}
					});
				}
			});

			collector.stop();
		});

		collector.on('end', async (i) => {
			if (i.size === 0) {
				const file = await this.client.recorder.stop();

				await msg.delete().catch(() => {});

				await Wait(5000);

				await message.util.send({
					content: `Recording ended!`,
					files: [
						new AttachmentBuilder(file, {
							name: 'voice-message.mp3',
						}),
					],
				});

				readdirSync('./recordings').forEach((file) => {
					if (file.endsWith('.mp3')) {
						readdir('./recordings', (err, files) => {
							if (err) throw err;

							for (const file of files) {
								unlink(`./recordings/${file}`, (err) => {
									if (err) throw err;
								});
							}
						});
					}
				});
			}
		});
	}
};
*/