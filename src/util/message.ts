import { MessageOptions, MessagePayload, TextChannel } from 'discord.js';

export async function sendTimedMessage(channel: TextChannel, ms: number, content: string | MessagePayload | MessageOptions) {
    const message = await channel.send(content);
    setTimeout(() => void message.delete().catch(_ => { return; }), ms);
    return message;
}

export function ephemeral(message: string) { return { content: message, ephemeral: true }; }