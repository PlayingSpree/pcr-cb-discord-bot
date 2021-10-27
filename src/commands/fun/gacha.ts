import { SlashCommandBuilder } from '@discordjs/builders';
import { getGacha } from '../../logic/gachatest';
import { Command } from '../commands';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('gacha')
        .setDescription('จำลองเปิดกาชา ว่าเปิดกี่ครั้งถึงจะได้ตัว Pickup'),

    execute(interaction) {
        void interaction.reply({ embeds: [getGacha()] });
    },
};