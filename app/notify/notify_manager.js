const Discord = require('discord.js');
const bossInfo = require('../util/boss_info.js');

const notifyStates = new Discord.Collection();

class NotifyState {
    constructor(channel) {
        this.isActive = true;
        this.queueChannel = channel;
        this.messages = [];
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
        channel.cmdreply.send('ขณะนี้ยังไม่มีระบบแจ้งเตือบอสใน Server นี้', { 'flags': 64 });
        return;
    }
    const state = notifyStates.get(channel.guild.id);
    if (state.isActive) {
        return state;
    }
    else {
        channel.cmdreply.send('ขณะนี้ระบบแจ้งเตือบอสใน Server นี้ได้หยุดไปแล้ว', { 'flags': 64 });
        return;
    }
}

async function reactNumberOnMessage(message) {
    for (let i = 1; i <= 5; i++) {
        await message.react(reaction_numbers[i]);
    }
}

async function callplayer(channel, playerlist, bossInt, message) {
    playerlist = await Promise.all(playerlist.map(async (user, index) => {
        const member = await channel.guild.members.fetch(user);
        return `${index + 1}. ${member.nickname ?? user.username} (${user})`
    }));
    channel.cmdreply.send(`${(message ?? '')}\n**รายชื่อผู้เล่นที่จองบอส ${bossInfo.bossIntToString(bossInt)}**\n${playerlist.join('\n')}`);
}

function printMessage(notifyMessage) {
    let str = `====================================
:smiling_imp: __**[บอสรอบที่ ${notifyMessage.bossRound}]**__`;
    for (let i = 0; i <= 4; i++) {
        str += `\n**${reaction_numbers[i + 1]} ${bossInfo.bossInfoToString(i + 1, notifyMessage.bossRound)}** ${notifyMessage.players[i].length == 0 ? 'ยังไม่มีคนจอง' : `จองแล้ว ${notifyMessage.players[i].length} คน`}`;
    }
    return str + '\n====================================';
}

module.exports = {
    async start(channel, round, roundEnd) {
        channel.cmdreply.send(':crossed_swords: เริ่มการจองคิวบอส กด React ที่บอสที่ต้องการจองเพื่อจองบอส และรับการแจ้งเตือนเมื่อถึงบอส\n**การจองบอส ไม่มีผลต่อการเข้าตี ก่อนตียังคงต้องแปะรูปเพื่อขออนุญาติตีตามปกติ**');
        notifyStates.set(channel.guild.id, new NotifyState(channel));
        for (let i = round; i <= roundEnd; i++) {
            await this.add(channel, i);
        }
        console.log(`notify started at ${channel.guild.name} on ${channel.name}`);
    },
    async add(channel, round) {
        const state = getState(channel);
        if (state) {
            if (!round) {
                round = state.messages[state.messages.length - 1].bossRound + 1;
            }
            const message = new NotifyMessage(round);
            message.message = await channel.send(printMessage(message));
            state.messages.push(message);
            reactNumberOnMessage(message.message);
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
                return channel.cmdreply.send('ไม่พบรอบบอสที่ต้องการเรียก', { 'flags': 64 });
            }
            const playerlist = notifymessage.players[boss - 1];
            if (playerlist.length == 0) {
                return channel.cmdreply.send('ไม่มีผู้เล่นจองบอสที่ต้องการเรียก', { 'flags': 64 });
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
        const message = state.messages.find(x => x.message == reaction.message);
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
        message.message.edit(printMessage(message));
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
        const message = state.messages.find(x => x.message == reaction.message);
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
        message.message.edit(printMessage(message));
    }
};