const Discord = require('discord.js');
const bossInfo = require('../util/boss_info.js');

const retryStates = new Discord.Collection();

class RetryState {
    constructor(channel) {
        this.isActive = true;
        this.queueChannel = channel;
        this.messages = [];
    }
}

class RetryMessage {
    constructor(bossInt, max) {
        this.players = [];
        this.message = null;
    }
}

function getState(channel) {
    if (!retryStates.has(channel.guild.id)) {
        channel.cmdreply.send('ขณะนี้ยังไม่มีการนับคนรีแล้วใน Server นี้', { 'flags': 64 });
        return;
    }
    const state = retryStates.get(channel.guild.id);
    if (state.isActive) {
        return state;
    }
    else {
        channel.cmdreply.send('ขณะนี้ระบบการนับคนรีแล้วใน Server นี้ได้หยุดไปแล้ว', { 'flags': 64 });
        return;
    }
}

async function printMessage(retryMessage) {
    const playerList = await Promise.all(retryMessage.players.map(async (user, index) => {
        const member = await channel.guild.members.fetch(user);
        return `${index + 1}. ${member.nickname ?? user.username} (${user})`
    }));
    return `====================================
:repeat: ${notifyMessage.players.length == 0 ? 'ยังไม่มีคนรีแล้วในขณะนี้' : `รีแล้ว ${notifyMessage.players.length} คน
${playerList.join('\n')}`}
====================================`;
}

module.exports = {
    async start(channel, boss, round, args) {
        channel.cmdreply.send(':crossed_swords: เริ่มการนับคนรีแล้ว กด React ที่ข้อความด้านล่างเพื่อบอกว่าตัวเองรีแล้ว**');
        notifyStates.set(channel.guild.id, new NotifyState(channel));
        this.add(channel, boss, round, args);
        console.log(`notify started at ${channel.guild.name} on ${channel.name}`);
    }, // TODO ======================================================================================================================
    async add(channel, boss, round, args) {
        const state = getState(channel);
        if (state) {
            let bossInt = bossInfo.bossInfoToInt(boss, round);
            for (const i of args) {
                const message = new NotifyMessage(bossInt++, i);
                message.message = await channel.send(await printMessage(message));
                state.messages.push(message);
            }
        }
    },
    stop(channel) {
        const state = getState(channel);
        if (state) {
            state.isActive = false;
            channel.cmdreply.send('หยุดระบบแจ้งเตือบอสใน Server นี้แล้ว');
            console.log(`notify stoped at ${channel.guild.name} on ${channel.name}`);
        }
    },
    async reactionEvent(reaction, user) {
        const messageChannel = reaction.message.channel;
        const state = retryStates.get(messageChannel.guild.id);
        if (!state || !state.isActive) return;
        // Check bot
        if (user.bot) return;
        // Check channel
        if (messageChannel.id !== state.queueChannel.id) return;
        // Check message
        const message = state.messages.find(x => x.message == reaction.message);
        if (!message) return;
        // Add
        console.log('Notify React: ' + reaction.emoji.name);
        if (!message.players.includes(user)) message.players.push(user);
        message.message.edit(await printMessage(message));
    },
    async reactionRemoveEvent(reaction, user) {
        const messageChannel = reaction.message.channel;
        const state = retryStates.get(messageChannel.guild.id);
        if (!state || !state.isActive) return;
        // Check channel
        if (messageChannel.id !== state.queueChannel.id) return;
        // Check message
        const message = state.messages.find(x => x.message == reaction.message);
        if (!message) return;
        // Remove
        console.log('Notify React Removed: ' + reaction.emoji.name);
        const index = message.players.indexOf(user);
        if (index > -1) {
            message.players.splice(index, 1);
        }
        message.message.edit(await printMessage(message));
    }
};