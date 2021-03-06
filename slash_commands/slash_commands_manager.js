const commands_data_list = require('./slash_commands_data.json');
const commands_validator = require('../command_validator.js');

class SlashReply {
    constructor(interaction) {
        this.isReplied = false;
        this.interaction = interaction;
    }
    async send(data) {
        if (this.isReplied) {
            await this.interaction.channel.send(data);
        }
        else {
            this.isReplied = true;
            await this.interaction.reply(data);
        }
    }
}

module.exports = {
    registerServer(client, guild_id) {
        client.guilds.cache.get(guild_id).commands.set(commands_data_list);
    },
    async handleInteraction(interaction) {
        // Get command
        const command = interaction.client.commands.get(interaction.commandName);
        // Validation
        const invalid = commands_validator(command, interaction);
        if (invalid) {
            interaction.reply({ content: invalid, ephemeral: true });
            return;
        }
        // Slash reply
        interaction.channel.cmdreply = new SlashReply(interaction);
        console.log(`command: ${interaction.commandName}`);
        // Run
        try {
            command.executeSlash(interaction);
        }
        catch (error) {
            console.error(error);
            interaction.channel.cmdreply.send('มีข้อผิดพลาดระหว่างการทำคำสั่ง');
        }
    }
};