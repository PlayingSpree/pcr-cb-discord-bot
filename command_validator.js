const Discord = require('discord.js');
const cooldowns = new Discord.Collection();

module.exports = function validate(command, message) {
    // Guild Check (guildOnly: true)
    if (command.guildOnly && message.channel.type === 'dm') {
        return 'ไม่สามารถใช้คำสั่งนี้ได้ในช่องพูดคุยส่วนตัว';
    }

    // Permission Check (permissions: string)
    const author = message.author ?? message.member;

    if (command.permissions) {
        const authorPerms = message.channel.permissionsFor(author);
        if (!authorPerms || !authorPerms.has(command.permissions)) {
            return `ใช้ได้เฉพาะ User ที่มี Permission ${command.permissions} เท่านั้น`;
        }
    }

    // Cooldown Check (cooldown: num)
    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 0.5) * 1000;

    if (timestamps.has(author.id)) {
        const expirationTime = timestamps.get(author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return `กรุณารออีก ${timeLeft.toFixed(1)} วินาที ก่อนใช้คำสั่ง \`${command.name}\` อีกครั้ง.`;
        }
    }
    timestamps.set(author.id, now);
    setTimeout(() => timestamps.delete(author.id), cooldownAmount);

    return false;
};