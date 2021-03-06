const { Permissions } = require('discord.js');

module.exports = {
    name: 'showconfig',
    aliases: ['showconf', 'listconfig', 'listconf'],
    description: 'แสดงรายการการตั้งค่าบอทสำหรับ server นี้ (Admin เท่านั้น)',
    permissions: Permissions.FLAGS.ADMINISTRATOR,
    execute(message, args) {
        const guildConf = message.client.settings.get(message.guild.id);

        const configProps = Object.keys(guildConf).map(prop => {
            return `${prop}: ${guildConf[prop]}`;
        });
        message.channel.send(`รายการการตั้งค่าบอททั้งหมดสำหรับ server นี้: \`\`\`${configProps.join('\n')}\`\`\``);
    }
};