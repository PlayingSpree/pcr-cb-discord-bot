const queueManager = require('../../app/queue/queue_manager.js');
const subCommandManager = require('../../sub_command_manager.js');
const clearchat = require('../utility/clearchat.js');

const subCommands = [{
    name: 'list',
    aliases: ['l'],
    usage: 'รายชื่อคนที่ได้รับอนุมัติไปแล้ว',
    execute(message, args) {
        queueManager.print(message.channel);
    },
    executeSlash(interaction, args) {
        queueManager.print(interaction.channel);
    }
}, {
    name: 'stop',
    aliases: ['s'],
    usage: 'หยุดการอนุมัติตีบอส',
    execute(message, args) {
        queueManager.stop(message.channel);
    },
    executeSlash(interaction, args) {
        queueManager.stop(interaction.channel);
    }
}, {
    name: 'add',
    aliases: ['a'],
    usage: '<-p> [@user] เพิ่มคนที่ Mention ในรายชื่ออนุมัติ (เพิ่มทีละหลายคนได้) สามารถเพิ่ม -p เพื่อให้พอสรอได้',
    execute(message, args) {
        if (message.mentions.users.size > 0) {
            if (args.length > 0 && args[0] == '-p') {
                queueManager.add(message.channel, [...message.mentions.users.values()], true);
            }
            else {
                queueManager.add(message.channel, [...message.mentions.users.values()], false);
            }
        }
        else {
            const prefix = message.client.settings.get(message.guild.id).prefix;
            return message.channel.send(`กรุณา Mention User ที่ต้องการเพิ่ม\nวิธีใช้: ${prefix}${this.name} ${this.usage}`);
        }
    },
    async executeSlash(interaction, args) {
        const users = [];
        for (const arg of ['user1', 'user2', 'user3', 'user4', 'user5']) {
            const options = args.get(arg);
            if (options) {
                users.push(options.member ?? options.user);
            }
        }
        queueManager.add(interaction.channel, users, args.pause);
    }
}, {
    name: 'remove',
    aliases: ['r'],
    usage: '[@user] ลบคนที่ Mention ในรายชื่ออนุมัติ (ลบทีละหลายคนได้)',
    execute(message, args) {
        if (message.mentions.users.size > 0) {
            queueManager.remove(message.channel, [...message.mentions.users.values()]);
        }
        else {
            const prefix = message.client.settings.get(message.guild.id).prefix;
            return message.channel.send(`กรุณา Mention User ที่ต้องการเพิ่ม\nวิธีใช้: ${prefix}${this.name} ${this.usage}`);
        }
    },
    async executeSlash(interaction, args) {
        const users = [];
        for (const arg of ['user1', 'user2', 'user3', 'user4', 'user5']) {
            const options = args.get(arg);
            if (options) {
                users.push(options.member ?? options.user);
            }
        }
        queueManager.remove(interaction.channel, users);
    }
}, {
    name: 'doi',
    aliases: ['d'],
    usage: '<-r> [@user] เพิ่มสถานะติดดอย ให้กับคนที่ Mention ในรายชื่ออนุมัติ (เพิ่มทีละหลายคนได้) สามารถเพิ่ม -r เพื่อลบสถานะติดดอยได้',
    execute(message, args) {
        if (message.mentions.users.size > 0) {
            if (args.length > 0 && args[0] == '-r') {
                queueManager.doi(message.channel, [...message.mentions.users.values()], false);
            }
            else {
                queueManager.doi(message.channel, [...message.mentions.users.values()]);
            }
        }
        else {
            const prefix = message.client.settings.get(message.guild.id).prefix;
            return message.channel.send(`กรุณา Mention User ที่ต้องการเพิ่ม\nวิธีใช้: ${prefix}${this.name} ${this.usage}`);
        }
    },
    async executeSlash(interaction, args) {
        const users = [];
        for (const arg of ['user1', 'user2', 'user3', 'user4', 'user5']) {
            const options = args.get(arg);
            if (options) {
                users.push(options.member ?? options.user);
            }
        }
        queueManager.doi(interaction.channel, users, !args.remove);
    }
}, {
    name: 'unpause',
    aliases: ['up'],
    usage: 'Mention คนที่พอสอยู่ในรายชื่ออนุมัติ และลบสถานะ Pause',
    execute(message, args) {
        queueManager.unpause(message.channel);
    },
    executeSlash(interaction, args) {
        queueManager.unpause(interaction.channel);
    }
}, {
    name: 'edit',
    usage: '[เลขบอส] [รอบบอส] [จำนวนทีมที่ใช้ในบอสนี้] แก้ไขรายละเอียดการอนุมัติบอส (ใช้ได้เฉพาะ Slash Commands)',
    executeSlash(interaction, args) {
        if (args.get('count') || args.get('boss')?.value || args.get('round')?.value) {
            return queueManager.edit(interaction.channel, args.get('count')?.value, args.get('boss')?.value, args.get('round')?.value);
        }
        interaction.channel.cmdreply.send({ content: 'กรุณาใส่ค่าอย่างน้อย 1 ช่อง', ephemeral: true });
    }
}];

module.exports = {
    name: 'queue',
    aliases: ['q'],
    description: 'ใช้เตรียมอนุมัติตีบอส',
    usage: '<-n> [เลขบอส] [รอบบอส] [จำนวนทีมที่ใช้ในบอสนี้] เริ่มการอนุมัติตีบอส ใส่เลขบอสเพื่อเรียกคนที่จองบอสไว้ได้ หากใส่ -n (next) จะเรียกบอสถัดไปโดยไม่ต้องใส่บอสและรอบ และถ้าเป็น Admin จะล้างแชทอัตโนมัติ' + subCommandManager.getSubCommandsUsage(subCommands),
    guildOnly: true,
    async execute(message, args) {
        const guildConfig = message.client.settings.get(message.guild.id);
        const prefix = guildConfig.prefix;
        // Check Role
        if (!message.member.roles.cache.some(role => role.name === guildConfig.approvalRole)) {
            return message.channel.send(`ท่านต้องมี Role: \`${guildConfig.approvalRole}\` ถึงจะใช้งานได้`);
        }
        // Sub commands
        if (subCommandManager.execute(subCommands, message, args)) {
            return;
        }
        // Validation
        if (args.length < 2) {
            return message.channel.send(`arguments ไม่พอ\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);
        }
        const n = args.indexOf('-n');
        if (n !== -1) {
            const err = queueManager.isRunning(message.channel);
            if (err != null) {
                return message.channel.send(err);
            }
            args.splice(n, 1);
            clearchat.forceClear(message.channel, message.member);
        }
        if (args.length < 3 && n !== -1) {
            return message.channel.send(`arguments ไม่พอ\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);
        }
        const teamCount = parseInt(args[2]);
        if (isNaN(teamCount)) {
            return message.channel.send(`จำนวนไม้ ต้องเป็นตัวเลข\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);
        }
        if (teamCount <= 0) {
            return message.channel.send(`จำนวนไม้ ต้องมากกว่า 0\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);
        }
        if (args.length >= 3) {
            const boss = parseInt(args[0]);
            if (isNaN(boss)) {
                return message.channel.send(`boss ต้องเป็นตัวเลข\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);
            }
            if (boss <= 0) {
                return message.channel.send(`boss ต้องมากกว่า 0\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);
            }
            if (boss > 5) {
                return message.channel.send(`boss ต้องน้อยกว่า 5\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);
            }
            const round = parseInt(args[1]);
            if (isNaN(round)) {
                return message.channel.send(`round ต้องเป็นตัวเลข\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);
            }
            if (round <= 0) {
                return message.channel.send(`round ต้องมากกว่า 0\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);
            }
            queueManager.start(message.channel, teamCount, n !== -1, boss, round);
        }
        else {
            queueManager.start(message.channel, teamCount);
        }
        message.delete();
    },
    async executeSlash(interaction) {
        // Check Role
        const guildConfig = interaction.client.settings.get(interaction.guild.id);
        if (!interaction.member.roles.cache.some(role => role.name === guildConfig.approvalRole)) {
            return interaction.channel.cmdreply.send({ content: `ท่านต้องมี Role: \`${guildConfig.approvalRole}\` ถึงจะใช้งานได้`, ephemeral: true });
        }
        // Run
        const subArgs = interaction.options.first().options;
        const subName = interaction.options.first().name;
        const next = interaction.options.first().name === 'next';
        if (subName === 'start' || next) {
            if (next) {
                const err = queueManager.isRunning(interaction.channel);
                if (err != null) {
                    return interaction.channel.cmdreply.send({ content: err, ephemeral: true });
                }
                clearchat.forceClear(interaction.channel, interaction.member);
            }
            queueManager.start(interaction.channel, subArgs.get('count').value, next, subArgs.get('boss')?.value, subArgs.get('round')?.value);
        }
        else {
            subCommandManager.executeSlash(subCommands, subName, interaction, subArgs);
        }
    }
};