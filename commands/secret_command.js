const Discord = require('discord.js');
const commands = new Discord.Collection();

let currentPresence = null;

const setpresence = {
    name: 'setpresence',
    aliases: ['setp'],
    args: true,
    execute(message, args) {
        if (args.length > 0 && args[0] == '-d') {
            const time = args[1];
            args = args.slice(2);
            const newPresence = args.join(' ');
            console.log(`Seting Interval for Delayed Presence: ${newPresence} (Time: ${time})`);
            setTimeout(() => {
                currentPresence = newPresence;
                console.log(`Seting Delayed Presence: ${currentPresence}`);
                message.client.user.setPresence({ activity: { name: currentPresence }, status: 'online' });
            }, 1000 * time);
        }
        else {
            currentPresence = args.join(' ');
            console.log(`Seting Presence: ${currentPresence}`);
            message.client.user.setPresence({ activity: { name: currentPresence }, status: 'online' });
        }
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