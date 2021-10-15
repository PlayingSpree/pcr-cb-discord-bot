import { SlashCommandBuilder } from "@discordjs/builders";
import { tryClearChat } from "../../logic/clearchat";
import { Command } from "../commands";

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('clearchat')
        .setDescription('ลบแชทใน channel ทั้งหมด (Admin เท่านั้น)'),

    async execute(interaction) {
        tryClearChat(interaction)
    },
    async executeButton(interaction) {
        tryClearChat(interaction)
    },
}