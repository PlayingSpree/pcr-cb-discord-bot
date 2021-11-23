import { SlashCommandBuilder } from '@discordjs/builders';
import { ButtonInteraction, Collection, CommandInteraction, GuildMember, MessageReaction, TextChannel, User } from 'discord.js';
import fs from 'fs';
import { loginfo } from '../util/logger';
import { commandPath } from '../../config.json';

type ExecuteReturn = Promise<boolean | void> | boolean | void

export interface Command {
    data: SlashCommandBuilder
    execute(interaction: CommandInteraction): ExecuteReturn
    executeButton?(interaction: ButtonInteraction): ExecuteReturn
    handleReaction?(reaction: MessageReaction, user: User, add: boolean): ExecuteReturn
}

export const commands = new Collection<string, Command>();
export const secretCommands = new Collection<string, Command>();

export async function loadCommands() {
    const path = process.env.DEBUG ? commandPath.dev : commandPath.pro;
    const commandFolders = fs.readdirSync(path).filter(file => !(file.endsWith('.js') || file.endsWith('.map') || file.endsWith('.ts')));
    loginfo('Loading commands...');
    for (const folder of commandFolders) {
        const commandFiles = fs.readdirSync(`${path}/${folder}`).filter(file => file.endsWith('.js'));
        loginfo(`Found ${commandFiles.length} commands in ${folder}`);

        for (const file of commandFiles) {
            const { command } = await import(`./${folder}/${file}`) as { command: Command };
            // TODO command.group = folder
            if (folder == 'secret')
                secretCommands.set(command.data.name, command);
            else
                commands.set(command.data.name, command);
            loginfo(`|- ${file}`);
        }
    }
    loginfo(`Successfully load ${commands.size} commands (+ ${secretCommands.size} secrets)`);
}

export function logCommandInteraction(interaction: CommandInteraction) {
    let commandDetails = '';
    const subcommand = interaction.options.getSubcommand(false);
    if (subcommand) {
        commandDetails += subcommand + ' ';
        commandDetails += interaction.options.data[0].options?.map(d => d.value).join(' ');
    }
    else {
        commandDetails += interaction.options.data.map(d => d.value).join(' ');
    }
    loginfo(`Got command interaction: ${interaction.commandName}${commandDetails ? ' ' + commandDetails : ''} from: ${(interaction.member as GuildMember)?.displayName || interaction.user.username} (${interaction.guild?.name}/${(interaction.channel as TextChannel)?.name})`);
}