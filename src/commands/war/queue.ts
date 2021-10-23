import { SlashCommandBuilder } from '@discordjs/builders';
import { reactionEvent, start } from '../../logic/queue';
import { Command } from '../commands';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('เริ่มนับคิวตีบอส')
        .addIntegerOption(option =>
            option.setName('count')
                .setDescription('ไม้ที่ต้องการ')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('boss')
                .setDescription('บอส')
                .addChoices([['1', 1], ['2', 2], ['3', 3], ['4', 4], ['5', 5]])
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('round')
                .setDescription('รอบของบอส')
                .setRequired(true)) as SlashCommandBuilder,

    async execute(interaction) {
        try {
            await start(interaction, interaction.options.getInteger('count', true), interaction.options.getInteger('boss', true), interaction.options.getInteger('round', true));
        }
        catch (e) {
            if (e instanceof Error) {
                {
                    if (interaction.replied)
                        void interaction.editReply(e.message);
                    else
                        void interaction.reply({ content: e.message, ephemeral: true });
                }
            }
        }
    },

    handleReaction(reaction, user, add) {
        void reactionEvent(reaction, user, add);
    },
};