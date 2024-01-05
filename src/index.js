// aint no way 😏😏😏😏😏
require('module-alias/register');
require('dotenv').config();
const BaseClient = require('@core/BaseClient');
const { IntentsBitField } = require('discord.js');

const client = new BaseClient({
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.MessageContent,
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.GuildModeration,
	],
});