"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactionEvent = exports.start = void 0;
const state_1 = require("../data/state");
const logger_1 = require("../util/logger");
const reaction_1 = require("../util/reaction");
async function start(interaction) {
    const reply = await interaction.reply({ content: '**:crossed_swords: กด React ที่หมายเลขเพื่อรับการแจ้งเตือน เมื่อมีการเรียกตีบอสนั้น ๆ**\n:warning: การแจ้งเตือนจะถูกเอาออกอัตโนมัติหลังจากได้รับอนุมัติให้ตีบอสที่กดแจ้งเตือนไว้\n หากต้องการได้รับแจ้งเตือนบอสเดิม ให้มากดรับแจ้งเตือนบอสเดิมอีกรอบ', fetchReply: true });
    state_1.notifyStateData.set(interaction.guildId, new state_1.NotifyState(interaction.channelId, reply.id));
    void reactNumberOnMessage(reply);
}
exports.start = start;
function reactionEvent(reaction, user, add) {
    const messageChannel = reaction.message.channel;
    const state = state_1.NotifyState.getState(state_1.notifyStateData, messageChannel.guildId);
    if (!state)
        return;
    const message = state.messageId == reaction.message.id;
    if (!message)
        return;
    if (!reaction.emoji.name)
        return;
    (0, logger_1.loginfo)(`Notify React ${add ? 'add' : 'remove'}: ${reaction.emoji.name}`);
    const boss = reaction_1.reaction_numbers.indexOf(reaction.emoji.name);
    if (boss >= 1 && boss <= 5) {
        const bossIndex = boss - 1;
        if (add && !state.boss[bossIndex].includes(user.id))
            state.boss[bossIndex].push(user.id);
        else if (!add && state.boss[bossIndex].includes(user.id))
            state.boss[bossIndex] = state.boss[bossIndex].filter(id => id !== user.id);
    }
}
exports.reactionEvent = reactionEvent;
async function reactNumberOnMessage(message) {
    for (let i = 1; i <= 5; i++)
        await message.react(reaction_1.reaction_numbers[i]);
}
//# sourceMappingURL=notify.js.map