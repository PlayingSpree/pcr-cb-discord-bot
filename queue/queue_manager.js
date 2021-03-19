const Discord = require('discord.js');

const queueStates = new Discord.Collection();

class QueueState {
    constructor(channel, max) {
        this.isActive = true;
        this.queueChannel = channel;
        this.queueMax = max;
        this.playerQueue = [];
    }
}

function getState(channel) {
    if (!queueStates.has(channel.guild.id)) {
        channel.send('ขณะนี้ยังไม่มีการอนุมัติการตีบอสใน Server นี้');
        return;
    }
    const state = queueStates.get(channel.guild.id);
    if (state.isActive) {
        return state;
    }
    else {
        channel.send('ขณะนี้การอนุมัติการตีบอสใน Server นี้ได้หยุดไปแล้ว');
        return;
    }
}

module.exports = {
    startQueue(channel, max) {
        queueStates.set(channel.guild.id, new QueueState(channel, max));
        console.log(`queue started at ${channel.guild.name} on ${channel.name}`);
    },
    stopQueue(channel) {
        const state = getState(channel);
        if (state) {
            state.isActive = false;
            channel.send('หยุดการอนุมัติการตีบอสใน Server นี้แล้ว');
            console.log(`queue stoped at ${channel.guild.name} on ${channel.name}`);
        }
    },
    queueAdd(channel, users) {
        const state = getState(channel);
        if (state) {
            for (const user of users) {
                state.playerQueue.push(user);
            }
        }
    },
    queueRemove(channel, users) {
        const state = getState(channel);
        if (state) {
            for (const user of users) {
                const index = state.playerQueue.indexOf(user);
                if (index !== -1) {
                    state.playerQueue.splice(index, 1);
                }
            }
        }
    },
    printQueue(channel) {
        const state = getState(channel);
        if (state) {
            if (state.playerQueue.length === 0) {
                channel.send('ขณะนี้มียังไม่มีคนได้รับอนุมัติ');
                return;
            }
            const playerList = state.playerQueue.map((player, index) => `${index + 1}. ${player}`).join('\n');
            channel.send(`ขณะนี้มีคนได้รับอนุมัติไปแล้ว ${state.playerQueue.length}/${state.queueMax} ไม้\n${playerList}`, { 'allowedMentions': { 'users': [] } });
        }
    },
    reactionEvent(reaction, user) {
        const messageChannel = reaction.message.channel;
        const state = queueStates.get(messageChannel.guild.id);
        if (!state || !state.isActive) return;
        // Check bot
        if (user.bot) return;
        // Check channel
        if (messageChannel.id !== state.queueChannel.id) return;
        // Check role
        const guildConfig = messageChannel.client.settings.get(messageChannel.guild.id);
        const member = messageChannel.guild.member(user);
        if (!member.roles.cache.some(role => role.name === guildConfig.approvalRole)) return;
        console.log('React: ' + reaction.emoji.name);
        // Reply for each emoji
        const player = reaction.message.author;
        if (reaction.emoji.name === '✅') {
            state.playerQueue.push(reaction.message.author);
            messageChannel.send(`${player} ตีได้เลยจ้า~`);
            this.printQueue(messageChannel);
        }
        if (reaction.emoji.name === '❌') {
            messageChannel.send(`${player} อย่าเพิ่งตีก่อน ซ้อมให้ดีกว่านี้แล้วมาขออนุญาตใหม่น้า~`);
        } if (reaction.emoji.name === '⏸️') {
            state.playerQueue.push(reaction.message.author);
            messageChannel.send(`${player} ตีได้เลยจ้า~ แต่ต้องพอสรอด้วยน้า~`);
            this.printQueue(messageChannel);
        }
    }
};