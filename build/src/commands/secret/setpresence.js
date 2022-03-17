"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const builders_1 = require("@discordjs/builders");
const logger_1 = require("../../util/logger");
let lastInterval;
exports.command = {
    data: new builders_1.SlashCommandBuilder()
        .setName('setpresence')
        .setDescription('set presence')
        .addStringOption(option => option
        .setName('presence')
        .setDescription('presence')
        .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        const currentPresence = interaction.options.getString('presence', true);
        (0, logger_1.loginfo)(`Seting Presence: ${currentPresence}`);
        const setPresence = () => {
            interaction.client?.user?.setPresence({ activities: [{ name: currentPresence }] });
        };
        setPresence();
        if (lastInterval)
            clearInterval(lastInterval);
        lastInterval = setInterval(setPresence, 1000 * 60 * 30);
        void interaction.editReply(`Presence set to ${currentPresence}`);
    },
};
//# sourceMappingURL=setpresence.js.map