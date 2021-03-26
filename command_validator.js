module.exports = function validate(command, message) {
    // Guild Check (guildOnly: true)
    if (command.guildOnly && message.channel.type === 'dm') {
        return 'ไม่สามารถใช้คำสั่งนี้ได้ในช่องพูดคุยส่วนตัว';
    }

    // Permission Check (permissions: string)
    if (command.permissions) {
        const authorPerms = message.channel.permissionsFor(message.author);
        if (!authorPerms || !authorPerms.has(command.permissions)) {
            return `ใช้ได้เฉพาะ User ที่มี Permission ${command.permissions} เท่านั้น`;
        }
    }

    return false;
};