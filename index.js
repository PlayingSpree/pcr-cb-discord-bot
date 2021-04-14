const dotenv = require('dotenv');
const fs = require('fs');
const Discord = require('discord.js');
const appConfig = require('./config.json');
const queueManager = require('./app/queue/queue_manager.js');
const notifyManager = require('./app/notify/notify_manager.js');
const slashManager = require('./slash_commands/slash_commands_manager.js');
const commands_validator = require('./command_validator.js');

dotenv.config();

const client = new Discord.Client();
// Attach per server settings to client.settings
client.settings = require('./app/per_server_setting/server_setting_manager.js');

client.login(process.env.TOKEN);

client.once('ready', () => {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    // slashManager.registerServer(client, '249887769462177793');
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
    // Check bot
    if (user.bot) return;
    queueManager.reactionEvent(reaction, user);
    notifyManager.reactionEvent(reaction, user);
});

client.on('messageReactionRemove', (reaction, user) => {
    // Check bot
    if (user.bot) return;
    notifyManager.reactionRemoveEvent(reaction, user);
});

client.on('guildDelete', guild => {
    client.settings.delete(guild.id);
});

client.ws.on('INTERACTION_CREATE', async interaction => {
    if (interaction.type !== 2) return;
    console.log(`Got interaction: ${interaction.data.name} from: ${interaction.guild_id}`);
    if (interaction.data.name === 'enableslashcmd') {
        if (interaction.guild_id !== undefined) {
            slashManager.registerServer(client, interaction.guild_id);
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