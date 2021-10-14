import { CommandInteraction, Guild, Message, MessageReaction, TextChannel, User } from "discord.js";
import { BossRoleState, bossRoleStateData } from "../data/state";
import { sendTimedMessage } from "../util/message";
import { reaction_numbers } from "../util/reaction";

async function reactNumberOnMessage(message: Message) {
    for (let i = 1; i <= 5; i++) {
        await message.react(reaction_numbers[i]);
    }
}

async function getBossRoles(guild: Guild) {
    const bossRoles = []
    const roles = await guild.roles.fetch()
    for (let i = 1; i <= 5; i++) {
        let bossRole = roles.find(role => role.name == 'Boss' + i)
        if (!bossRole) {
            try {
                bossRole = await guild.roles.create({
                    name: 'Boss' + i,
                    color: 'GREY',
                    reason: 'Create by Sensei CB Bot',
                })
            }
            catch (err) {
                return "ไม่สามารถสร้าง Role ได้ กรุณาเช็ค Permission"
            }
        }
        bossRoles.push(bossRole!.id)
    }
    return bossRoles
}

async function modifyRole(roleId: string, guild: Guild, user: User, add: boolean) {
    const member = await guild.members.fetch(user);
    const hasRole = member.roles.cache.get(roleId)
    if (add && !hasRole) {
        member.roles.add(roleId)
    } else if (!add && hasRole) {
        member.roles.remove(roleId)
    }
}

export async function start(interaction: CommandInteraction) {
    const roles = await getBossRoles(interaction.guild!)
    if (typeof roles == 'string') {
        return roles
    }

    await interaction.reply("กด React ที่หมายเลขเพื่อรับ Role แจ้งเตือนบอสนั้น ๆ")
    const reply = await interaction.fetchReply() as Message

    bossRoleStateData.set(interaction.guildId!, new BossRoleState(reply.id, roles))
    reactNumberOnMessage(reply)
}

export function reactionEvent(reaction: MessageReaction, user: User, add: boolean) {
    const messageChannel = reaction.message.channel as TextChannel;
    const state = BossRoleState.getState(bossRoleStateData, messageChannel.guildId)
    if (!state) return
    const message = state.messageId == reaction.message.id;
    if (!message) return;
    console.log(`Bossrole React ${add ? "add" : "remove"}: ` + reaction.emoji.name);
    switch (reaction.emoji.name) {
        case reaction_numbers[1]:
        case reaction_numbers[2]:
        case reaction_numbers[3]:
        case reaction_numbers[4]:
        case reaction_numbers[5]:
            const boss = reaction_numbers.indexOf(reaction.emoji.name)
            const roleId = state.bossRolesId[boss - 1]
            modifyRole(roleId, messageChannel.guild, user, add)
            sendTimedMessage(messageChannel, 5000, { content: `${add ? "เพิ่ม" : "ลบ"} Role <@&${roleId}> ให้ ${user.toString()} แล้วจ้า`, allowedMentions: { users: [user.id], roles: [] } })
            break;
    }
}
