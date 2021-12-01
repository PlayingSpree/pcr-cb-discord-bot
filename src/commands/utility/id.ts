import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { Command } from '../commands';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('id')
        .setDescription('แสดง id discord ของ user ที่ใส่')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('ผู้เล่นที่ต้องการรู้ id')
                .setRequired(true)) as SlashCommandBuilder,

    execute(interaction) {
        const user = interaction.options.getUser('user', true);
        void interaction.reply({
            embeds: [new MessageEmbed()
                .setColor('#9999ff')
                .setTitle('Discord ID')
                .addField('User', user.toString())
                .addField('ID', user.id)]
        });
    },
};