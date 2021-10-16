import { ButtonInteraction, CommandInteraction, MessageActionRow, MessageButton, TextChannel } from 'discord.js';
import { MessageButtonStyles } from 'discord.js/typings/enums';
import { clearChatStateData } from '../data/state';
import { logerror, loginfo } from '../util/logger';

const confirmTime = 30000;

export async function tryClearChat(interaction: CommandInteraction | ButtonInteraction) {
    const channel = interaction.channel as TextChannel;
    const isUsed = clearChatStateData.get(channel.id);
    if (isUsed && (isUsed > Date.now() || isUsed == 0)) {
        clearChatStateData.set(channel.id, 0);
        void interaction.reply({ content: 'กำลังลบข้อความทั้งหมด', ephemeral: true });
        await clearChat(channel);
        return;
    }
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('/clearchat')
                .setLabel('ยืนยัน')
                .setStyle(MessageButtonStyles.DANGER),
        ).addComponents(
            new MessageButton()
                .setCustomId('!messagedeleteself')
                .setLabel('ยกเลิก')
                .setStyle(MessageButtonStyles.SECONDARY),
        );
    clearChatStateData.set(channel.id, Date.now() + confirmTime);
    void interaction.reply({ content: `**:warning: ยังไม่เคยล้างแชทในช่องนี้มาก่อนในช่วงเร็ว ๆ นี้**\n\n**ชื่อช่อง: \`${channel.name}\`**\n\n:exclamation: กดปุ่มยืนยันหรือพิมพ์คำสั่งอีกครั้งภายใน ${confirmTime / 1000} วินาทีเพื่อยืนยันการใช้งาน`, components: [row] });
    setTimeout(() => interaction.deleteReply().catch(_ => { }), confirmTime);
}

async function clearChat(channel: TextChannel) {
    loginfo('Clearing all chat from ' + channel.name);
    const message = await channel.send(':warning: **__กำลังล้างแชทที่อยู่ด้านบน แต่พิมพ์กันได้ปกติน้า__** :warning:');
    const timeStart = new Date(Date.now() - 200);
    let fetched;
    try {
        do {
            fetched = await channel.messages.fetch({ limit: 100 });
            fetched = fetched.filter(m => (m.id !== message.id) && (m.createdAt <= timeStart));
            await channel.bulkDelete(fetched);
        }
        while (fetched.size >= 1);
    }
    catch (err) {
        const e = err as Error;
        logerror(e);
        void channel.send(e.message);
    }

    void message.edit('ล้างแชทเสร็จแล้วจ้า~');
    loginfo('Chat cleared.');
    setTimeout(() => message.delete(), 5000);
}