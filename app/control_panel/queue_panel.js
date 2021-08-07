const Discord = require('discord.js');
const queueManager = require('../queue/queue_manager.js');
const bossInfo = require('../util/boss_info.js');
const { getPanelArgs, PanelArg } = require('./control_panel.js');

const panelStates = new Discord.Collection();
const interactionNames = ['queueNext', 'queueStop', 'queueStart'];

class QueuePanel {
    constructor(channel, message) {
        this.isActive = true;
        this.channel = channel;
        this.message = message;
    }
}

function buildMessage(channel, str) {
    const embed = new Discord.MessageEmbed()
        .setTitle(':crossed_swords: Queue Control Panel :crossed_swords:');
    const row = new Discord.MessageActionRow();
    const queueState = queueManager.getState(channel);
    if (queueState) {
        embed.setColor('#00ff00');
        embed.setDescription(`**__:smiling_imp: บอส ${bossInfo.bossInfoToString(queueState.boss, queueState.round, channel.client.settings.get(channel.guild.id))} :crossed_swords: ต้องการ ${queueState.queueMax} ไม้ __**\n` + str);
        row.addComponents(
            new Discord.MessageButton()
                .setCustomId('queueNext')
                .setLabel('Next')
                .setStyle('PRIMARY'),
        ).addComponents(
            new Discord.MessageButton()
                .setCustomId('queueStop')
                .setLabel('Stop')
                .setStyle('DANGER'),
        );
    }
    else {
        embed.setColor('#ff0000');
        embed.setDescription(str);
        row.addComponents(
            new Discord.MessageButton()
                .setCustomId('queueStart')
                .setLabel('Start')
                .setStyle('SUCCESS'),
        );
    }
    return { content: ' ', embeds: [embed], components: [row], allowedMentions: { 'users': [] } };
}

function getState(channel, reply = true) {
    if (!panelStates.has(channel.guild.id)) {
        if (reply) channel.cmdreply.send({ content: 'ขณะนี้ยังไม่มีการอนุมัติการตีบอสใน Server นี้', ephemeral: true });
        return;
    }
    const state = panelStates.get(channel.guild.id);
    if (state.isActive) {
        return state;
    }
    else {
        if (reply) channel.cmdreply.send({ content: 'ขณะนี้การอนุมัติการตีบอสใน Server นี้ได้หยุดไปแล้ว', ephemeral: true });
        return;
    }
}

module.exports = {
    async start(channel) {
        const state = getState(channel, false);
        if (state) {
            this.stop(channel);
        }
        const [err, str] = await queueManager.printString(channel);
        const msg = await channel.send(buildMessage(channel, str));
        // special reply
        channel.cmdreply = {
            async send(data) {
                const message = await channel.send({ content: data.content ?? data, 'allowedMentions': { 'users': [] } });
                setTimeout(() => message.delete(), 10000);
                return message;
            }
        };

        panelStates.set(channel.guild.id, new QueuePanel(channel, msg));
        console.log(`Queue Control Panel started at ${channel.guild.name} on ${channel.name}`);
    },
    async update(channel) {
        const state = getState(channel, false);
        if (state) {
            const [err, str] = await queueManager.printString(channel);
            setTimeout(() => state.message.edit(buildMessage(channel, str)), 3000);
        }
    },
    stop(channel) {
        const state = getState(channel, false);
        if (state) {
            state.isActive = false;
            state.message.delete();
            console.log(`Queue Control Panel stoped at ${channel.guild.name} on ${channel.name}`);
        }
    },
    async interactionCreateEvent(interaction) {
        if (!interaction.isButton()) return;
        const state = getState(interaction.channel, false);
        if (state) {
            await interaction.defer();
            switch (interaction.customId) {
            case 'queueStart':
                const args = await getPanelArgs(interaction.channel, PanelArg('channel', 'channel', interaction.guild));
                interaction.editReply({ content: 'เริ่มคิวให้แล้วนะ' });
                break;
        }
    }
};