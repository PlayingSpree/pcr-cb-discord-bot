const { MessageActionRow, MessageButton, Permissions } = require('discord.js');

class usedChannel {
    constructor(channel) {
        this.channel = channel;
        this.time = Date.now();
    }
}

const usedChannels = [];

async function tryClearChat(channel) {
    const isUsed = usedChannels.find(x => x.channel == channel.id);
    if (isUsed && (isUsed.time > Date.now() || isUsed.time == 0)) {
        isUsed.time = 0;
        channel.cmdreply.send({ content: 'กำลังลบข้อความทั้งหมด', ephemeral: true });
        await clearChat(channel);
        return;
    }
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('/clearchat')
                .setLabel('ยืนยัน')
                .setStyle('DANGER'),
        );
    channel.cmdreply.send({ content: `**:warning: ยังไม่เคยล้างแชทในช่องนี้มาก่อนในช่วงเร็ว ๆ นี้**\n\n**ชื่อช่อง: \`${channel.name}\`**\n\n:exclamation: กดปุ่มยืนยันหรือพิมพ์คำสั่งอีกครั้งภายใน 30 วินาทีเพื่อยืนยันการใช้งาน`, components: [row], ephemeral: true });
    usedChannels.push(new usedChannel(channel.id, Date.now() + 30000));
}

async function clearChat(channel) {
    console.log('Clearing all chat from ' + channel.name);
    const message = await channel.send(':warning: **__กำลังล้างแชทที่อยู่ด้านบน แต่พิมพ์กันได้ปกติน้า__** :warning:');
    let fetched;
    let error = false;
    const timeStart = new Date(Date.now() - 1500);
    do {
        try {
            fetched = await channel.messages.fetch({ limit: 100 });
            fetched = fetched.filter(m => (m.id !== message.id) && (m.createdAt <= timeStart));
            await channel.bulkDelete(fetched);
        }
        catch (err) {
            console.error(err.message);
            channel.send(err.message);
            error = true;
        }
        finally {
            channel.bulkDelete(fetched, true);
        }
    }
    while (fetched.size >= 2 && !error);
    message.edit('ล้างแชทเสร็จแล้วจ้า~');
    console.log('Chat cleared.');
    setTimeout(() => message.delete(), 5000);
}

module.exports = {
    name: 'clearchat',
    aliases: ['cc'],
    description: 'ลบแชทใน channel ทั้งหมด (Admin เท่านั้น)',
    permissions: Permissions.FLAGS.ADMINISTRATOR,
    guildOnly: true,
    async forceClear(channel, user) {
        usedChannels.push(channel);
        await clearChat(channel);
        return true;
    },
    execute(message, args) {
        tryClearChat(message.channel);
    },
    executeSlash(interaction) {
        tryClearChat(interaction.channel);
    },
    buttonInteractionEvent(interaction) {
        if (interaction.customId == '/clearchat') {
            const isUsed = usedChannels.find(x => x.channel == interaction.channel.id);
            isUsed.time = 0;
            interaction.channel.cmdreply = {
                send(data) {
                    interaction.reply(data);
                }
            };
            tryClearChat(interaction.channel);
        }
    }
};