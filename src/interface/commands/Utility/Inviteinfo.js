const { Command, Argument } = require('@pheonix/framework');
const { Message, Invite } = require('discord.js');

module.exports = class InviteInfo extends Command {
	constructor() {
		super('inviteinfo', {
			aliases: ['inviteinfo', 'aboutinvite', 'fetchinvite', 'fetchserver'],
			category: 'Utility',
			description: {
				content: 'Get information about an invite',
				usage: '.inviteinfo <invite>',
				examples: [''],
			},
			slash: true,
			cooldown: 5000,
			args: [
				{
					id: 'invite',
					type: Argument.union('invite', 'string'),
				},
			],
		});
	}

	/**
	 *
	 * @param {Message} message
	 * @param {{ invite: Invite }} args
	 */
	async exec(message, args) {
		const { invite } = args;
		if (!invite) {
			await message.util.send({
				content: 'Please provide a invite link',
			});

			return;
		}

		const embed = this.client.util
			.embed()
			.setTitle(`Invite Information For ${invite.guild.name}`)
			.setThumbnail(invite.guild.iconURL())
			.setDescription(
				`**Invite Code:** ${invite.code}\n**Server Name :** ${invite.guild.name}\n**Server ID :** ${
					invite.guild.id
				}\n**Description :** ${
					invite.guild.description ?? 'No description'
				}\n**Icon :** [Click Here](${invite.guild.iconURL()})\n**Banner :** ${
					invite.guild.banner ? `[Click Here](${invite.guild.bannerURL()})` : 'No Banner'
				}\n**Vanity URL :** ${invite.guild.vanityURLCode ?? 'No vanity URL'}\n**Splash :** ${
					invite.guild.splash ? `[Click Here](${invite.guild.splashURL()})` : 'No splash'
				}\n**Verification Level :** ${invite.guild.verificationLevel}\n**Member Count :** ${
					invite.memberCount
				}\n**Online Member Count :** ${invite.presenceCount}\n**Boost Count :** ${
					invite.guild.premiumSubscriptionCount
				}\n\n**__Server Features__**\n${invite.guild.features
					.map((x) => `<:_:1106127305308393492>\`${x}\``)
					.join('\n')}`
			)
			.setImage(invite.guild.bannerURL({ size: 4096 }))
			.setColor(this.client.config.colors.primary);

		await message.util.send({ embeds: [embed] });
	}
};
