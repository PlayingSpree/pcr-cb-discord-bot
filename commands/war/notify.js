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
    executeSlash(interaction) {
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
    executeSlash(interaction) {
        notifyManager.add(interaction.channel);
        interaction.channel.cmdreply.send({ content: 'เพิ่มรอบเรียบร้อยแล้ว', ephemeral: true });
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
    executeSlash(interaction) {
        const args = interaction.options;
        notifyManager.call(interaction.channel, args.get('boss').value, args.get('round').value, args.get('message').value);
    }
}];

module.exports = {
    name: 'notify',
    aliases: ['n'],
    description: 'ใช้เตรียมระบบแจ้งเตือนบอสที่จะมาถึง',
    usage: '[รอบ] <รอบสิ้นสุด> <บอสเริ่มต้น> <บอสสิ้นสุด> แสดงหน้าจองบอส' + subCommandManager.getSubCommandsUsage(subCommands),
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
    executeSlash(interaction) {
        // Check Role
        const guildConfig = interaction.client.settings.get(interaction.guildId);
        if (!interaction.member.roles.cache.some(role => role.name === guildConfig.approvalRole)) {
            return interaction.channel.cmdreply.send({ content: `ท่านต้องมี Role: \`${guildConfig.approvalRole}\` ถึงจะใช้งานได้`, ephemeral: true });
        }
        // Run
        const subArgs = interaction.options.first().options;
        const subName = interaction.options.first().name;
        if (subName === 'start') {
            const round = subArgs.get('round').value;
            const roundend = subArgs.get('roundend').value;
            const boss = subArgs.get('boss').value;
            const bossend = subArgs.get('bossend').value;

            if ((roundend ?? -1) < round) {
                return interaction.channel.cmdreply.send({ content: 'roundend ต้องมากกว่า round', ephemeral: true });
            }
            if (((roundend ?? round) == round) && (bossend ?? -1) < (boss ?? -2)) {
                return interaction.channel.cmdreply.send({ content: 'bossend ต้องมากกว่า boss', ephemeral: true });
            }
            notifyManager.start(interaction.channel, round, roundend, boss, bossend);
        }
        else {
            subCommandManager.executeSlash(subCommands, subName, interaction, subArgs);
        }
    }
};