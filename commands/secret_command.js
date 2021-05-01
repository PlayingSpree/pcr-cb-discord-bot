const Discord = require('discord.js');
const commands = new Discord.Collection();

let currentPresence = null;

const setpresence = {
    aliases: ['setp'],
    args: true,
    execute(message, args) {
        currentPresence = args.join(' ');
        message.client.user.setPresence({ activity: { name: currentPresence }, status: 'online' });
    },
};

module.exports = {
    setPresence() {
        this.client.user.setPresence({ activity: { name: currentPresence ?? this.defaultPresence }, status: 'online' });
    },
    load() {
        commands.set('setpresence', setpresence);
        return commands;
    }
};