"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const builders_1 = require("@discordjs/builders");
const queue_1 = require("../../logic/queue");
exports.command = {
    data: new builders_1.SlashCommandBuilder()
        .setName('queue')
        .setDescription('เริ่มนับคิวตีบอส')
        .addIntegerOption(option => option.setName('count')
        .setDescription('ไม้ที่ต้องการ')
        .setRequired(true))
        .addIntegerOption(option => option.setName('boss')
        .setDescription('บอส')
        .addChoices([['1', 1], ['2', 2], ['3', 3], ['4', 4], ['5', 5]])
        .setRequired(true))
        .addIntegerOption(option => option.setName('round')
        .setDescription('รอบของบอส')
        .setRequired(true)),
    async execute(interaction) {
        try {
            await (0, queue_1.start)(interaction, interaction.options.getInteger('count', true), interaction.options.getInteger('boss', true), interaction.options.getInteger('round', true));
        }
        catch (e) {
            if (e instanceof Error) {
                {
                    if (interaction.replied)
                        void interaction.editReply(e.message);
                    else
                        void interaction.reply({ content: e.message, ephemeral: true });
                }
            }
        }
    },
    handleReaction(reaction, user, add) {
        void (0, queue_1.reactionEvent)(reaction, user, add);
    },
};
//# sourceMappingURL=queue.js.map