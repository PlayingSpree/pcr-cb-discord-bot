import { SlashCommandBuilder } from '@discordjs/builders';
import { getGacha } from '../../logic/gachatest';
import { Command } from '../commands';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('gacha')
        .setDescription('จำลองเปิดกาชา ว่าเปิดกี่ครั้งถึงจะได้ตัว Pickup')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('เลือกประเภทกาชา')
                .setRequired(false)
                .addChoices([['princone', 'pcr'], ['bluearchive', 'ba']])) as SlashCommandBuilder,

    execute(interaction) {
        void interaction.reply({ embeds: [getGacha(interaction.options.getString('type'))] });
    },
};