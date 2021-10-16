import { SlashCommandBuilder } from '@discordjs/builders';
import { tryClearChat } from '../../logic/clearchat';
import { Command } from '../commands';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('clearchat')
        .setDescription('ลบแชทใน channel ทั้งหมด (Admin เท่านั้น)'),

    execute(interaction) {
        void tryClearChat(interaction);
    },
    executeButton(interaction) {
        void tryClearChat(interaction);
    },
};