const queueManager = require('../../app/queue/queue_manager.js');
const subCommandManager = require('../../sub_command_manager.js');
const slashManager = require('../../slash_commands/slash_commands_manager.js');
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
        for (const arg in args) {
            if (arg.includes('user')) {
                users.push(await interaction.client.users.fetch(args[arg]));
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
        for (const arg in args) {
            if (arg.includes('user')) {
                users.push(await interaction.client.users.fetch(args[arg]));
            }
        }
        queueManager.remove(interaction.channel, users);
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
}];

module.exports = {
    name: 'queue',
    aliases: ['q'],
    description: 'ใช้เตรียมอนุมัติตีบอส',
    usage: '<-n> [บอส] [จำนวนทีมที่ใช้ในบอสนี้] (เลขบอส) (รอบบอส) เริ่มการอนุมัติตีบอส สามารถใส่บอสเพื่อเรียกคนที่จองบอสไว้ได้ หากใส่ -n (next) จะเรียกบอสถัดไปโดยไม่ต้องใส่บอสและรอบ และถ้าเป็น Admin จะล้างแชทอัตโนมัติ' + subCommandManager.getSubCommandsUsage(subCommands),
    guildOnly: true,
    async execute(message, args) {
        const guildConfig = message.client.settings.get(message.guild.id);
        const prefix = guildConfig.prefix;
        // Check Role
        if (!message.member.roles.cache.some(role => role.name === guildConfig.approvalRole)) {
            return message.channel.send(`ท่านต้องมี Role: \`${guildConfig.approvalRole}\` ถึงจะใช้งานได้`);
        }
        // Sub commands
        if (subCommandManager.execute(subCommands, message, args)) return;
        // Validation
        if (args.length < 2) {
            return message.channel.send(`arguments ไม่พอ\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);
        }
        const n = args.indexOf('-n');
        if (n !== -1) {
            args.splice(n, 1)
            await clearchat.forceClear(message.channel, message.member)
        }
        const teamCount = parseInt(args[1]);
        if (isNaN(teamCount)) {
            return message.channel.send(`arguments ที่ 2 ต้องเป็นตัวเลข\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);
        }
        if (teamCount <= 0) {
            return message.channel.send(`arguments ที่ 2 ต้องมากกว่า 0\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);
        }
        if (args.length >= 4) {
            const boss = parseInt(args[2]);
            if (isNaN(boss)) {
                return message.channel.send(`boss ต้องเป็นตัวเลข\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);
            }
            if (boss <= 0) {
                return message.channel.send(`boss ต้องมากกว่า 0\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);
            }
            if (boss > 5) {
                return message.channel.send(`boss ต้องน้อยกว่า 5\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);
            }
            const round = parseInt(args[3]);
            if (isNaN(round)) {
                return message.channel.send(`round ต้องเป็นตัวเลข\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);
            }
            if (round <= 0) {
                return message.channel.send(`round ต้องมากกว่า 0\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);
            }
            queueManager.start(message.channel, teamCount, args[0], n !== -1, boss, round);
        }
        else {
            queueManager.start(message.channel, teamCount, args[0]);
        }
        message.delete();
    },
    async executeSlash(interaction, args) {
        // Check Role
        const guildConfig = interaction.client.settings.get(interaction.guild.id);
        if (!interaction.member.roles.cache.some(role => role.name === guildConfig.approvalRole)) {
            return interaction.channel.cmdreply.send(`ท่านต้องมี Role: \`${guildConfig.approvalRole}\` ถึงจะใช้งานได้`, { 'flags': 64 });
        }
        const subArgs = slashManager.parseArgs(interaction.data.options[0].options);
        // Run
        const next = interaction.data.options[0].name === 'next';
        if (interaction.data.options[0].name === 'start' || next) {
            if (next) {
                interaction.channel.cmdreply.send('กำลังล้างแชทและเรียกบอสรอบถัดไป', { 'flags': 64 });
                await clearchat.forceClear(interaction.channel, interaction.member)
            }
            queueManager.start(interaction.channel, subArgs.count, subArgs.bossname, next, subArgs.boss ?? null, subArgs.round ?? null);
        }
        else {
            subCommandManager.executeSlash(subCommands, interaction.data.options[0].name, interaction, subArgs);
        }
    }
};