const commands_data_list = require('./slash_commands_data.json');
const commands_validator = require('../command_validator.js');

class SlashReply {
    constructor(interaction) {
        this.isReplied = false;
        this.interaction = interaction;
    }
    send(data, args) {
        if (this.isReplied) {
            this.interaction.channel.send(data, args);
        }
        else {
            const res = { content: data ? data : 'กำลังรัน Command...' };
            if (args) {
                if (args.flags) {
                    res.flags = args.flags;
                }
                if (args.allowedMentions) {
                    res.allowed_mentions = args.allowedMentions;
                }
            }
            this.interaction.channel.client.api.interactions(this.interaction.id, this.interaction.token).callback.post({
                data: {
                    type: 4,
                    data: res
                }
            });
            this.isReplied = true;
        }
    }
}

module.exports = {
    registerServer(client, interaction) {
        for (const command of commands_data_list) {
            client.api.applications(client.user.id).guilds(interaction.guild_id).commands.post({ data: command });
        }
    },
    async handleInteraction(client, interaction) {
        // Get command
        const command = client.commands.get(interaction.data.name);
        // Inject obj
        interaction.client = client;
        if (interaction.channel_id) interaction.channel = await client.channels.fetch(interaction.channel_id);
        if (interaction.guild_id) {
            interaction.guild = await client.guilds.fetch(interaction.guild_id);
            interaction.user = await client.users.fetch(interaction.member.user.id);
            interaction.member = await interaction.guild.members.fetch(interaction.user);
            interaction.author = interaction.user;
        }
        else {
            interaction.user = await client.users.fetch(interaction.user.id);
        }
        // Validation
        const invalid = commands_validator(command, interaction);
        if (invalid) {
            client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        content: invalid,
                        flags: 64
                    }
                }
            });
            return;
        }
        // Get args
        const args = this.parseArgs(interaction.data.options);
        console.log(`command: ${interaction.data.name}${interaction.data.options ? ` with args: ${JSON.stringify(args)}` : ''}`);
        try {
            // Slash reply
            interaction.channel.cmdreply = new SlashReply(interaction);
            command.executeSlash(interaction, args);
        }
        catch (error) {
            console.error(error);
            interaction.channel.cmdreply.send('มีข้อผิดพลาดระหว่างการทำคำสั่ง');
        }
    },
    parseArgs(options) {
        const args = {};
        while (options !== undefined) {
            if (options[0].type < 3) {
                options = options.options;
            }
            else {
                for (const option of options) {
                    args[option.name] = option.value;
                }
                break;
            }
        }
        return args;
    }
};