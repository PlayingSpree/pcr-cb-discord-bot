const Discord = require('discord.js');
const notifyManager = require('../notify/notify_manager.js');
const appConfig = require('../../config.json');
const bossInfo = require('../util/boss_info.js');

const queueStates = new Discord.Collection();

class QueueState {
    constructor(channel, max) {
        this.isActive = true;
        this.queueChannel = channel;
        this.queueMax = max;
        this.boss = null;
        this.round = null;
        this.playerQueue = [];
        this.reactedMessage = [];
    }
}

class PlayerQueueState {
    constructor(user, paused, comment = null) {
        this.user = user;
        this.paused = paused;
        this.comment = comment;
        this.doi = false;
    }
}

function getState(channel, reply = true) {
    if (!queueStates.has(channel.guild.id)) {
        if (reply) channel.cmdreply.send({ content: 'ขณะนี้ยังไม่มีการอนุมัติการตีบอสใน Server นี้', ephemeral: true });
        return;
    }
    const state = queueStates.get(channel.guild.id);
    if (state.isActive) {
        return state;
    }
    else {
        if (reply) channel.cmdreply.send({ content: 'ขณะนี้การอนุมัติการตีบอสใน Server นี้ได้หยุดไปแล้ว', ephemeral: true });
        return;
    }
}

async function downDoi(channel, state) {
    const doiList = await Promise.all(state.playerQueue.filter(x => x.doi === true).map(async (player, index) => {
        const member = await channel.guild.members.fetch(player.user.id);
        return `${index + 1}. ${player.comment || member.nickname || player.user.user.username} (${player.user})`;
    }));
    if (doiList?.length) {
        channel.cmdreply.send('**⛰️ ลงดอยได้เลยจ้า**\n' + doiList.join('\n'));
    }
}

module.exports = {
    async start(channel, max, cont, boss, round) {
        if (cont) {
            const oldState = getState(channel);
            if (oldState) {
                downDoi(channel, oldState);
                if (oldState.boss == null || oldState.round == null) {
                    channel.cmdreply.send('รอบที่แล้วไม่ได้ใส่รอบบอสไว้ ทำให้ไม่สามารถเรียกผู้เล่นที่จองไว้ได้');
                }
                boss = oldState.boss + 1;
                if (boss == 6) {
                    round = oldState.round + 1;
                    boss = 1;
                }
                else {
                    round = oldState.round;
                }
            }
            else {
                channel.cmdreply.send('ไม่สามารถเรียกผู้เล่นที่จองไว้ได้ เนื่องจากยังไม่มีการอนุมัติการตีบอสก่อนหน้านี้');
            }
        }
        const state = new QueueState(channel, max);
        queueStates.set(channel.guild.id, state);
        await channel.cmdreply.send(`=====================================
**__:smiling_imp: บอส ${bossInfo.bossInfoToString(boss, round, channel.client.settings.get(channel.guild.id))} มาแล้ว :crossed_swords: ต้องการ ${max} ไม้ __**
โพสรูปแล้วรออนุมัติ เมื่อได้รับอนุมัติแล้วก็ตีได้เลยจ้า~
=====================================
✅ = อนุมัติ ตีได้เลย
⏸️ = อนุมัติ แต่ต้องพอสรอตอนใกล้จบ
❎❌ = ไม่อนุมัติ
⛰️ = ติดดอย รอบอสตายก่อนแล้วค่อยปล่อย`);
        if (boss != null && round != null) {
            state.boss = boss;
            state.round = round;
            notifyManager.call(channel, boss, round);
            notifyManager.setCurrentBoss(channel, boss, round);
        }
        console.log(`queue started at ${channel.guild.name} on ${channel.name}`);
    },
    stop(channel, reply = true) {
        const state = getState(channel, reply);
        if (state) {
            state.isActive = false;
            if (reply) channel.cmdreply.send('หยุดการอนุมัติการตีบอสใน Server นี้แล้ว');
            console.log(`queue stoped at ${channel.guild.name} on ${channel.name}`);
            return true;
        }
        return false;
    },
    add(channel, users, pause) {
        const state = getState(channel);
        if (state) {
            for (const user of users) {
                state.playerQueue.push(new PlayerQueueState(user, pause, null));
            }
            channel.cmdreply.send(`อนุมัติผู้เล่นเพิ่ม${users.length > 1 ? `อีก ${users.length} คน` : ''}แล้วจ้า~`);
            this.print(channel, true);
        }
    },
    edit(channel, max, boss, round) {
        const state = getState(channel);
        if (state) {
            state.queueMax = max || state.queueMax;
            state.boss = boss || state.boss;
            state.round = round || state.round;
            channel.cmdreply.send(`**แก้ไขข้อมูลการอนุมัติแล้ว**${max ? `\n**ไม้ที่ต้องการ:** \`${max}\`` : ''}${boss ? `\n**บอส:** \`${boss}\`` : ''}${round ? `\n**รอบ:** \`${round}\`` : ''}`);
        }
    },
    remove(channel, users) {
        const state = getState(channel);
        if (state) {
            const notFoundUsers = [];
            for (const user of users) {
                const index = state.playerQueue.findIndex(x => x.user.id == user.id);
                if (index == -1) {
                    notFoundUsers.push(user);
                }
                else {
                    // TODO use dropdown
                    state.playerQueue.splice(index, 1);
                }
            }
            if (notFoundUsers.length > 0) {
                channel.cmdreply.send({ content: `ไม่เจอ ${notFoundUsers.join(' ')} ในรายชื่ออนุมัติ`, allowedMentions: { 'users': [] } });
            }
            const removedUsers = users.filter(user => !notFoundUsers.includes(user));
            if (removedUsers.length > 0) {
                channel.cmdreply.send({ content: `นำผู้เล่น${removedUsers.join(' ')} ออกจากรายชื่ออนุมัติ`, allowedMentions: { 'users': [] } });
                this.print(channel, true);
            }
            else {
                channel.cmdreply.send('ไม่มีผู้เล่นที่ถูกนำออกจากรายชื่ออนุมัติ');
            }
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
                channel.cmdreply.send({ content: 'ไม่มีผู้เล่นที่กำลังพอสอยู่ในรายชื่ออนุมัติ', ephemeral: true });
                return;
            }
            channel.cmdreply.send(`${pausedUsers.join(' ')} ปล่อยพอสได้เลยจ้า~`);
        }
    },
    async doi(channel, users, setTo = true) {
        const state = getState(channel);
        if (state) {
            const notFoundUsers = [];
            for (const user of users) {
                const player = state.playerQueue.filter(x => x.doi != setTo && x.user.id == user.id);
                if (player.length == 0) {
                    notFoundUsers.push(user);
                }
                else if (player.length == 1) {
                    player[0].doi = setTo;
                }
                else {
                    // TODO Use Dropdown
                    const playerList = player.map((p, index) => `**__${index + 1}__** ${p.comment || p.user.username}`);
                    channel.cmdreply.send({ content: `**เจอ ${user} มากกว่า 1 ช่วยเลือกให้หน่อยจ้า**\n\n${playerList.join('\n')}\n\nพิมพ์ - แล้วตามด้วยตัวเลขของผู้เล่นที่เลือก เช่น -1`, allowedMentions: { 'users': [] } });

                    const filter = x => /^-[0-9]+$/.exec(x.content);
                    try {
                        const collected = await channel.awaitMessages({ filter, max: 1, time: 20000, errors: ['time'] });
                        const index = parseInt(collected.first().content.substring(1));
                        player[index - 1].doi = setTo;
                    }
                    catch (collected) {
                        channel.cmdreply.send('ยังไม่มีคำตอบ เลือกคนแรกละกัน');
                        player[0].doi = setTo;
                    }
                }
            }
            if (notFoundUsers.length > 0) {
                channel.cmdreply.send({ content: `ไม่เจอ ${notFoundUsers.join(' ')} ในรายชื่อ${setTo ? 'ติดดอย' : 'อนุมัติ'}`, allowedMentions: { 'users': [] } });
            }
            const doiUsers = users.filter(user => !notFoundUsers.includes(user));
            if (doiUsers.length > 0) {
                if (setTo) {
                    channel.cmdreply.send({ content: `${doiUsers.join(' ')} ติดดอยซะแล้ว ⛰️ ` });
                }
                else {
                    channel.cmdreply.send({ content: `${doiUsers.join(' ')} ลบสถานะติดดอยแล้ว ⛰️ ` });
                }
                this.print(channel, true);
            }
            else {
                channel.cmdreply.send('ไม่มีผู้เล่นที่ถูกติดดอย');
            }
        }
    },
    async print(channel, direct = false) {
        const [err, str] = await this.printString(channel, true);
        if (err !== null) {
            if (direct) {
                await channel.send({ content: str, ephemeral: err, allowedMentions: { 'users': [] } });
            }
            else {
                await channel.cmdreply.send({ content: str, ephemeral: err });
            }

        }
    },
    async printString(channel, reply = false) {
        const state = getState(channel, reply);
        if (state) {
            if (state.playerQueue.length === 0) {
                return [true, 'ขณะนี้มียังไม่มีคนได้รับอนุมัติ'];
            }
            const playerList = await Promise.all(state.playerQueue.filter(x => x.doi === false).map(async (player, index) => {
                const member = await channel.guild.members.fetch(player.user.id);
                return `${index + 1}. ${player.comment || member.nickname || player.user.user.username} (${player.user})${player.paused ? ' ⏸️' : ''}`;
            }));
            const doiList = await Promise.all(state.playerQueue.filter(x => x.doi === true).map(async (player, index) => {
                const member = await channel.guild.members.fetch(player.user.id);
                return `${index + 1}. ${player.comment || member.nickname || player.user.user.username} (${player.user})`;
            }));
            const pauseCount = state.playerQueue.filter(x => x.doi === false && x.paused === true).length;
            const doiCount = state.playerQueue.filter(x => x.doi === true).length;
            return [false, `**:crossed_swords: ขณะนี้มีคนได้รับอนุมัติไปแล้ว ${state.playerQueue.filter(x => x.doi === false).length}/${state.queueMax} ไม้${pauseCount > 0 ? ` ⏸️ พอสอยู่ ${pauseCount} ไม้` : ''}**\n${playerList.join('\n')}${(doiList.length > 0) ? `\n**⛰️ ติดดอยอยู่ ${doiCount} ไม้**\n` + doiList.join('\n') : ''}`];
        }
        return [null, this.isRunning(channel)];
    },
    isRunning(channel) {
        if (!queueStates.has(channel.guild.id)) {
            return 'ขณะนี้ยังไม่มีการอนุมัติการตีบอสใน Server นี้';
        }
        const state = queueStates.get(channel.guild.id);
        if (channel != state.queueChannel) {
            return 'ผิดห้อง 😂';
        }
        if (state.isActive) {
            return null;
        }
        return 'ขณะนี้การอนุมัติการตีบอสใน Server นี้ได้หยุดไปแล้ว';
    },
    getState(channel) {
        return getState(channel, false);
    }, reactionEvent(reaction, user) {
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
        const member = messageChannel.guild.members.cache.get(user.id);
        if (!member.roles.cache.some(role => role.name === guildConfig.approvalRole)) return;
        console.log('Queue React: ' + reaction.emoji.name);
        // Reply for each emoji
        const player = reaction.message.author;
        const comment = reaction.message.content;
        if (reaction.emoji.name === '✅') {
            state.playerQueue.push(new PlayerQueueState(reaction.message.author, false, comment.length > appConfig.queue_comment_length ? null : comment));
            state.reactedMessage.push(reaction.message);
            messageChannel.send(`${player} ตีได้เลยจ้า~`);
            this.print(messageChannel, true);
            return true;
        }
        if (reaction.emoji.name === '❌' || reaction.emoji.name === '❎') {
            messageChannel.send(`${player} อย่าเพิ่งตีก่อน ซ้อมให้ดีกว่านี้แล้วมาขออนุญาตใหม่น้า~`);
            state.reactedMessage.push(reaction.message);
        } if (reaction.emoji.name === '⏸️') {
            state.playerQueue.push(new PlayerQueueState(reaction.message.author, true, comment.length > appConfig.queue_comment_length ? null : comment));
            messageChannel.send(`${player} ตีได้เลยจ้า~ แต่ต้องพอสรอด้วยน้า~`);
            state.reactedMessage.push(reaction.message);
            this.print(messageChannel, true);
            return true;
        }
        if (reaction.emoji.name === '⛰️') {
            if (!state.playerQueue.some(p => p.user.id == reaction.message.author.id)) {
                state.playerQueue.push(new PlayerQueueState(reaction.message.author, true, comment.length > appConfig.queue_comment_length ? null : comment));
            }
            messageChannel.cmdreply = { send(data) { messageChannel.send(data); } };
            this.doi(messageChannel, [reaction.message.author], true);
            state.reactedMessage.push(reaction.message);
            return true;
        }
    }
};