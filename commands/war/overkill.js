const appConfig = require('../../config.json');

function calcOverkill(hp, dmg1, dmg2) {
    let dmgNeed = ((hp - dmg1) / (appConfig.overkill_time_gain / 90)).toFixed(dmg1 < 1000 ? 2 : 0);
    let time = null;
    if (dmg2) {
        dmgNeed = (hp - dmg1 - (dmg2 * (appConfig.overkill_time_gain / 90))).toFixed(dmg1 < 1000 ? 2 : 0);
        time = Math.floor(Math.min((90 + appConfig.overkill_time_gain) - (90 * ((hp - dmg1) / dmg2)), 90));
        if (time >= 60) {
            time = `${Math.floor(time / 60)}:${time - 60 < 10 ? `0${time - 60}` : time - 60}`;
        }
        else {
            time = `0:${time < 10 ? `0${time}` : time}`;
        }
        return `:smiling_imp: เลือดบอส: \`${hp}\` :crossed_swords: ดาเมจทีม 1:  \`${dmg1}\`${dmg2 ? ` :crossed_swords: ดาเมจทีม 2:  \`${dmg2}\`` : ''}
        \n**:clock1: เวลาที่ได้ในรอบถัดไปถ้า Overkill**\n\`${time}\`${time == '1:30' ? '' : `
        \n**:crossed_swords: ดาเมจแต่งเลือดบอสที่ต้องทำเพื่อได้ 90s**\n\`${dmgNeed + '`'}`}`;
    }
    else {
        return `:smiling_imp: เลือดบอส: \`${hp}\` :crossed_swords: ดาเมจทีม 1:  \`${dmg1}\`${dmg2 ? ` :crossed_swords: ดาเมจทีม 2:  \`${dmg2}\`` : ''}
        \n**:crossed_swords: ดาเมจทีม 2 ที่ต้องทำได้เพื่อได้ 90s**\n\`${dmgNeed + '`'}`;
    }
}

function validateOverkill(hp, dmg1, dmg2) {
    const args = [hp, dmg1, dmg2];
    for (let i = 0; i < (dmg2 ? 3 : 2); i++) {
        const n = parseFloat(args[i]);
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
    usage: '[HPบอส] [ดาเมจทีม1] <ดาเมจทีม2> สามารถใส่ดาเมจแค่ทีมเดียวเพื่อดูดาเมจที่ต้องทำได้ในทีม 2',
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
    executeSlash(interaction) {
        const hp = interaction.options.get('hp').value;
        const dmg1 = interaction.options.get('hp').value;
        const dmg2 = interaction.options.get('hp').value;

        const [invalid, _] = validateOverkill(hp, dmg1, dmg2);
        if (invalid) return interaction.channel.cmdreply.send({ content: invalid, ephemeral: true });

        interaction.channel.cmdreply.send(calcOverkill(hp, dmg1, dmg2));
    }
};