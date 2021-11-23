"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const builders_1 = require("@discordjs/builders");
const gachatest_1 = require("../../logic/gachatest");
exports.command = {
    data: new builders_1.SlashCommandBuilder()
        .setName('gacha')
        .setDescription('จำลองเปิดกาชา ว่าเปิดกี่ครั้งถึงจะได้ตัว Pickup')
        .addStringOption(option => option.setName('type')
        .setDescription('เลือกประเภทกาชา')
        .setRequired(false)
        .addChoices([['pickup', 'pickup'], ['bluearchive', 'ba']])),
    execute(interaction) {
        void interaction.reply({ embeds: [(0, gachatest_1.getGacha)(interaction.options.getString('type'))] });
    },
};
//# sourceMappingURL=gacha.js.map