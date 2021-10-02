const Discord = require('discord.js');
const bossInfo = require('../util/boss_info.js');

const notifyStates = new Discord.Collection();

class NotifyState {
    constructor(channel, bossMessage) {
        this.isActive = true;
        this.queueChannel = channel;
        this.messages = [];
        this.bossMessage = bossMessage;
    }
}

class NotifyMessage {
    constructor(bossRound) {
        this.bossRound = bossRound;
        this.players = [[], [], [], [], []];
        this.message = null;
    }
}

const reaction_numbers = ['\u0030\u20E3', '\u0031\u20E3', '\u0032\u20E3', '\u0033\u20E3', '\u0034\u20E3', '\u0035\u20E3', '\u0036\u20E3', '\u0037\u20E3', '\u0038\u20E3', '\u0039\u20E3'];

function getState(channel) {
    if (!notifyStates.has(channel.guild.id)) {
        channel.cmdreply.send({ content: 'ขณะนี้ยังไม่มีระบบแจ้งเตือบอสใน Server นี้', ephemeral: true });
        return;
    }
    const state = notifyStates.get(channel.guild.id);
    if (state.isActive) {
        return state;
    }
    else {
        channel.cmdreply.send({ content: 'ขณะนี้ระบบแจ้งเตือบอสใน Server นี้ได้หยุดไปแล้ว', ephemeral: true });
        return;
    }
}

async function reactNumberOnMessage(message, boss = 1, bossEnd = 5) {
    for (let i = boss; i <= bossEnd; i++) {
        await message.react(reaction_numbers[i]);
    }
}

async function callplayer(channel, playerlist, bossInt, message) {
    const config = channel.client.settings.get(channel.guild.id);
    playerlist = await Promise.all(playerlist.map(async (user, index) => {
        const member = await channel.guild.members.fetch(user.id);
        return `${index + 1}. ${member.nickname ?? user.username} (${user})`;
    }));
    channel.cmdreply.send(`${(message ?? '')}\n**รายชื่อผู้เล่นที่จองบอส ${bossInfo.bossIntToString(bossInt, config)}**\n${playerlist.join('\n')}`);
}

function printMessage(notifyMessage, channel) {
    const config = channel.client.settings.get(channel.guild.id);
    let str = `====================================
:smiling_imp: __**[บอสรอบที่ ${notifyMessage.bossRound}]**__`;
    for (let i = 0; i <= 4; i++) {
        if (notifyMessage.players[i][0] === null) { continue; }
        str += `\n**${reaction_numbers[i + 1]} ${bossInfo.bossInfoToString(i + 1, notifyMessage.bossRound, config)}** ${notifyMessage.players[i].length == 0 ? 'ยังไม่มีคนจอง' : `จองแล้ว ${notifyMessage.players[i].length} คน`}`;
    }
    return str;
}

module.exports = {
    async start(channel, round, roundEnd, boss = 1, bossEnd = 5) {
        await channel.cmdreply.send(':crossed_swords: เริ่มการจองคิวบอส กด React ที่บอสที่ต้องการจองเพื่อจองบอส และรับการแจ้งเตือนเมื่อถึงบอส\n**:warning: การจองบอส ไม่มีผลต่อการเข้าตี ก่อนตียังคงต้องแปะรูปเพื่อขออนุญาติตีตามปกติ**');
        const bossMessage = await channel.send('**บอสปัจจุบัน:** ยังไม่ได้กำหนด');
        notifyStates.set(channel.guild.id, new NotifyState(channel, bossMessage));
        for (let i = round; i <= roundEnd; i++) {
            await this.add(channel, i, boss, (i == roundEnd) ? bossEnd : 5);
            boss = 1;
        }
        console.log(`notify started at ${channel.guild.name} on ${channel.name}`);
    },
    async add(channel, round, boss = 1, bossEnd = 5) {
        const state = getState(channel);
        if (state) {
            if (!round) {
                round = state.messages[state.messages.length - 1].bossRound + 1;
            }
            const message = new NotifyMessage(round);
            for (let i = 1; i <= 5; i++) {
                if (i < boss) {
                    message.players[i - 1].push(null);
                }
                else if (i > bossEnd) {
                    message.players[i - 1].push(null);
                }
            }
            message.message = await channel.send(printMessage(message, channel));
            state.messages.push(message);
            reactNumberOnMessage(message.message, boss, bossEnd);
        }
    },
    stop(channel) {
        const state = getState(channel);
        if (state) {
            state.isActive = false;
            channel.cmdreply.send('หยุดระบบแจ้งเตือนบอสใน Server นี้แล้ว');
            console.log(`notify stoped at ${channel.guild.name} on ${channel.name}`);
        }
    },
    call(channel, boss, round, message) {
        const state = getState(channel);
        if (state) {
            const notifymessage = state.messages.find(x => x.bossRound == round);
            if (!notifymessage) {
                return channel.cmdreply.send({ content: 'ไม่พบรอบบอสที่ต้องการเรียก', ephemeral: true });
            }
            const playerlist = notifymessage.players[boss - 1];
            if (playerlist.length == 0) {
                return channel.cmdreply.send({ content: 'ไม่มีผู้เล่นจองบอสที่ต้องการเรียก', ephemeral: true });
            }
            if (playerlist[0] === null) {
                return channel.cmdreply.send({ content: 'ไม่พบรอบบอสที่ต้องการเรียก', ephemeral: true });
            }
            callplayer(channel, playerlist, bossInfo.bossInfoToInt(boss, round), message);
        }
    },
    reactionEvent(reaction, user) {
        const messageChannel = reaction.message.channel;
        const state = notifyStates.get(messageChannel.guild.id);
        if (!state || !state.isActive) return;
        // Check bot
        if (user.bot) return;
        // Check channel
        if (messageChannel.id !== state.queueChannel.id) return;
        // Check message
        const message = state.messages.find(x => x.message.id == reaction.message.id);
        if (!message) return;
        // Add
        console.log('Notify React: ' + reaction.emoji.name);
        switch (reaction.emoji.name) {
            case reaction_numbers[1]:
                if (!message.players[0].includes(user)) message.players[0].push(user);
                break;
            case reaction_numbers[2]:
                if (!message.players[1].includes(user)) message.players[1].push(user);
                break;
            case reaction_numbers[3]:
                if (!message.players[2].includes(user)) message.players[2].push(user);
                break;
            case reaction_numbers[4]:
                if (!message.players[3].includes(user)) message.players[3].push(user);
                break;
            case reaction_numbers[5]:
                if (!message.players[4].includes(user)) message.players[4].push(user);
                break;
        }
        message.message.edit(printMessage(message, messageChannel));
    },
    reactionRemoveEvent(reaction, user) {
        const messageChannel = reaction.message.channel;
        const state = notifyStates.get(messageChannel.guild.id);
        if (!state || !state.isActive) return;
        // Check bot
        if (user.bot) return;
        // Check channel
        if (messageChannel.id !== state.queueChannel.id) return;
        // Check message
        const message = state.messages.find(x => x.message.id == reaction.message.id);
        if (!message) return;
        // Remove
        console.log('Notify React Removed: ' + reaction.emoji.name);
        function removeItem(i, item) {
            const index = message.players[i].indexOf(item);
            if (index > -1) {
                message.players[i].splice(index, 1);
            }
        }
        switch (reaction.emoji.name) {
            case reaction_numbers[1]:
                removeItem(0, user);
                break;
            case reaction_numbers[2]:
                removeItem(1, user);
                break;
            case reaction_numbers[3]:
                removeItem(2, user);
                break;
            case reaction_numbers[4]:
                removeItem(3, user);
                break;
            case reaction_numbers[5]:
                removeItem(4, user);
                break;
        }
        message.message.edit(printMessage(message, messageChannel));
    },
    setCurrentBoss(channel, boss, round) {
        const state = notifyStates.get(channel.guild.id);
        if (state) {
            state.messages.forEach(m => {
                if (m.bossRound < round) {
                    m.message.delete();
                }
            });
            state.messages = state.messages.filter(m => m.bossRound >= round);
            if (state.messages.every(m => m.bossRound < round + 2)) {
                this.add(state.queueChannel);
            }
            if (state.bossMessage) {
                const config = channel.client.settings.get(channel.guild.id);
                return state.bossMessage.edit(`\n====================================\n**บอสปัจจุบัน:** ${reaction_numbers[boss]} ${bossInfo.bossInfoToString(boss, round, config)}`);
            }
        }
    }
};