"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const builders_1 = require("@discordjs/builders");
const state_1 = require("../../data/state");
const message_1 = require("../../util/message");
exports.command = {
    data: new builders_1.SlashCommandBuilder()
        .setName('reset')
        .setDescription('รีเซ็ตสถานะการตีบอสทั้งหมด'),
    execute(interaction) {
        try {
            const state = new state_1.QueueState();
            state_1.queueStateData.set(interaction.guildId, state);
        }
        catch (e) {
            if (e instanceof Error) {
                {
                    void interaction.reply((0, message_1.ephemeral)(e.message));
                }
            }
        }
    }
};
//# sourceMappingURL=reset.js.map