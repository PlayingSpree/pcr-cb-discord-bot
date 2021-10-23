import { SlashCommandBuilder } from '@discordjs/builders';
import { QueueState, queueStateData } from '../../data/state';
import { ephemeral } from '../../util/message';
import { Command } from '../commands';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('รีเซ็ตสถานะการตีบอสทั้งหมด'),

    execute(interaction) {
        try {
            const state = new QueueState();
            queueStateData.set(interaction.guildId!, state);
        }
        catch (e) {
            if (e instanceof Error) {
                {
                    void interaction.reply(ephemeral(e.message));
                }
            }
        }
    }
};