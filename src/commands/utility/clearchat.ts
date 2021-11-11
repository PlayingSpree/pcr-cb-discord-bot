import { SlashCommandBuilder } from '@discordjs/builders';
import { tryClearChat } from '../../logic/clearchat';
import { checkPermission } from '../../util/permission';
import { Command } from '../commands';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('clearchat')
        .setDescription('ลบแชทใน channel ทั้งหมด (Admin เท่านั้น)'),

    execute(interaction) {
        if (!checkPermission(interaction, 'MANAGE_MESSAGES', true))
            return;
        void tryClearChat(interaction);
    },
    executeButton(interaction) {
        if (!checkPermission(interaction, 'MANAGE_MESSAGES', true))
            return;
        void tryClearChat(interaction);
    },
};