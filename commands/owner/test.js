module.exports = {
    name: 'test',
    description: 'Testing some commands',
    execute(message, args, client) {
        //const user = client.users.cache.get('783751587189358595');
        //console.log(user);
        //const id = client.users.cache.find(u => u.tag === args[0]).id;
        //console.log(args);
        //console.log(user);

        const uName = message.author.username;
        console.log(message.author);
        const server = message.guild;
        let exist = server.channels.cache.find(c => c.name === uName.toLowerCase());
        
        if(!exist) {
            server.channels.create(uName)
            .then(channel => {
                let category = server.channels.cache.find(c => c.name.toLowerCase() === "coaching" && c.type === "category");
                if (!category) throw new Error("Category channel does not exist");
                channel.setParent(category.id);
            }).catch(console.error);
        }
    }
}