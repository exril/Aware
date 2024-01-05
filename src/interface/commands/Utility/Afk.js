const { Command } = require("@pheonix/framework");
const { Message, cleanContent, escapeMarkdown, MessagePayload } = require("discord.js");

module.exports = class Afk extends Command {
  constructor() {
    super("afk", {
      aliases: ["afk"],
      category: "Utility",
      description: {
        content: "Set your afk status",
        usage: ".afk",
        examples: [""],
      },
      slash: true,
      cooldown: 5000,
      args: [
        {
          id: "reason",
          type: "string",
          match: "rest",
          default: "None",
        },
      ],
    });
  }

  /**
   *
   * @param {Message} message
   * @param {{ reason: string }} args
   */
  async exec(message, args) {
    const { reason } = args;

    const isAfk = await this.client.database.getAfk(
      message.author.id,
      message.guild.id
    );

    if (isAfk) {
      await message.util.send("Your afk status has been removed!");
      await this.client.database.deleteAfk(message.author.id, message.guild.id);
      return;
    }

    const payload = new MessagePayload(message.channel, {
      content: cleanContent(
        `<:icons_Correct:1106127305308393492> Your afk status has been set to - ${escapeMarkdown(
          reason
        )}!`,
        message.channel
      ),
    });

    await message.util.reply(payload);

    await this.client.database.setAfk(
      message.author.id,
      reason,
      message.guild.id
    );
  }
};
