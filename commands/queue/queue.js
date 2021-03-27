const queueManager = require('../../queue/queue_manager.js');
const subCommandManager = require('../../sub_command_manager.js');
const slashManager = require('../../slash_commands/slash_commands_manager.js');

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
    usage: '[บอส] [จำนวนทีมที่ใช้ในบอสนี้] เริ่มการอนุมัติตีบอส' + subCommandManager.getSubCommandsUsage(subCommands),
    guildOnly: true,
    execute(message, args) {
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
        const teamCount = parseInt(args[1]);
        if (isNaN(teamCount)) {
            return message.channel.send(`arguments ที่ 2 ต้องเป็นตัวเลข\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);
        }
        if (teamCount <= 0) {
            return message.channel.send(`arguments ที่ 2 ต้องมากกว่า 0\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);
        }
        // Run
        queueManager.start(message.channel, teamCount, args[0]);
        message.delete();
    },
    executeSlash(interaction) {
        // Check Role
        const guildConfig = interaction.client.settings.get(interaction.guild.id);
        if (!interaction.member.roles.cache.some(role => role.name === guildConfig.approvalRole)) {
            return interaction.channel.cmdreply.send(`ท่านต้องมี Role: \`${guildConfig.approvalRole}\` ถึงจะใช้งานได้`, { 'flags': 64 });
        }
        // Run
        if (interaction.data.options[0].name === 'start') {
            const args = slashManager.parseArgs(interaction.data.options[0].options);
            queueManager.start(interaction.channel, args.count, args.bossname);
        }
        else {
            const args = slashManager.parseArgs(interaction.data.options[0].options);
            subCommandManager.executeSlash(subCommands, interaction.data.options[0].name, interaction, args);
        }
    }
};