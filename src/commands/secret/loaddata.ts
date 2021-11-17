import { SlashCommandBuilder } from '@discordjs/builders';
import { loadData } from '../../data/data';
import { getGacha } from '../../logic/gachatest';
import { Command } from '../commands';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('loaddata')
        .setDescription('load data'),

    async execute(interaction) {
        await interaction.deferReply();
        await loadData();
        void interaction.editReply('Data loaded.');
    },
};