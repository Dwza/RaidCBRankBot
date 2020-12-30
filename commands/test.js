module.exports = {
    name: 'test',
    aliases: [],
    permissions: ['OWNER'],
    description: 'Testing some commands',
    execute(client, message, args, command) {
        message.channel.lastMessage.delete();
        //const user = message.mentions.users.first();
        //const id = client.users.cache.find(u => u.tag === args[0]).id;
        //console.log(args);
        //console.log(user);
    }
}