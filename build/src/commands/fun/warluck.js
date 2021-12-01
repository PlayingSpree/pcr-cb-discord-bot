"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const builders_1 = require("@discordjs/builders");
const warluck_1 = require("../../logic/warluck");
exports.command = {
    data: new builders_1.SlashCommandBuilder()
        .setName('warluck')
        .setDescription('เช็คดวง ก่อนต่อสู้จริงใน Clan Battle'),
    execute(interaction) {
        void interaction.reply({ embeds: [(0, warluck_1.getLuck)()] });
    },
};
//# sourceMappingURL=warluck.js.map