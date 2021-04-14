const notifyManager = require('../../app/notify/notify_manager.js');
const subCommandManager = require('../../sub_command_manager.js');
const slashManager = require('../../slash_commands/slash_commands_manager.js');

const subCommands = [{
    name: 'stop',
    aliases: ['s'],
    usage: 'รีเซ็ตการแจ้งเตือนบอส',
    execute(message, args) {
        notifyManager.stop(message.channel);
    },
    executeSlash(interaction, args) {
        notifyManager.stop(interaction.channel);
    }
}, {
    name: 'add',
    aliases: ['a'],
    usage: '[รอบ] เพิ่มรอบแจ้งเตือนบอส',
    execute(message, args) {
        const guildConfig = message.client.settings.get(message.guild.id);
        const prefix = guildConfig.prefix;
        notifyManager.add(message.channel);
        message.delete();
    },
    executeSlash(interaction, args) {
        notifyManager.add(interaction.channel);
        channel.cmdreply.send('เพิ่มรอบเรียบร้อยแล้ว', { 'flags': 64 });
    }
}, {
    name: 'call',
    aliases: ['c'],
    usage: '[บอส] [รอบ] <ข้อความ> แจ้งเตือนบอส',
    execute(message, args) {
        const guildConfig = message.client.settings.get(message.guild.id);
        const prefix = guildConfig.prefix;
        if (args.length < 2) {
            return message.channel.send(`arguments ไม่พอ\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);
        }
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
        notifyManager.call(message.channel, boss, round, args.slice(2).join(' '));
        message.delete();
    },
    executeSlash(interaction, args) {
        notifyManager.call(interaction.channel, args.boss, args.round, args.message);
    }
}];

module.exports = {
    name: 'notify',
    aliases: ['n'],
    description: 'ใช้เตรียมระบบแจ้งเตือนบอสที่จะมาถึง',
    usage: '[รอบ] <รอบสิ้นสุด> แสดงหน้าจองบอส' + subCommandManager.getSubCommandsUsage(subCommands),
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
        if (args.length < 1) {
            return message.channel.send(`arguments ไม่พอ\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);
        }
        const round = parseInt(args[0]);
        if (isNaN(round)) {
            return message.channel.send(`round ต้องเป็นตัวเลข\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);
        }
        if (round <= 0) {
            return message.channel.send(`round ต้องมากกว่า 0\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);
        }
        let roundEnd = round;
        if (args.length > 1) {
            roundEnd = parseInt(args[1]);
            if (isNaN(roundEnd)) {
                return message.channel.send(`roundend ต้องเป็นตัวเลข\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);
            }
            if (roundEnd < round) {
                return message.channel.send(`roundend ต้องมากกว่า round\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);
            }
        }
        // Run
        notifyManager.start(message.channel, round, roundEnd);
        message.delete();
    },
    executeSlash(interaction, args) {
        // Check Role
        const guildConfig = interaction.client.settings.get(interaction.guild.id);
        if (!interaction.member.roles.cache.some(role => role.name === guildConfig.approvalRole)) {
            return interaction.channel.cmdreply.send(`ท่านต้องมี Role: \`${guildConfig.approvalRole}\` ถึงจะใช้งานได้`, { 'flags': 64 });
        }
        // Run
        const subArgs = slashManager.parseArgs(interaction.data.options[0].options);
        if (interaction.data.options[0].name === 'start') {
            if ((subArgs.roundend ?? -1) < subArgs.round) {
                return interaction.channel.cmdreply.send('roundend ต้องมากกว่า round', { 'flags': 64 });
            }
            notifyManager.start(interaction.channel, subArgs.round, subArgs.roundend);
        }
        else {
            subCommandManager.executeSlash(subCommands, interaction.data.options[0].name, interaction, subArgs);
        }
    }
};