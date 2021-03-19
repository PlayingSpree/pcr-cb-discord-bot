module.exports = {
    name: 'setconfig',
    aliases: ['setconf'],
    description: 'Set bot setting for this server.',
    permissions: 'ADMINISTRATOR',
    execute(message, args) {
        const [prop, ...value] = args;

        if (!message.client.settings.has(message.guild.id, prop)) {
            return message.reply('This key is not in the configuration.');
        }

        message.client.settings.set(message.guild.id, value.join(' '), prop);

        message.channel.send(`Guild configuration item ${prop} has been changed to:\n\`${value.join(' ')}\``);
    }
};