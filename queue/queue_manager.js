const Discord = require('discord.js');

const queueStates = new Discord.Collection();

class QueueState {
    constructor(channel, max) {
        this.isActive = true;
        this.queueChannel = channel;
        this.queueMax = max;
        this.playerQueue = [];
        this.reactedMessage = [];
    }
}

class playerQueueState {
    constructor(user, paused) {
        this.user = user;
        this.paused = paused;
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
    start(channel, max) {
        queueStates.set(channel.guild.id, new QueueState(channel, max));
        console.log(`queue started at ${channel.guild.name} on ${channel.name}`);
    },
    stop(channel) {
        const state = getState(channel);
        if (state) {
            state.isActive = false;
            channel.send('หยุดการอนุมัติการตีบอสใน Server นี้แล้ว');
            console.log(`queue stoped at ${channel.guild.name} on ${channel.name}`);
        }
    },
    add(channel, users, pause) {
        const state = getState(channel);
        if (state) {
            for (const user of users) {
                state.playerQueue.push(new playerQueueState(user, pause));
            }
            channel.send(`อนุมัติผู้เล่นเพิ่ม${users.length > 1 ? `อีก ${users.length} คน` : ''}แล้วจ้า~`);
            this.print(channel);
        }
    },
    remove(channel, users) {
        const state = getState(channel);
        if (state) {
            const notFoundUsers = [];
            for (const user of users) {
                const index = state.playerQueue.findIndex(x => x.user == user);
                if (index == -1) {
                    notFoundUsers.push(user);
                }
                else {
                    state.playerQueue.splice(index, 1);
                }
            }
            if (notFoundUsers.length > 0) {
                channel.send(`ไม่เจอ ${notFoundUsers.join(' ')} ในรายชื่ออนุมัติ`, { 'allowedMentions': { 'users': [] } });
            }
            channel.send(`นำผู้เล่น${users.filter(user => !notFoundUsers.includes(user)).join(' ')} ออกจากรายชื่ออนุมัติ`, { 'allowedMentions': { 'users': [] } });
            this.print(channel);
        }
    },
    unpause(channel) {
        const state = getState(channel);
        if (state) {
            const pausedUsers = [];
            for (const user of state.playerQueue) {
                if (user.paused === true) {
                    pausedUsers.push(user.user);
                    user.paused = false;
                }
            }
            if (pausedUsers.length === 0) {
                channel.send('ไม่มีผู้เล่นที่กำลังพอสอยู่ในรายชื่ออนุมัติ');
            }
            channel.send(`${pausedUsers.join(' ')} ปล่อยพอสได้เลยจ้า~`);
        }
    },
    print(channel) {
        const state = getState(channel);
        if (state) {
            if (state.playerQueue.length === 0) {
                channel.send('ขณะนี้มียังไม่มีคนได้รับอนุมัติ');
                return;
            }
            const playerList = state.playerQueue.map((player, index) => `${index + 1}. ${player.user.username} (${player.user})${player.paused ? ' ⏸️' : ''}`).join('\n');
            const pauseCount = state.playerQueue.filter(x => x.paused === true).length;
            channel.send(`:crossed_swords: ขณะนี้มีคนได้รับอนุมัติไปแล้ว ${state.playerQueue.length}/${state.queueMax} ไม้${pauseCount > 0 ? ` ⏸️ พอสอยู่ ${pauseCount} ไม้` : ''}\n${playerList}`, { 'allowedMentions': { 'users': [] } });
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
        // Check duplicate
        if (state.reactedMessage.indexOf(reaction.message) !== -1) return;
        // Check role
        const guildConfig = messageChannel.client.settings.get(messageChannel.guild.id);
        const member = messageChannel.guild.member(user);
        if (!member.roles.cache.some(role => role.name === guildConfig.approvalRole)) return;
        console.log('React: ' + reaction.emoji.name);
        // Reply for each emoji
        const player = reaction.message.author;
        if (reaction.emoji.name === '✅') {
            state.playerQueue.push(new playerQueueState(reaction.message.author, false));
            state.reactedMessage.push(reaction.message);
            messageChannel.send(`${player} ตีได้เลยจ้า~`);
            this.print(messageChannel);
        }
        if (reaction.emoji.name === '❌' || reaction.emoji.name === '❎') {
            messageChannel.send(`${player} อย่าเพิ่งตีก่อน ซ้อมให้ดีกว่านี้แล้วมาขออนุญาตใหม่น้า~`);
            state.reactedMessage.push(reaction.message);
        } if (reaction.emoji.name === '⏸️') {
            state.playerQueue.push(new playerQueueState(reaction.message.author, true));
            messageChannel.send(`${player} ตีได้เลยจ้า~ แต่ต้องพอสรอด้วยน้า~`);
            state.reactedMessage.push(reaction.message);
            this.print(messageChannel);
        }
    }
};