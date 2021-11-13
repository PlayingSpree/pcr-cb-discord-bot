import { SlashCommandBuilder } from '@discordjs/builders';
import { getGachaBa } from '../../logic/gachatest';
import { Command } from '../commands';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('gachabluearchive')
        .setDescription('จำลองเปิดกาชา เกม bluearchive ว่าเปิดกี่ครั้งถึงจะได้ตัวเพิ่มเรท'),

    execute(interaction) {
        void interaction.reply({ embeds: [getGachaBa()] });
    },
};