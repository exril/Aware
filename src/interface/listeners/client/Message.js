const { Listener } = require("@pheonix/framework");
const {
  Message,
  MessagePayload,
  escapeMarkdown,
  cleanContent,
} = require("discord.js");

module.exports = class MessageListener extends Listener {
  constructor() {
    super("messageCreate", {
      emitter: "client",
      event: "messageCreate",
    });
  }

  /**
   *
   * @param {Message} message
   */
  async exec(message) {
    if (message.author.bot) return;
    if (!message.guild) return;

    // Dokdo
    await this.client.dokdo.run(message).catch(() => null);

    /// Afk
    const isAfk = await this.client.database.getAfk(
      message.author.id,
      message.guild.id
    );

    if (isAfk) {
      // Mention Nested
      if (message.mentions.members.has(message.author.id)) {
        const payload = new MessagePayload(message.channel, {
          content: cleanContent(
            `${message.author.username} is afk for reason - **${isAfk?.reason}**`,
            message.channel
          ),
        });

        await message.reply(payload);
        return;
      }

      isAfk.timestamp = parseInt(isAfk.timestamp);
      const timestamp = Math.floor(isAfk.timestamp / 1000);

      const payload = new MessagePayload(message.channel, {
        content: cleanContent(
          `Welcome back! You went afk <t:${timestamp}:R> with the reason - ${escapeMarkdown(
            isAfk.reason
          )}`,
          message.channel
        ),
      });

      const msg = await message.util.reply(payload);

      await this.client.database.deleteAfk(message.author.id, message.guild.id);

      setTimeout(async () => {
        await msg.delete();
      }, 10000);
    }
  }
};
