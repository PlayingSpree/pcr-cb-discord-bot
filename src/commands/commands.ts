import { SlashCommandBuilder } from '@discordjs/builders';
import { Collection, CommandInteraction, GuildMember, MessageReaction, TextChannel, User } from 'discord.js';
import fs from 'fs';

type ExecuteReturn = Promise<boolean | void> | boolean | void

export interface Command {
    data: SlashCommandBuilder
    execute(interaction: CommandInteraction): ExecuteReturn
    handleReaction?(reaction: MessageReaction, user: User, add: boolean): ExecuteReturn
}

export const commands = new Collection<string, Command>();

export async function loadCommands() {
    const commandFolders = fs.readdirSync('./src/commands').filter(file => !(file.endsWith('.js') || file.endsWith('.ts')));
    console.log('Loading commands...');
    for (const folder of commandFolders) {
        const commandFiles = fs.readdirSync(`./src/commands/${folder}`).filter(file => file.endsWith('.js'));
        console.log(`Found ${commandFiles.length} commands in ${folder}`);

        for (const file of commandFiles) {
            const { command } = await import(`./${folder}/${file}`);
            command.group = folder;
            commands.set(command.data.name, command);
            console.log(`|- ${file}`);
        }
    }
    console.log(`Successfuly load ${commands.size} commands`);
}

export function logCommandInteraction(interaction: CommandInteraction) {
    let commandDetails = '';
    const subcommand = interaction.options.getSubcommand(false);
    if (subcommand) {
        commandDetails += subcommand + ' ';
        commandDetails += interaction.options.data[0].options!.map(d => d.value).join(' ');
    }
    else {
        commandDetails += interaction.options.data.map(d => d.value).join(' ');
    }
    console.log(`Got command interaction: ${interaction.commandName}${commandDetails ? ' ' + commandDetails : ''} from: ${(interaction.member as GuildMember)?.displayName || interaction.user.username} (${interaction.guild?.name}/${(interaction.channel as TextChannel)?.name})`);
}