const bot = require('../utils/functions.js');

module.exports = {
    name: 'cg',
    aliases: ['create_group', 'cGrp'],
    permissions: ['ADMINISTRATOR'],
    description: "Add Group-ID to config file. File will be created if not exist",
    execute(client, message, args, command) {

        bot.deleteLastMessage(message);
        
        if(!args[0]) message.reply('Parameter missing. Need Group ID').then(m => m.delete({timeout: 3000}));
        
        // create file if not exists
        const guildId = message.guild.id;
        const filename = bot.utils.path.join(bot.paths.guildConfigPath, guildId + '.json');
        if (!bot.utils.fs.existsSync(filename)) {
            bot.utils.fs.copyFileSync(bot.templates.guildConfigTemplate, filename);
        }
        
        // add to config file
        bot.utils.fs.writeFileSync(filename, JSON.stringify({"coaching_channel_id": args[0]}, null, 4));
        return message.reply('Added group to guild configs').then(m => m.delete({timeout: 3000}));
    }
}

