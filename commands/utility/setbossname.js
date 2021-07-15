function setBossname(channel, args) {
    const [boss1, boss2, boss3, boss4, boss5] = args;

    channel.client.settings.set(channel.guild.id, [boss1, boss2, boss3, boss4, boss5], 'bossname');
    console.log(`Guild configuration item bossname has been changed to:\n\`${args}\``);
    return `เปลี่ยนการตั้งค่าชื่อบอสเป็น:\nBoss 1: \`${boss1}\`\nBoss 2: \`${boss2}\`\nBoss 3: \`${boss3}\`\nBoss 4: \`${boss4}\`\nBoss 5: \`${boss5}\``;
}

module.exports = {
    name: 'setbossname',
    aliases: ['setboss'],
    description: 'ตั้งค่าชื่อบอส (Role อนุมัติ เท่านั้น)',
    usage: '[boss1] [boss2] [boss3] [boss4] [boss5]',
    execute(message, args) {
        const guildConfig = message.client.settings.get(message.guild.id);

        // Check Role
        if (!message.member.roles.cache.some(role => role.name === guildConfig.approvalRole)) {
            return message.channel.send(`ท่านต้องมี Role: \`${guildConfig.approvalRole}\` ถึงจะใช้งานได้`);
        }

        const prefix = guildConfig.prefix;

        if (args.length < 5) {
            return message.channel.send(`arguments ไม่พอ\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);
        }

        message.channel.send(setBossname(message.channel, args.slice(0, 5)));
    },
    executeSlash(interaction) {
        const args = interaction.options;
        const guildConfig = interaction.client.settings.get(interaction.guildId);

        // Check Role
        if (!interaction.member.roles.cache.some(role => role.name === guildConfig.approvalRole)) {
            return interaction.channel.cmdreply.send({ content: `ท่านต้องมี Role: \`${guildConfig.approvalRole}\` ถึงจะใช้งานได้`, ephemeral: true });
        }

        interaction.channel.cmdreply.send(setBossname(interaction.channel,
            [args.get('boss1').value, args.get('boss2').value, args.get('boss3').value, args.get('boss4').value, args.get('boss5').value]));
    }
};