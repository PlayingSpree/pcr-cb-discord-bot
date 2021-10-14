"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const builders_1 = require("@discordjs/builders");
const bossrole_1 = require("../../logic/bossrole/bossrole");
exports.command = {
    data: new builders_1.SlashCommandBuilder()
        .setName('bossrole')
        .setDescription('เพิ่ม role ให้ผู้เล่นที่ react เพื่อรับการแจ้งเตือนเมื่อถึงบอสนั้น ๆ'),
    async execute(interaction) {
        const error = await (0, bossrole_1.start)(interaction);
        if (error) {
            if (interaction.replied)
                interaction.editReply(error);
            else
                interaction.reply({ content: error, ephemeral: true });
        }
    },
    handleReaction(reaction, user, add) {
        (0, bossrole_1.reactionEvent)(reaction, user, add);
    },
};
