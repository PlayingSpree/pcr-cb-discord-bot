"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const builders_1 = require("@discordjs/builders");
const data_1 = require("../../data/data");
exports.command = {
    data: new builders_1.SlashCommandBuilder()
        .setName('loaddata')
        .setDescription('load data'),
    async execute(interaction) {
        await interaction.deferReply();
        await (0, data_1.loadData)();
        void interaction.editReply('Data loaded.');
    },
};
//# sourceMappingURL=loaddata.js.map