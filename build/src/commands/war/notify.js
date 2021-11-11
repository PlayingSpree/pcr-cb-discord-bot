"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const builders_1 = require("@discordjs/builders");
const notify_1 = require("../../logic/notify");
exports.command = {
    data: new builders_1.SlashCommandBuilder()
        .setName('notify')
        .setDescription('แสดง react รับการแจ้งเตือนเมื่อถึงบอสนั้น ๆ'),
    async execute(interaction) {
        try {
            await (0, notify_1.start)(interaction);
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
        (0, notify_1.reactionEvent)(reaction, user, add);
    },
};
//# sourceMappingURL=notify.js.map