async function clearChat(message) {
    console.log('Clearing all chat from ' + message.channel.name);
    let fetched;
    let error = false;
    do {
        try {
            fetched = await message.channel.messages.fetch({ limit: 100 });
            await message.channel.bulkDelete(fetched);
        }
        catch (err) {
            console.error(err.message);
            message.channel.send(err.message);
            error = true;
        }
        finally {
            message.channel.bulkDelete(fetched, true);
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
    execute(message, args) {
        clearChat(message);
    }
};