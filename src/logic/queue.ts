import { CommandInteraction, MessageActionRow, MessageButton, MessageReaction, TextChannel, User } from 'discord.js';
import { queueStateData, PlayerQueueState, QueueState, BossState } from '../data/state';
import { loginfo } from '../util/logger';
import { ephemeral } from '../util/message';

export async function start(interaction: CommandInteraction, count: number, boss: number, round: number) {
    await interaction.reply(ephemeral('เริ่มการเข้าตีบอส'));
    let state = QueueState.getState(queueStateData, interaction.guildId);
    if (!state) {
        state = new QueueState();
        queueStateData.set(interaction.guildId!, state);
    }

    const bossState = new BossState(interaction.channelId, count, round, boss);
    state.bossQueue[boss - 1] = bossState;
    void queuePrint(interaction.channel as TextChannel, bossState);
}

export async function reactionEvent(reaction: MessageReaction, user: User, add: boolean) {
    const reactionChannel = reaction.message.channel as TextChannel;
    const state = QueueState.getState(queueStateData, reactionChannel.guildId)?.bossQueue.find(i => i?.channelId && i.channelId == reaction.message.channelId);
    if (!state) return;
    if (!reaction.emoji.name) return;
    // TODO Check Role

    loginfo(`Bossrole React ${add ? 'add' : 'remove'}: ${reaction.emoji.name}`);

    const player = reaction.message.mentions.users.first() || reaction.message.author!;
    const comment = reaction.message.content;
    if (reaction.emoji.name === '✅') {
        state.playerQueueStates.push(new PlayerQueueState(player.id, false, comment ? comment.length > 32 ? null : comment : null));
        void reactionChannel.send(`[${state.playerQueueStates.length}/${state.count}] ✅ ${player.toString()} (${reaction.message.member?.displayName || player.username}) ตีได้เลยจ้า~`);
    }
    else if (reaction.emoji.name === '⏸️') {
        state.playerQueueStates.push(new PlayerQueueState(player.id, true, comment ? comment.length > 32 ? null : comment : null));
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

function queueNext(channel: TextChannel, count: number, boss: BossState) {
    boss.next(count);
    void queuePrint(channel, boss);
}

function queuePrint(channel: TextChannel, boss: BossState) {
    void channel.send(`=====================================
**__:smiling_imp: บอส ${boss.boss} รอบ ${boss.round} :crossed_swords: ต้องการ ${boss.count} ไม้__**
=====================================
✅ = ตีได้เลย
⏸️ = พอสรอ ovf ตอนใกล้จบ
⏭️ = เริ่มบอสถัดไป`);
}

const countRows = [new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setCustomId('1')
            .setLabel('1')
            .setStyle('PRIMARY'),
    ).addComponents(
        new MessageButton()
            .setCustomId('2')
            .setLabel('2')
            .setStyle('PRIMARY'),
    ).addComponents(
        new MessageButton()
            .setCustomId('3')
            .setLabel('3')
            .setStyle('PRIMARY'),
    ).addComponents(
        new MessageButton()
            .setCustomId('4')
            .setLabel('4')
            .setStyle('PRIMARY'),
    ).addComponents(
        new MessageButton()
            .setCustomId('5')
            .setLabel('5')
            .setStyle('PRIMARY'),
    ),
new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setCustomId('6')
            .setLabel('6')
            .setStyle('PRIMARY'),
    ).addComponents(
        new MessageButton()
            .setCustomId('7')
            .setLabel('7')
            .setStyle('PRIMARY'),
    ).addComponents(
        new MessageButton()
            .setCustomId('8')
            .setLabel('8')
            .setStyle('PRIMARY'),
    ).addComponents(
        new MessageButton()
            .setCustomId('9')
            .setLabel('9')
            .setStyle('PRIMARY'),
    ).addComponents(
        new MessageButton()
            .setCustomId('10')
            .setLabel('10')
            .setStyle('PRIMARY'),
    )];