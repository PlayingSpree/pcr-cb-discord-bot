"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const builders_1 = require("@discordjs/builders");
exports.command = {
    data: new builders_1.SlashCommandBuilder()
        .setName('ping')
        .setDescription('แสดงค่า latency'),
    async execute(interaction) {
        await interaction.reply(`🏓Latency: ${Math.round(interaction.client.ws.ping)}ms`);
    },
};
//# sourceMappingURL=ping.js.map