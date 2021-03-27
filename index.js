const dotenv = require('dotenv');
const fs = require('fs');
const Discord = require('discord.js');
const appConfig = require('./config.json');
const queueManager = require('./queue/queue_manager.js');
const slashManager = require('./slash_commands/slash_commands_manager.js');
const commands_validator = require('./command_validator.js');

dotenv.config();

const client = new Discord.Client();
// Attach per server settings to client.settings
client.settings = require('./per_server_setting/server_setting_manager.js');

client.login(process.env.TOKEN);

client.once('ready', () => {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    client.user.setPresence({ activity: { name: appConfig.presence }, status: 'online' });
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
    const prefix = message.guild ? message.client.settings.get(message.guild.id).prefix : appConfig.prefix;
    // Extract command from message
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Find command (name: string, aliases: [string])
    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    // Arguments check (args: bool,usage: string)
    if (command.args && !args.length) {
        let reply = 'กรุณาใส่ argument';

        if (command.usage) {
            reply += `\nวิธีใช้: \`${prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
    }

    // Command Validation Check
    const invalid = commands_validator(command, message);
    if (invalid) return message.reply(invalid);

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
    console.log(`Execute: ${command.name} with args: ${args.join(' ')}`);
    try {
        // Normal reply
        message.channel.cmdreply = { send(data, send_args) { message.channel.send(data, send_args); } };
        command.execute(message, args);
    }
    catch (error) {
        console.error(error);
        message.reply('มีข้อผิดพลาดระหว่างการทำคำสั่ง');
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    queueManager.reactionEvent(reaction, user);
});

client.on('guildDelete', guild => {
    client.settings.delete(guild.id);
});

client.ws.on('INTERACTION_CREATE', async interaction => {
    if (interaction.type !== 2) return;
    console.log(`Got interaction: ${interaction.data.name} from: ${interaction.guild_id}`);
    if (interaction.data.name === 'enableslashcmd') {
        if (interaction.guild_id !== undefined) {
            slashManager.registerServer(client, interaction);
            client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        content: 'อัพเดต Slash Commands แล้ว'
                    }
                }
            });
        }
        else {
            client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        content: 'ใช้ได้เฉพาะใน Server เท่านั้น'
                    }
                }
            });
        }
    }
    else {
        slashManager.handleInteraction(client, interaction);
    }
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});