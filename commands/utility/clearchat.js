const queueManager = require('../../app/queue/queue_manager.js');

const usedChannels = [];

async function tryClearChat(channel) {
    if (usedChannels.includes(channel)) {
        channel.cmdreply.send('กำลังลบข้อความทั้งหมด', { 'flags': 64 });
        await clearChat(channel);
    }
    else {
        channel.cmdreply.send(':warning: ยังไม่เคยล้างแชทในช่องนี้มาก่อนในช่วงเร็ว ๆ นี้\n:exclamation: พิมพ์คำสั่งอีกครั้งเพื่อยืนยันการใช้งาน', { 'flags': 64 });
        usedChannels.push(channel);
    }
}

async function clearChat(channel) {
    console.log('Clearing all chat from ' + channel.name);
    const message = await channel.send(':warning: **__กำลังล้างแชทที่อยู่ด้านบน แต่พิมพ์กันได้ปกติน้า__** :warning:');
    let fetched;
    let error = false;
    const timeStart = new Date(Date.now() - 1000);
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
    permissions: 'ADMINISTRATOR',
    guildOnly: true,
    cooldown: 3,
    async forceClear(channel, user) {
        const authorPerms = channel.permissionsFor(user);
        if (!authorPerms || !authorPerms.has(this.permissions)) {
            channel.cmdreply.send(`ล้างแชทใช้ได้เฉพาะ User ที่มี Permission ${this.permissions} เท่านั้น`, { 'flags': 64 });
            return false;
        }
        usedChannels.push(channel);
        await clearChat(channel);
        return true;
    },
    execute(message, args) {
        tryClearChat(message.channel);
    },
    executeSlash(interaction, args) {
        tryClearChat(interaction.channel);
    }
};