const notifyManager = require('../../notify/notify_manager.js');
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
    usage: '[บอสเริ่มต้น] [รอบเริ่มต้น] [จำนวนไม้ในแต่ละบอส...] (ใส่ไม้ตามบอสที่จะตี) เพิ่มรอบแจ้งเตือนบอส',
    execute(message, args) {
        const guildConfig = message.client.settings.get(message.guild.id);
        const prefix = guildConfig.prefix;
        // Validation
        if (args.length < 3) {
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
        notifyManager.add(message.channel, boss, round, args.slice(2));
        message.delete();
    },
    executeSlash(interaction, args) {
        notifyManager.add(interaction.channel, args.boss, args.round, args.count.trim().split(/ +/));
    }
}];

module.exports = {
    name: 'notify',
    aliases: ['n'],
    description: 'ใช้เตรียมระบบแจ้งเตือนบอสที่จะมาถึง',
    usage: '[บอสเริ่มต้น] [รอบเริ่มต้น] [จำนวนไม้ในแต่ละบอส...] (ใส่ไม้ตามบอสที่จะตี) แสดงหน้าจองบอส' + subCommandManager.getSubCommandsUsage(subCommands),
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
        if (args.length < 3) {
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
        // Run
        notifyManager.start(message.channel, boss, round, args.slice(2));
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
            notifyManager.start(interaction.channel, subArgs.boss, subArgs.round, subArgs.count.trim().split(/ +/));
        }
        else {
            subCommandManager.executeSlash(subCommands, interaction.data.options[0].name, interaction, subArgs);
        }
    }
};