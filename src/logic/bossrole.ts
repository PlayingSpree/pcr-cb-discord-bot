import { CommandInteraction, Guild, Message, MessageReaction, TextChannel, User } from 'discord.js';
import { BossRoleState, bossRoleStateData } from '../data/state';
import { loginfo } from '../util/logger';
import { sendTimedMessage } from '../util/message';
import { reaction_numbers } from '../util/reaction';

export async function start(interaction: CommandInteraction) {
    const roles = await getBossRoles(interaction.guild!);

    await interaction.reply('กด React ที่หมายเลขเพื่อรับ Role แจ้งเตือนบอสนั้น ๆ');
    const reply = await interaction.fetchReply() as Message;

    bossRoleStateData.set(interaction.guildId!, new BossRoleState(reply.id, roles));
    void reactNumberOnMessage(reply);
}

export async function reactionEvent(reaction: MessageReaction, user: User, add: boolean) {
    const messageChannel = reaction.message.channel as TextChannel;
    const state = BossRoleState.getState(bossRoleStateData, messageChannel.guildId);
    if (!state) return;
    const message = state.messageId == reaction.message.id;
    if (!message) return;
    if (!reaction.emoji.name) return;

    loginfo(`Bossrole React ${add ? 'add' : 'remove'}: ${reaction.emoji.name}`);
    const boss = reaction_numbers.indexOf(reaction.emoji.name);
    if (boss >= 1 && boss <= 5) {
        const roleId = state.bossRolesId[boss - 1];
        try {
            await modifyRole(roleId, messageChannel.guild, user, add);
        }
        catch (e) {
            void messageChannel.send('ไม่สามารถสร้าง Role ได้ กรุณาเช็ค Permission ของ Bot');
        }
        void sendTimedMessage(messageChannel, 5000, { content: `${add ? 'เพิ่ม' : 'ลบ'} Role <@&${roleId}> ให้ ${user.toString()} แล้วจ้า`, allowedMentions: { users: [user.id], roles: [] } });
    }
}

async function reactNumberOnMessage(message: Message) {
    for (let i = 1; i <= 5; i++)
        await message.react(reaction_numbers[i]);

}

async function getBossRoles(guild: Guild) {
    const bossRoles = [];
    const roles = await guild.roles.fetch();
    for (let i = 1; i <= 5; i++) {
        let bossRole = roles.find(role => role.name == `Boss${i}`);
        if (!bossRole) {
            try {
                bossRole = await guild.roles.create({
                    name: `Boss${i}`,
                    color: 'GREY',
                    reason: 'Create by Sensei CB Bot',
                });
            }
            catch (err) {
                throw Error('ไม่สามารถสร้าง Role ได้ กรุณาเช็ค Permission');
            }
        }
        bossRoles.push(bossRole.id);
    }
    return bossRoles;
}

async function modifyRole(roleId: string, guild: Guild, user: User, add: boolean) {
    try {
        const member = await guild.members.fetch(user);
        const hasRole = member.roles.cache.get(roleId);
        if (add && !hasRole)
            await member.roles.add(roleId);

        else if (!add && hasRole)
            await member.roles.remove(roleId);
    }
    catch (err) {
        throw Error('ไม่สามารถสร้าง Role ได้ กรุณาเช็ค Permission');
    }

}
