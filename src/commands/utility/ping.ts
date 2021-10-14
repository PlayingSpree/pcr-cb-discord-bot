import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../commands";

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('แสดงค่า latency'),
    
    async execute(interaction) {
        await interaction.reply(`🏓Latency: ${Math.round(interaction.client.ws.ping)}ms`);
    },
}