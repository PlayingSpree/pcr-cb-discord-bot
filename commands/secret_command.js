const Discord = require('discord.js');
const commands = new Discord.Collection();

const setpresence = {
    aliases: ['setp'],
    args: true,
    execute(message, args) {
        message.client.user.setPresence({ activity: { name: args[0] }, status: 'online' });
    },
};

module.exports = {
    load() {
        commands.set('setpresence', setpresence);
        return commands;
    }
};