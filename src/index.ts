import { Client, GuildMember, Intents, Message, MessageReaction, TextChannel, User } from 'discord.js';
import { loadCommands, commands, logCommandInteraction } from './commands/commands';
import { logerror, loginfo } from './util/logger';
require('dotenv').config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });

void (async function startBot() {
    await loadCommands();
    void client.login(process.env.TOKEN);
})();

client.once('ready', () => {
    loginfo(`Logged in as ${client.user!.tag}`);
    loginfo('Ready!');
});

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        logCommandInteraction(interaction);
        const command = commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        }
        catch (error) {
            logerror(error);
            if (interaction.replied)
                interaction.channel?.send('มีข้อผิดพลาดระหว่างการทำคำสั่ง');
            else
                await interaction.reply({ content: 'มีข้อผิดพลาดระหว่างการทำคำสั่ง', ephemeral: true });
        }
    }
    else if (interaction.isButton()) {
        loginfo(`Got button interaction: ${interaction.customId} from: ${(interaction.member as GuildMember)?.displayName || interaction.user.username} (${interaction.guild?.name}/${(interaction.channel as TextChannel)?.name})`);
        if (interaction.customId == '!messagedeleteself') {
            void (interaction.message as Message).delete();
        }
        else if (interaction.customId == '/clearchat') {
            await (interaction.message as Message).delete();
            commands.get('clearchat')?.executeButton?.(interaction);
        }

    }
});

client.on('messageReactionAdd', (reaction, user) => {
    handleReaction(reaction as MessageReaction, user as User, true);
});

client.on('messageReactionRemove', (reaction, user) => {
    handleReaction(reaction as MessageReaction, user as User, false);
});

function handleReaction(reaction: MessageReaction, user: User, add: boolean) {
    if (user.bot) return;
    for (const command of commands.values()) {
        if (command.handleReaction)
            void command.handleReaction(reaction, user, add);
    }
}

process.on('unhandledRejection', error => {
    logerror('Unhandled promise rejection:', error);
});