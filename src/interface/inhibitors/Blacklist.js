const { Inhibitor } = require("@pheonix/framework");

module.exports = class Blacklist extends Inhibitor {
    constructor() {
        super("blacklist", {
            reason: "blacklist",
        });
    }

    async exec(message) {
        if (message.guild) {
            const isBlacklisted = await this.client.database.isGuildBlacklisted(message.guild.id);

            if (isBlacklisted) {
                return true;
            }
        }

        const isBlacklisted = await this.client.database.isUserBlacklisted(message.author.id);

        if (isBlacklisted) {
            return true;
        }
    }
}