const queueManager = require('../../queue/queue_manager.js');
const subCommandManager = require('../../sub_command_manager.js');

const subCommands = [{
    name: 'list',
    aliases: ['l'],
    usage: 'รายชื่อคนที่ได้รับอนุมัติไปแล้ว',
    execute(message, args) {
        queueManager.printQueue(message.channel);
    }
}, {
    name: 'stop',
    aliases: ['s'],
    usage: 'หยุดการอนุมัติตีบอส',
    execute(message, args) {
        queueManager.stopQueue(message.channel);
    }
}, {
    name: 'add',
    aliases: ['a'],
    usage: '[@user] เพิ่มคนที่ Mention ในรายชื่ออนุมัติ (เพิ่มทีละหลายคนได้)',
    execute(message, args) {
        if (message.mentions.users.size > 0) {
            queueManager.queueAdd(message.channel, [...message.mentions.users.values()]);
            queueManager.printQueue();
        }
        else {
            const prefix = message.client.settings.get(message.guild.id).prefix;
            message.channel.send(`กรุณา Mention User ที่ต้องการเพิ่ม\nวิธีใช้: ${prefix}${this.name} ${this.usage}`);
            return;
        }
    }
}, {
    name: 'remove',
    aliases: ['r'],
    usage: '[@user] ลบคนที่ Mention ในรายชื่ออนุมัติ (ลบทีละหลายคนได้)',
    execute(message, args) {
        if (message.mentions.users.size > 0) {
            queueManager.queueRemove(message.channel, [...message.mentions.users.values()]);
            queueManager.printQueue();
        }
        else {
            const prefix = message.client.settings.get(message.guild.id).prefix;
            message.channel.send(`กรุณา Mention User ที่ต้องการเพิ่ม\nวิธีใช้: ${prefix}${this.name} ${this.usage}`);
            return;
        }
    }
}];

module.exports = {
    name: 'queue',
    aliases: ['q'],
    description: 'ใช้เตรียมอนุมัติตีบอส',
    usage: '[บอส] [จำนวนทีมที่ใช้ในบอสนี้] เริ่มการอนุมัติตีบอส' + subCommandManager.getSubCommandsUsage(subCommands),
    guildOnly: true,
    execute(message, args) {
        const guildConfig = message.client.settings.get(message.guild.id);
        const prefix = guildConfig.prefix;
        // Check Role
        if (!message.member.roles.cache.some(role => role.name === guildConfig.approvalRole)) {
            message.channel.send(`ท่านต้องมี Role: \`${guildConfig.approvalRole}\` ถึงจะใช้งานได้`);
            return;
        }
        // Sub commands
        if (subCommandManager.execute(subCommands, message, args)) return;
        // Validation
        if (args.length < 2) {
            message.channel.send(`arguments ไม่พอ\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);
            return;
        }
        const teamCount = parseInt(args[1]);
        if (isNaN(teamCount)) {
            message.channel.send(`arguments ที่ 2 ต้องเป็นตัวเลข\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);
            return;
        }
        if (teamCount <= 0) {
            message.channel.send(`arguments ที่ 2 ต้องมากกว่า 0\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);
            return;
        }
        // run
        queueManager.startQueue(message.channel, teamCount);
        message.channel.send(`บอส ${args[0]} มาแล้ว ต้องการ ${teamCount} ไม้ โพสรูปแล้วรออนุมัติ เมื่อได้รับอนุมัติแล้วก็ตีได้เลยจ้า~`);
        message.delete();
    }
};