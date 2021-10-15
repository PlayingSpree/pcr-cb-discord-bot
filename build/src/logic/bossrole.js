"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactionEvent = exports.start = void 0;
const state_1 = require("../data/state");
const logger_1 = require("../util/logger");
const message_1 = require("../util/message");
const reaction_1 = require("../util/reaction");
async function reactNumberOnMessage(message) {
    for (let i = 1; i <= 5; i++) {
        await message.react(reaction_1.reaction_numbers[i]);
    }
}
async function getBossRoles(guild) {
    const bossRoles = [];
    const roles = await guild.roles.fetch();
    for (let i = 1; i <= 5; i++) {
        let bossRole = roles.find(role => role.name == 'Boss' + i);
        if (!bossRole) {
            try {
                bossRole = await guild.roles.create({
                    name: 'Boss' + i,
                    color: 'GREY',
                    reason: 'Create by Sensei CB Bot',
                });
            }
            catch (err) {
                return "ไม่สามารถสร้าง Role ได้ กรุณาเช็ค Permission";
            }
        }
        bossRoles.push(bossRole.id);
    }
    return bossRoles;
}
async function modifyRole(roleId, guild, user, add) {
    const member = await guild.members.fetch(user);
    const hasRole = member.roles.cache.get(roleId);
    if (add && !hasRole) {
        member.roles.add(roleId);
    }
    else if (!add && hasRole) {
        member.roles.remove(roleId);
    }
}
async function start(interaction) {
    const roles = await getBossRoles(interaction.guild);
    if (typeof roles == 'string') {
        return roles;
    }
    await interaction.reply("กด React ที่หมายเลขเพื่อรับ Role แจ้งเตือนบอสนั้น ๆ");
    const reply = await interaction.fetchReply();
    state_1.bossRoleStateData.set(interaction.guildId, new state_1.BossRoleState(reply.id, roles));
    reactNumberOnMessage(reply);
}
exports.start = start;
function reactionEvent(reaction, user, add) {
    const messageChannel = reaction.message.channel;
    const state = state_1.BossRoleState.getState(state_1.bossRoleStateData, messageChannel.guildId);
    if (!state)
        return;
    const message = state.messageId == reaction.message.id;
    if (!message)
        return;
    (0, logger_1.loginfo)(`Bossrole React ${add ? "add" : "remove"}: ` + reaction.emoji.name);
    switch (reaction.emoji.name) {
        case reaction_1.reaction_numbers[1]:
        case reaction_1.reaction_numbers[2]:
        case reaction_1.reaction_numbers[3]:
        case reaction_1.reaction_numbers[4]:
        case reaction_1.reaction_numbers[5]:
            const boss = reaction_1.reaction_numbers.indexOf(reaction.emoji.name);
            const roleId = state.bossRolesId[boss - 1];
            modifyRole(roleId, messageChannel.guild, user, add);
            (0, message_1.sendTimedMessage)(messageChannel, 5000, { content: `${add ? "เพิ่ม" : "ลบ"} Role <@&${roleId}> ให้ ${user.toString()} แล้วจ้า`, allowedMentions: { users: [user.id], roles: [] } });
            break;
    }
}
exports.reactionEvent = reactionEvent;
//# sourceMappingURL=bossrole.js.map