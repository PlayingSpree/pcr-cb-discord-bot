const appConfig = require('../../config.json');

function calcOverkill(hp, dmg1, dmg2) {
    const dmgNeed = Math.ceil((hp - dmg1) / (appConfig.overkill_time_gain / 90));
    let time = null;
    if (dmg2) {
        time = Math.floor(Math.min((90 + appConfig.overkill_time_gain) - (90 * ((hp - dmg1) / dmg2)), 90));
        if (time >= 60) {
            time = `${Math.floor(time / 60)}:${time - 60 < 10 ? `0${time - 60}` : time - 60}`;
        }
        else {
            time = `0:${time < 10 ? `0${time}` : time}`;
        }
    }
    return `:smiling_imp: เลือดบอส: \`${hp}\` :crossed_swords: ดาเมจทีม 1:  \`${dmg1}\`${dmg2 ? ` :crossed_swords: ดาเมจทีม 2:  \`${dmg2}\`` : ''}\n**:crossed_swords: ดาเมจทีม 2 ที่ต้องทำได้เพื่อได้ 90s**\n\`${dmgNeed + '`'}${time !== null ? `\n**:clock1: เวลาที่ได้ในรอบถัดไปถ้า Overkill**\n\`${time + '`'}` : ''}`;
}

function validateOverkill(hp, dmg1, dmg2) {
    const args = [hp, dmg1, dmg2];
    for (let i = 0; i < (dmg2 ? 3 : 2); i++) {
        const n = parseInt(args[i]);
        if (isNaN(n)) {
            return [`arguments ที่ ${i + 1} ต้องเป็นตัวเลข`, args];
        }
        if (n <= 0) {
            return [`arguments ที่ ${i + 1} ต้องมากกว่า 0`, args];
        }
        args[i] = n;
    }
    if (dmg2 && args[0] > (args[1] + args[2])) {
        return ['ไม่สามารถล้มบอสได้', args];
    }
    return [null, args];
}

module.exports = {
    name: 'overkill',
    aliases: ['ovk'],
    description: 'คำนวณเวลาและดาเมจหาก Overkill',
    usage: '[HPบอส] [ดาเมจทีม1] ([ดาเมจทีม2]) สามารถใส่ดาเมจแค่ทีมเดียวเพื่อดูดาเมจที่ต้องทำได้ในทีม 2',
    execute(message, args) {
        const guildConfig = message.client.settings.get(message.guild.id);
        const prefix = guildConfig.prefix;
        // Validation
        if (args.length < 2) {
            return message.channel.send(`arguments ไม่พอ\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);
        }
        if (args.length == 2) {
            args[2] = null;
        }
        let invalid = null;
        [invalid, args] = validateOverkill(args[0], args[1], args[2]);
        if (invalid) return message.channel.send(`${invalid}\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);

        return message.channel.send(calcOverkill(args[0], args[1], args[2]));
    },
    executeSlash(interaction, args) {
        let invalid = null;
        let _ = null;
        [invalid, _] = validateOverkill(args.hp, args.dmg1, args.dmg2);
        if (invalid) return interaction.channel.cmdreply.send(invalid, { 'flags': 64 });

        interaction.channel.cmdreply.send(calcOverkill(args.hp, args.dmg1, args.dmg2));
    }
};