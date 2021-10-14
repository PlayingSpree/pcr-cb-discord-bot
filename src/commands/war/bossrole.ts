import { SlashCommandBuilder } from "@discordjs/builders";
import { reactionEvent, start } from "../../logic/bossrole";
import { Command } from "../commands";

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('bossrole')
        .setDescription('เพิ่ม role ให้ผู้เล่นที่ react เพื่อรับการแจ้งเตือนเมื่อถึงบอสนั้น ๆ'),

    async execute(interaction) {
        const error = await start(interaction);
        if (error) {
            if (interaction.replied)
                interaction.editReply(error);
            else
                interaction.reply({content : error, ephemeral: true });
        }
    },

    handleReaction(reaction, user, add) {
        reactionEvent(reaction, user, add);
    },
}