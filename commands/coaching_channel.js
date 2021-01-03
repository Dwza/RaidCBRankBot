module.exports = {
    name: 'cc',
    aliases: ['coaching_channel'],
    permissions: [],
    description: "Create a Coaching-Channel",
    execute(client, message, args, command) {

        message.channel.lastMessage.delete();

        const uName = message.author.username;
        const server = message.guild;
        const category = server.channels.cache.find(c => c.name.toLowerCase() === "coaching" && c.type === "category");
        const role = server.roles.cache.find(r => process.env.CC_ROLE.toLowerCase().split(' ').indexOf(r.name.toLowerCase()) !== -1);
        const uRole = message.member.roles.cache.find(r => process.env.CC_ROLE.toLowerCase().split(' ').indexOf(r.name.toLowerCase()) !== -1);
        const uChannel = server.channels.cache.find(c => c.name === uName.toLowerCase());

        if (!category) return message.reply('auf dem Server fehlt die Channel-Gruppe COACHING').then(m => m.delete({timeout: 10000}));
        if(message.author.id !== process.env.OWNER){
            if (!role) return message.reply('auf dem Server fehlt die Rolle: ' + process.env.CC_ROLE).then(m => m.delete({timeout: 10000}));
            if (!uRole) return message.reply('bevor du diesen Befehl nutzen kannst, benötigst du eine dieser Rollen: ' + process.env.CC_ROLE).then(m => m.delete({timeout: 10000}));
        }
        if (uChannel) return message.reply('du hast schon einen Channel: ' + uChannel.toString()).then(m => m.delete({timeout: 10000}));

        server.channels.create(uName)
        .then(channel => {
            channel.setParent(category.id);
        }).catch(console.error);

    }
}