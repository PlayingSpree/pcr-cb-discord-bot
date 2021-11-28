import { CommandInteraction, Message, MessageReaction, TextChannel, User } from 'discord.js';
import { NotifyState, notifyStateData } from '../data/state';
import { loginfo } from '../util/logger';
import { reaction_numbers } from '../util/reaction';

export async function start(interaction: CommandInteraction) {
    const reply = await interaction.reply({ content: '**:crossed_swords: กด React ที่หมายเลขเพื่อรับการแจ้งเตือน เมื่อมีการเรียกตีบอสนั้น ๆ**\n:warning: การแจ้งเตือนจะถูกเอาออกอัตโนมัติหลังจากได้รับอนุมัติให้ตีบอสที่กดแจ้งเตือนไว้\n หากต้องการได้รับแจ้งเตือนบอสเดิม ให้มากดรับแจ้งเตือนบอสเดิมอีกรอบ', fetchReply: true }) as Message;

    notifyStateData.set(interaction.guildId, new NotifyState(interaction.channelId, reply.id));
    void reactNumberOnMessage(reply);
}

export function reactionEvent(reaction: MessageReaction, user: User, add: boolean) {
    const messageChannel = reaction.message.channel as TextChannel;
    const state = NotifyState.getState(notifyStateData, messageChannel.guildId);
    if (!state) return;
    const message = state.messageId == reaction.message.id;
    if (!message) return;
    if (!reaction.emoji.name) return;

    loginfo(`Notify React ${add ? 'add' : 'remove'}: ${reaction.emoji.name}`);
    const boss = reaction_numbers.indexOf(reaction.emoji.name);
    if (boss >= 1 && boss <= 5) {
        const bossIndex = boss - 1;
        if (add && !state.boss[bossIndex].includes(user.id)) state.boss[bossIndex].push(user.id);
        else if (!add && state.boss[bossIndex].includes(user.id)) state.boss[bossIndex] = state.boss[bossIndex].filter(id => id !== user.id);
    }
}

async function reactNumberOnMessage(message: Message) {
    for (let i = 1; i <= 5; i++)
        await message.react(reaction_numbers[i]);
}