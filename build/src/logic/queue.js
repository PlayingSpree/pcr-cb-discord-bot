"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactionEvent = exports.start = void 0;
const discord_js_1 = require("discord.js");
const state_1 = require("../data/state");
const logger_1 = require("../util/logger");
const message_1 = require("../util/message");
async function start(interaction, count, boss, round) {
    await interaction.reply((0, message_1.ephemeral)('เริ่มการเข้าตีบอส'));
    let state = state_1.QueueState.getState(state_1.queueStateData, interaction.guildId);
    if (!state) {
        state = new state_1.QueueState();
        state_1.queueStateData.set(interaction.guildId, state);
    }
    const bossState = new state_1.BossState(interaction.channelId, count, round, boss);
    state.bossQueue[boss - 1] = bossState;
    void queuePrint(interaction.channel, bossState);
}
exports.start = start;
async function reactionEvent(reaction, user, add) {
    const reactionChannel = reaction.message.channel;
    const state = state_1.QueueState.getState(state_1.queueStateData, reactionChannel.guildId)?.bossQueue.find(i => i?.channelId && i.channelId == reaction.message.channelId);
    if (!state)
        return;
    if (!reaction.emoji.name)
        return;
    (0, logger_1.loginfo)(`Bossrole React ${add ? 'add' : 'remove'}: ${reaction.emoji.name}`);
    const player = reaction.message.mentions.users.first() || reaction.message.author;
    const comment = reaction.message.content;
    if (reaction.emoji.name === '✅') {
        state.playerQueueStates.push(new state_1.PlayerQueueState(player.id, false, comment ? comment.length > 32 ? null : comment : null));
        void reactionChannel.send(`[${state.playerQueueStates.length}/${state.count}] ✅ ${player.toString()} (${reaction.message.member?.displayName || player.username}) ตีได้เลยจ้า~`);
    }
    else if (reaction.emoji.name === '⏸️') {
        state.playerQueueStates.push(new state_1.PlayerQueueState(player.id, true, comment ? comment.length > 32 ? null : comment : null));
        void reactionChannel.send(`[${state.playerQueueStates.length}/${state.count}] ⏸️ ${player.toString()} (${reaction.message.member?.displayName || player.username}) ตีได้เลยจ้า~ แต่ต้องพอสรอ ovf ด้วยน้า~`);
    }
    else if (reaction.emoji.name === '⏭️') {
        const message = await reactionChannel.send({ content: 'เลือกไม้ที่ต้องการในรอบถัดไป', components: countRows });
        message.awaitMessageComponent({ componentType: 'BUTTON', time: 864000000 })
            .then(interaction => {
            void message.delete();
            void queueNext(reactionChannel, Number.parseInt(interaction.customId), state);
        })
            .catch(_ => { return; });
    }
}
exports.reactionEvent = reactionEvent;
function queueNext(channel, count, boss) {
    boss.next(count);
    void queuePrint(channel, boss);
}
function queuePrint(channel, boss) {
    void channel.send(`=====================================
**__:smiling_imp: บอส ${boss.boss} รอบ ${boss.round} :crossed_swords: ต้องการ ${boss.count} ไม้__**
=====================================
✅ = ตีได้เลย
⏸️ = พอสรอ ovf ตอนใกล้จบ
⏭️ = เริ่มบอสถัดไป`);
}
const countRows = [new discord_js_1.MessageActionRow()
        .addComponents(new discord_js_1.MessageButton()
        .setCustomId('1')
        .setLabel('1')
        .setStyle('PRIMARY')).addComponents(new discord_js_1.MessageButton()
        .setCustomId('2')
        .setLabel('2')
        .setStyle('PRIMARY')).addComponents(new discord_js_1.MessageButton()
        .setCustomId('3')
        .setLabel('3')
        .setStyle('PRIMARY')).addComponents(new discord_js_1.MessageButton()
        .setCustomId('4')
        .setLabel('4')
        .setStyle('PRIMARY')).addComponents(new discord_js_1.MessageButton()
        .setCustomId('5')
        .setLabel('5')
        .setStyle('PRIMARY')),
    new discord_js_1.MessageActionRow()
        .addComponents(new discord_js_1.MessageButton()
        .setCustomId('6')
        .setLabel('6')
        .setStyle('PRIMARY')).addComponents(new discord_js_1.MessageButton()
        .setCustomId('7')
        .setLabel('7')
        .setStyle('PRIMARY')).addComponents(new discord_js_1.MessageButton()
        .setCustomId('8')
        .setLabel('8')
        .setStyle('PRIMARY')).addComponents(new discord_js_1.MessageButton()
        .setCustomId('9')
        .setLabel('9')
        .setStyle('PRIMARY')).addComponents(new discord_js_1.MessageButton()
        .setCustomId('10')
        .setLabel('10')
        .setStyle('PRIMARY'))];
//# sourceMappingURL=queue.js.map