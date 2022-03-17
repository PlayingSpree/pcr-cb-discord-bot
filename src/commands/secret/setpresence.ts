import { SlashCommandBuilder } from '@discordjs/builders';
import { loginfo } from '../../util/logger';
import { Command } from '../commands';

let lastInterval: NodeJS.Timeout | undefined;

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('setpresence')
        .setDescription('set presence')
        .addStringOption(option => option
            .setName('presence')
            .setDescription('presence')
            .setRequired(true)) as SlashCommandBuilder,

    async execute(interaction) {
        await interaction.deferReply();
        const currentPresence = interaction.options.getString('presence', true);

        loginfo(`Seting Presence: ${currentPresence}`);

        const setPresence = () => {
            interaction.client?.user?.setPresence({ activities: [{ name: currentPresence }] });
        };

        setPresence();

        if (lastInterval) clearInterval(lastInterval);
        lastInterval = setInterval(setPresence, 1000 * 60 * 30);
        void interaction.editReply(`Presence set to ${currentPresence}`);
    },
};