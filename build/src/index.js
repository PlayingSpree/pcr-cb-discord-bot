"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const commands_1 = require("./commands/commands");
const data_1 = require("./data/data");
const logger_1 = require("./util/logger");
require('dotenv').config();
const client = new discord_js_1.Client({ intents: [discord_js_1.Intents.FLAGS.GUILDS, discord_js_1.Intents.FLAGS.GUILD_MESSAGES, discord_js_1.Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });
void (async function startBot() {
    await (0, commands_1.loadCommands)();
    await (0, data_1.loadData)();
    void client.login(process.env.TOKEN);
})();
client.once('ready', () => {
    (0, logger_1.loginfo)(`Logged in as ${client.user.tag}`);
    (0, logger_1.loginfo)('Ready!');
});
client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) {
        (0, commands_1.logCommandInteraction)(interaction);
        const command = commands_1.commands.get(interaction.commandName) || commands_1.secretCommands.get(interaction.commandName);
        if (!command)
            return;
        try {
            await command.execute(interaction);
        }
        catch (error) {
            (0, logger_1.logerror)(error);
            if (interaction.replied)
                interaction.channel?.send('มีข้อผิดพลาดระหว่างการทำคำสั่ง');
            else
                await interaction.reply({ content: 'มีข้อผิดพลาดระหว่างการทำคำสั่ง', ephemeral: true });
        }
    }
    else if (interaction.isButton()) {
        (0, logger_1.loginfo)(`Got button interaction: ${interaction.customId} from: ${interaction.member?.displayName || interaction.user.username} (${interaction.guild.name}/${interaction.channel?.name})`);
        if (interaction.customId == '!messagedeleteself') {
            void interaction.message.delete();
        }
        else if (interaction.customId == '/clearchat') {
            await interaction.message.delete();
            commands_1.commands.get('clearchat')?.executeButton?.(interaction);
        }
    }
});
client.on('messageReactionAdd', (reaction, user) => {
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
            void command.handleReaction(reaction, user, add);
    }
}
process.on('unhandledRejection', error => {
    return (0, logger_1.logerror)('Unhandled promise rejection:', error);
});
//# sourceMappingURL=index.js.map