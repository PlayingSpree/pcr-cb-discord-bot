import { ButtonInteraction, CommandInteraction, PermissionResolvable } from 'discord.js';

export function checkPermission(interaction: CommandInteraction | ButtonInteraction, permission: PermissionResolvable, checkAdmin = false) {
    if (!interaction.memberPermissions?.has(permission, checkAdmin)) {
        void interaction.reply('ท่านไม่มี Permission ในการใช้คำสั่งนี้');
        return false;
    }
    return true;
}