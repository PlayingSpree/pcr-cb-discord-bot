"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactionEvent = exports.start = void 0;
const discord_js_1 = require("discord.js");
const state_1 = require("../data/state");
const logger_1 = require("../util/logger");
const message_1 = require("../util/message");
const reaction_1 = require("../util/reaction");
async function start(interaction, count, boss, round) {
    await interaction.reply((0, message_1.ephemeral)(`เริ่มการเข้าตีบอส
**React ทั้งหมดที่ใช้ได้**
✅ = ตีได้เลย
⏸️ = พอสรอ ovf ตอนใกล้จบ
⬆️ = ถือไม้ ovf รอเรียกปล่อย
1️⃣2️⃣3️⃣4️⃣5️⃣ = ถือไม้ ovf ไปปล่อยบอสนั้น`));
    const state = new state_1.QueueState(interaction.channelId, count, round, boss);
    await queuePrintHeader(interaction.channel, state);
    state.messageId = (await interaction.channel.send('ยังไม่มีผู้เล่นได้รับอนุมัติ')).id;
    state_1.queueStateData.set(interaction.guildId, state);
}
exports.start = start;
async function reactionEvent(reaction, user, add) {
    const reactionChannel = reaction.message.channel;
    const state = state_1.QueueState.getState(state_1.queueStateData, reactionChannel.guildId);
    if (!state)
        return;
    if (state.channelId != reaction.message.channelId)
        return;
    if (!reaction.emoji.name)
        return;
    (0, logger_1.loginfo)(`Queue React ${add ? 'add' : 'remove'}: ${reaction.emoji.name}`);
    const player = reaction.message.member;
    const hitter = reaction.message.mentions.members?.first() || player;
    const message = reaction.message.content;
    const comment = message && message.length <= 32 ? message : null;
    if (add) {
        if (reaction.emoji.name === '✅') {
            const reply = await reactionChannel.send(`✅ ${printPlayer(player, comment)} ตีได้เลยจ้า~`);
            state.playerQueueStates.push(new state_1.PlayerQueueState(player.id, reaction.message.id, reply.id, [], reaction.emoji.name, comment ? comment.length > 32 ? null : comment : null));
            void queuePrint(reactionChannel, state);
        }
        else if (reaction.emoji.name === '⏸️') {
            const reply = await reactionChannel.send(`⏸️ ${printPlayer(player, comment)} พอสรอ ovf แล้วจบก่อน ไม่ต้องถือไม้นะ`);
            state.playerQueueStates.push(new state_1.PlayerQueueState(hitter.id, reaction.message.id, reply.id, ['pause'], reaction.emoji.name, comment ? comment.length > 32 ? null : comment : null));
            void queuePrint(reactionChannel, state);
        }
        else if (reaction.emoji.name === '⬆️') {
            const reply = await reactionChannel.send(`⬆️ ${printPlayer(player, comment)} พอสรอ ovf แล้วจบทีหลัง ถือไม้ รอเรียกปล่อยน้า~`);
            state.playerQueueStates.push(new state_1.PlayerQueueState(hitter.id, reaction.message.id, reply.id, ['pause', 'hold'], reaction.emoji.name, comment ? comment.length > 32 ? null : comment : null));
            void queuePrint(reactionChannel, state);
        }
        else if (reaction.emoji.name === '⏭️') {
            const collector = await reactionChannel.send({ content: 'เลือกไม้ที่ต้องการในรอบถัดไป', components: countRows });
            collector.awaitMessageComponent({ componentType: 'BUTTON', time: 864000000 })
                .then(interaction => {
                void collector.delete();
                void queueNext(reactionChannel, Number.parseInt(interaction.customId), state);
            })
                .catch(_ => { return; });
        }
        else {
            const boss = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'].indexOf(reaction.emoji.name) + 1;
            if (boss) {
                const reply = await reactionChannel.send(`${reaction_1.reaction_numbers[boss]} ${printPlayer(player, comment)} พอสรอ ovf แล้วจบทีหลัง ถือไม้ แล้วไปตีบอส ${boss} ได้เลย~`);
                const playerState = new state_1.PlayerQueueState(hitter.id, reaction.message.id, reply.id, ['pause', 'hold'], reaction.emoji.name, comment ? comment.length > 32 ? null : comment : null);
                playerState.boss = boss;
                state.playerQueueStates.push(playerState);
                void queuePrint(reactionChannel, state);
            }
        }
    }
    else if (['✅', '⏸️', '⬆️', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'].includes(reaction.emoji.name)) {
        state.playerQueueStates = state.playerQueueStates.filter(p => {
            if (p.messageId == reaction.message.id)
                reactionChannel.messages.cache.get(p.replyId)?.delete();
            return p.messageId != reaction.message.id;
        });
        void queuePrint(reactionChannel, state);
    }
}
exports.reactionEvent = reactionEvent;
function printPlayer(player, comment) {
    if (typeof player == 'string')
        return `<@${player}> ${comment ? `${comment} ` : ''}`;
    return `${player.toString()} ${comment ? `${comment} ` : ''}(${player.displayName})`;
}
function queueNext(channel, count, queue) {
    const notify = state_1.NotifyState.getState(state_1.notifyStateData, channel.guildId);
    if (notify) {
        const hit = notify.boss[queue.boss - 1].filter(id => queue.playerQueueStates.some(p => p.userId === id));
        hit.forEach(id => {
            channel.client.channels.cache.get(notify.channelId)
                ?.messages.cache.get(notify.messageId)
                ?.reactions.cache.filter(r => r.emoji.name === reaction_1.reaction_numbers[queue.boss]).first()
                ?.users.remove(id);
        });
        notify.boss[queue.boss - 1] = notify.boss[queue.boss - 1].filter(id => !queue.playerQueueStates.some(p => p.userId === id));
    }
    queue.next(count);
    void queuePrintHeader(channel, queue);
    const ovf = queue.ovfPlayers.filter(p => p[1] === queue.boss);
    if (ovf.length) {
        void channel.send('**ผู้เล่นที่ให้ปล่อยไม้ ovf:** ' + ovf.map(p => `<@${p[0]}>`).join(' '));
        queue.ovfPlayers = queue.ovfPlayers.filter(p => p[1] !== queue.boss);
    }
    if (!notify || notify.boss[queue.boss - 1].length == 0)
        return;
    void channel.send('**ผู้เล่นที่กดแจ้งเตือนบอสนี้:** ' + notify.boss[queue.boss - 1].map(userId => `<@${userId}>`).join(' '));
}
function queuePrintHeader(channel, queue) {
    return channel.send(`=====================================
**__:smiling_imp: บอส ${queue.boss} รอบ ${queue.round} :crossed_swords: ต้องการ ${queue.count} ไม้__**
=====================================`);
}
function queuePrint(channel, queue) {
    const message = channel.messages.cache.get(queue.messageId);
    if (queue.playerQueueStates.length) {
        const unpausedPlayer = queue.playerQueueStates.filter(p => !p.status.includes('pause'));
        const pausedPlayer = queue.playerQueueStates.filter(p => p.status.includes('pause'));
        let str = `**__:crossed_swords: อนุมัติแล้ว ${queue.playerQueueStates.length} ไม้__**`;
        if (unpausedPlayer.length) {
            str += `\n**✅ ตีได้เลย ${unpausedPlayer.length} ไม้**\n`;
            str += unpausedPlayer
                .map((p, index) => `${index + 1}. ${p.react} ${printPlayer(channel.guild.members.cache.get(p.userId) || p.userId, p.comment)}`)
                .join('\n');
        }
        if (pausedPlayer.length) {
            str += `\n**⏸️ พอสรอ ovf ${pausedPlayer.length} ไม้**\n`;
            str += pausedPlayer
                .map((p, index) => `${index + 1}. ${p.react} ${printPlayer(channel.guild.members.cache.get(p.userId) || p.userId, p.comment)}`)
                .join('\n');
        }
        return message?.edit((0, message_1.noMentions)(str));
    }
    else {
        return message?.edit('ยังไม่มีผู้เล่นได้รับอนุมัติ');
    }
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