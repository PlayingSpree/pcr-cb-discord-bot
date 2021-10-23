"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const builders_1 = require("@discordjs/builders");
const clearchat_1 = require("../../logic/clearchat");
exports.command = {
    data: new builders_1.SlashCommandBuilder()
        .setName('clearchat')
        .setDescription('ลบแชทใน channel ทั้งหมด (Admin เท่านั้น)'),
    execute(interaction) {
        void (0, clearchat_1.tryClearChat)(interaction);
    },
    executeButton(interaction) {
        void (0, clearchat_1.tryClearChat)(interaction);
    },
};
//# sourceMappingURL=clearchat.js.map