const queueManager = require('../../app/queue/queue_manager.js');

const usedChannels = [];

async function clearChat(channel) {
    if (usedChannels.includes(channel)) {
        channel.cmdreply.send('กำลังลบข้อความทั้งหมด', { 'flags': 64 });
        console.log('Clearing all chat from ' + channel.name);
        let fetched;
        let error = false;
        do {
            try {
                fetched = await channel.messages.fetch({ limit: 100 });
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
        console.log('Chat cleared.');
        let reply = 'ล้างแชทเสร็จแล้วจ้า~ พิมพ์ต่อกันได้เลย';
        if (queueManager.stop(channel, false)) {
            reply = 'หยุดการอนุมัติบอสและล้างแชทเสร็จแล้วจ้า~ พิมพ์ต่อกันได้เลย';
        }
        const message = await channel.send(reply);
        setTimeout(() => message.delete(), 10000);
    }
    else {
        channel.cmdreply.send(':warning: ยังไม่เคยใช้คำสั่งนี้ในช่องนี้มาก่อนในช่วงเร็ว ๆ นี้\n:exclamation: พิมพ์คำสั่งอีกครั้งเพื่อยืนยันการใช้งาน');
        usedChannels.push(channel);
    }
}

module.exports = {
    name: 'clearchat',
    aliases: ['cc'],
    description: 'ลบแชทใน channel ทั้งหมด (Admin เท่านั้น)',
    permissions: 'ADMINISTRATOR',
    guildOnly: true,
    cooldown: 3,
    execute(message, args) {
        clearChat(message.channel);
    },
    executeSlash(interaction, args) {
        clearChat(interaction.channel);
    }
};