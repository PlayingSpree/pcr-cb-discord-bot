const { Permissions } = require('discord.js');

module.exports = {
    name: 'setconfig',
    aliases: ['setconf'],
    description: 'ตั้งค่าบอทสำหรับ server นี้ (Admin เท่านั้น)',
    usage: '[key] [value]',
    permissions: Permissions.FLAGS.ADMINISTRATOR,
    execute(message, args) {
        const guildConfig = message.client.settings.get(message.guild.id);
        const prefix = guildConfig.prefix;

        const [prop, ...value] = args;

        if (!prop || !value.length) {
            return message.channel.send(`arguments ไม่พอ\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);
        }

        if (!message.client.settings.has(message.guild.id, prop)) {
            return message.reply(`ไม่พบการตั้งค่าที่ต้องการเปลี่ยน ดูการตั้งค่าทั้งหมด ${prefix}showconfig`);
        }

        message.client.settings.set(message.guild.id, value.join(' '), prop);
        console.log(`Guild configuration item ${prop} has been changed to:\n\`${value.join(' ')}\``);
        message.channel.send(`เปลี่ยนการตั้งค่า ${prop} เป็น:\n\`${value.join(' ')}\``);
    }
};