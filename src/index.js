"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const commands_1 = require("./commands/commands");
require('dotenv').config();
(0, commands_1.loadCommands)();
const client = new discord_js_1.Client({ intents: [discord_js_1.Intents.FLAGS.GUILDS, discord_js_1.Intents.FLAGS.GUILD_MESSAGES, discord_js_1.Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });
client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    console.log("Ready!");
});
client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) {
        (0, commands_1.logCommandInteraction)(interaction);
        const command = commands_1.commands.get(interaction.commandName);
        if (!command)
            return;
        try {
            await command.execute(interaction);
        }
        catch (error) {
            console.error(error);
            if (interaction.replied)
                interaction.channel?.send('มีข้อผิดพลาดระหว่างการทำคำสั่ง');
            else
                await interaction.reply({ content: 'มีข้อผิดพลาดระหว่างการทำคำสั่ง', ephemeral: true });
        }
    }
});
client.on('messageReactionAdd', async (reaction, user) => {
    handleReaction(reaction, user, true);
});
client.on('messageReactionRemove', (reaction, user) => {
    handleReaction(reaction, user, false);
});
function handleReaction(reaction, user, add) {
    if (user.bot)
        return;
    for (const command of commands_1.commands.values()) {
        if (command.handleReaction)
            command.handleReaction(reaction, user, add);
    }
}
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});
client.login(process.env.TOKEN);
