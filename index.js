const dotenv = require('dotenv');
const fs = require('fs');
const Discord = require('discord.js');
const appConfig = require('./config.json');

dotenv.config();

const client = new Discord.Client();
client.login(process.env.TOKEN);

client.once('ready', () => {
    console.log(`Ready! Logged in as ${client.user.tag}`);
});

client.commands = new Discord.Collection();

const commandFolders = fs.readdirSync('./commands');

for (const folder of commandFolders) {
    if (!appConfig.debug & folder == 'debug') {
        continue;
    }
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.name, command);
    }
}

const cooldowns = new Discord.Collection();

client.on('message', message => {
    // Extract command from message
    if (!message.content.startsWith(appConfig.prefix) || message.author.bot) return;

    const args = message.content.slice(appConfig.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Find command (name: string, aliases: [string])
    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    // Arguments check (args: bool,usage: string)
    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${appConfig.prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
    }

    // Guild Check (guildOnly: true)
    if (command.guildOnly && message.channel.type === 'dm') {
        return message.reply('I can\'t execute that command inside DMs!');
    }

    // Permission Check (permissions: string)
    if (command.permissions) {
        const authorPerms = message.channel.permissionsFor(message.author);
        if (!authorPerms || !authorPerms.has(command.permissions)) {
            return message.reply(`You need ${command.permissions} permission to do this!`);
        }
    }

    // Cooldown Check (cooldown: num)
    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }
    }
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    // Execute command
    try {
        command.execute(message, args);
    }
    catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});