module.exports = {
    name: 'help',
    description: 'แสดงรายการ command ทั้งหมด หรือ แสดงรายละเอียด command ที่ใส่',
    aliases: ['commands'],
    usage: '[command name] แสดงรายละเอียด command',
    cooldown: 5,
    execute(message, args) {
        const data = [];
        const { commands, settings } = message.client;
        const guildConf = message.guild ? settings.get(message.guild.id) : null;

        if (!args.length) {
            data.push('รายการ commands ทั้งหมด:');
            data.push(`\`\`\`${commands.map(command => command.name).join(', ')}\`\`\``);
            if (guildConf) data.push(`prefix ของ server นี้: \`${guildConf.prefix}\``);
            data.push(`สามารถใช้ \`${guildConf.prefix}help [command name]\` เพื่อแสดงรายละเอียดเกี่ยวกับ command นั้น ๆ ได้`);

            return message.channel.send(data, { split: { maxLength: 1000 } });
        }

        if (args[0] == '-f') {
            const groupBy = (xs, key) => {
                return xs.reduce((rv, x) => {
                    (rv[x[key]] = rv[x[key]] || []).push(x);
                    return rv;
                }, {});
            };

            data.push('__**วิธีใช้คำสั่งทั้งหมด**__');
            data.push('คำสั่งบางคำสั่งสามารถใช้ด้วยการพิมพ์ / นำหน้าแทนได้');
            if (guildConf) data.push(`prefix ของ server นี้: \`${guildConf.prefix}\``);
            data.push('===========================');

            for (const [group, commandsInGroup] of Object.entries(groupBy(commands, 'group'))) {
                data.push(`**__คำสั่งกลุ่ม ${group}__**`);
                for (const command of commandsInGroup) {
                    data.push(`\n__**คำสั่ง:** \`${command.name}\`__`);

                    if (command.aliases) data.push(`**ชื่อย่อ:** \`${command.aliases.join(', ')}\``);
                    if (command.description) data.push(`**รายละเอียด:** \`${command.description}\``);
                    if (command.usage) data.push(`**วิธีใช้:** \`\`\`${guildConf.prefix}${command.name} ${command.usage}\`\`\``);
                }
                data.push('===========================');
            }

            return message.channel.send(data, { split: { maxLength: 1000 } });
        }

        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return message.reply('ไม่พบ command ที่ใส่ใว้');
        }

        data.push(`**ชื่อ command:** ${command.name}`);

        if (command.aliases) data.push(`**ชื่อเพิ่มเติม:** ${command.aliases.join(', ')}`);
        data.push(`**Cooldown:** ${command.cooldown || 3} วินาที`);
        if (command.description) data.push(`**รายละเอียด:** ${command.description}`);
        if (command.usage) data.push(`**วิธีใช้:** ${guildConf.prefix}${command.name} ${command.usage}`);

        message.channel.send(data, { split: { maxLength: 1000 } });
    },
};