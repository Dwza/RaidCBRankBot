module.exports = {
    name: 'test',
    description: 'Testing some commands',
    execute(message, args, fn){
        let date = fn.getDate();
        console.log(fn.readFromFile(message.guild.id));
        message.channel.send('this is the shit!!!: ' + args);
        message.channel.send(process.env.RANK_FILE_DIR);
    }
}