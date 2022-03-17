import { SlashCommandBuilder } from '@discordjs/builders';
import { getOvk } from '../../logic/overkill';
import { Command } from '../commands';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('overkill')
        .setDescription('คำนวณดาเมจ/เวลาที่ได้ ในการ Overkill')
        .addNumberOption(option =>
            option.setName('hp')
                .setDescription('เลือดบอสปัจจุบัน')
                .setRequired(true))
        .addNumberOption(option =>
            option.setName('dmg1')
                .setDescription('ดาเมจที่ทำได้')
                .setRequired(true))
        .addNumberOption(option =>
            option.setName('dmg2')
                .setDescription('ดาเมจที่อีกทีมทำได้ (ใส่เพื่อหาเวลาที่ได้ หลังจาก ovk)')
                .setRequired(false)) as SlashCommandBuilder,

    execute(interaction) {
        const hp = interaction.options.getNumber('hp', true);
        const dmg1 = interaction.options.getNumber('dmg1', true);
        const dmg2 = interaction.options.getNumber('dmg2');
        void interaction.reply({
            embeds: [getOvk(hp, dmg1, dmg2)]
        });
    },
};