import { SlashCommandBuilder } from '@discordjs/builders';
import { getLuck } from '../../logic/warluck';
import { Command } from '../commands';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('warluck')
        .setDescription('เช็คดวง ก่อนต่อสู้จริงใน Clan Battle'),

    execute(interaction) {
        void interaction.reply({ embeds: [getLuck()] });
    },
};