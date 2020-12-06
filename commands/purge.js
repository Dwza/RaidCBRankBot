
module.exports = {
    name: 'purge',
    description: "Purge messages!",
    async execute(message, args, messageFile) {
        await message.channel.lastMessage.delete();
        const {purge} = require(messageFile);
        const maxMessages = process.env.MAX_DELETE_MESSAGES;
        const messageTimeout = 3000;

        if (!args[0]) return message.reply(purge.missing).then(m => m.delete({timeout: messageTimeout}));
        if (isNaN(args[0])) return message.reply(purge.number + maxMessages).then(m => m.delete({timeout: messageTimeout}));
        if (args[0] > Number(maxMessages)) return message.reply(purge.max).then(m => m.delete({timeout: messageTimeout}));
        if (args[0] < 1) return message.reply(purge.min).then(m => m.delete({timeout: messageTimeout}));

        await message.channel.messages.fetch({limit: args[0]}).then(messages => {
            message.channel.bulkDelete(messages);
        });

    }
}