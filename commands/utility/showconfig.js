module.exports = {
    name: 'showconfig',
    aliases: ['showconf', 'listconfig'],
    description: 'Set bot setting for this server.',
    permissions: 'ADMINISTRATOR',
    execute(message, args) {
        const guildConf = message.client.settings.get(message.guild.id);

        const configProps = Object.keys(guildConf).map(prop => {
            return `${prop}: ${guildConf[prop]}`;
        });
        message.channel.send(`The following are the server's current configuration: \`\`\`${configProps.join('\n')}\`\`\``);
    }
};