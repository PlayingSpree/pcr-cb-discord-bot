async function clearChat(channel) {
    console.log('Clearing all chat from ' + channel.name);
    let fetched;
    let error = false;
    do {
        try {
            fetched = await channel.messages.fetch({ limit: 100 });
            await channel.bulkDelete(fetched);
        }
        catch (err) {
            console.error(err.message);
            channel.send(err.message);
            error = true;
        }
        finally {
            channel.bulkDelete(fetched, true);
        }
    }
    while (fetched.size >= 2 && !error);
    console.log('Chat cleared.');
}

module.exports = {
    name: 'clearchat',
    aliases: ['cc'],
    description: 'ลบแชทใน channel ทั้งหมด (Admin เท่านั้น)',
    permissions: 'ADMINISTRATOR',
    guildOnly: true,
    cooldown: 15,
    execute(message, args) {
        clearChat(message.channel);
    },
    executeSlash(interaction, args) {
        interaction.channel.cmdreply.send('กำลังลบข้อความทั้งหมด', { 'flags': 64 });
        clearChat(interaction.channel);
    }
};