const Discord = require('discord.js');
const commands = new Discord.Collection();

let currentPresence = null;

const setpresence = {
    name: 'setpresence',
    aliases: ['setp'],
    args: true,
    execute(message, args) {
        currentPresence = args.join(' ');
        console.log(`Seting Presence: ${currentPresence}`);
        message.client.user.setPresence({ activity: { name: currentPresence }, status: 'online' });
    },
};

module.exports = {
    setPresence(client) {
        if (currentPresence) {
            console.log(`Reseting Presence... [${currentPresence}]`);
            client.user.setPresence({ activity: { name: currentPresence }, status: 'online' });
        }
    },
    load() {
        commands.set('setpresence', setpresence);
        return commands;
    }
};