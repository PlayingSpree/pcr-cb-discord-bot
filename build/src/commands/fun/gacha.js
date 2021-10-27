"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const builders_1 = require("@discordjs/builders");
const gachatest_1 = require("../../logic/gachatest");
exports.command = {
    data: new builders_1.SlashCommandBuilder()
        .setName('gacha')
        .setDescription('จำลองเปิดกาชา ว่าเปิดกี่ครั้งถึงจะได้ตัว Pickup'),
    execute(interaction) {
        void interaction.reply({ embeds: [(0, gachatest_1.getGacha)()] });
    },
};
//# sourceMappingURL=gacha.js.map