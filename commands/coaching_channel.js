module.exports = {
    name: 'cc',
    description: "Create a Coaching-Channel",
    execute(message) {

        message.channel.lastMessage.delete();

        const uName = message.author.username;
        const server = message.guild;
        const category = server.channels.cache.find(c => c.name.toLowerCase() === "coaching" && c.type === "category");
        const role = server.roles.cache.find(r => r.name === process.env.CC_ROLE);
        const uRole = message.member.roles.cache.find(r => r.name === process.env.CC_ROLE);
        const uChannel = server.channels.cache.find(c => c.name === uName.toLowerCase());

        if (!category) return message.reply('auf dem Server fehlt die Channel-Gruppe COACHING').then(m => m.delete({timeout: 10000}));
        if (!role) return message.reply('auf dem Server fehlt die Rolle: ' + process.env.CC_ROLE).then(m => m.delete({timeout: 10000}));
        if (!uRole) return message.reply('bevor du diesen Befehl nutzen kannst, benötigst du die Rolle: ' + process.env.CC_ROLE).then(m => m.delete({timeout: 10000}));
        if (uChannel) return message.reply('du hast schon einen Channel: ' + uChannel.toString()).then(m => m.delete({timeout: 10000}));

        server.channels.create(uName)
        .then(channel => {
            channel.setParent(category.id);
        }).catch(console.error);

    }
}