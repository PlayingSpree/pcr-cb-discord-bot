import { SlashCommandBuilder } from '@discordjs/builders';
import { reactionEvent, start } from '../../logic/notify';
import { Command } from '../commands';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('notify')
        .setDescription('แสดง react รับการแจ้งเตือนเมื่อถึงบอสนั้น ๆ'),

    async execute(interaction) {
        try {
            await start(interaction);
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
        reactionEvent(reaction, user, add);
    },
};