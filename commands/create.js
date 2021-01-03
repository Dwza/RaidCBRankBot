const Discord = require('discord.js');
const bot = require('../utils/functions.js');
const deleteMessageDelay = process.env.DELETE_MESSAGE_DELAY;

module.exports = {
    name: 'create',
    aliases: [],
    permissions: ['ADMINISTRATOR'],
    description: "Create the Ranking-Table in a specific channel.",
    execute(client, message, args, command) {

        bot.deleteLastMessage(message);
        // create embed message
        const embed = new Discord.MessageEmbed();

        // load data
        const rankData = bot.readFromFile(message.guild.id);
        embed.setAuthor(bot.config.record_embed.title, bot.config.record_embed.icon,bot.config.record_embed.url);
        embed.setThumbnail(bot.config.record_embed.thumbnail);
        embed.setFooter(bot.config.record_embed.footer + process.env.VERSION);
        embed.setColor(bot.config.record_embed.color);
        embed.setDescription(bot.config.record_embed.description);
        embed.addField('Befehlsbeispiele:', 'Hier die Befehle die zum benutzen des RankBots benötigt werden.');
        embed.addField('Eintrag hinzufügen', '```!cb1 12.34``````!cb3 23,45```', true);
        embed.addField('Eintrag Löschen', '```!cb1 -d``````!cb5 -d```', true);
        embed.addField('Eintrag Überschreiben', '```!cb1 12.34 -f``````!cb6 23,65 -f```', true);
        embed.addField('\u200B', '\u200B');
        embed.addField('Rankings:', '\u200B');
        // get titles from embedData
        let titles = bot.config.record_embed.fields;

        for (const [key] of Object.entries(titles)) {
            embed.addField('```' + titles[key] + '```', '-');
        }

        // send embed to channel
        message.channel.send(embed).then(sent => {
            rankData.record_embed.id = sent.id;
            rankData.record_embed.channel = message.channel.id;
            try {
                bot.writeToFile(message.guild.id, rankData);
                message.channel.send(bot.msg.status.added.embed).then(m => m.delete({timeout: Number(deleteMessageDelay)}));
            }catch (e){
                message.channel.send(bot.msg.status.errors.embed).then(m => m.delete({timeout: Number(deleteMessageDelay)}));
            }
        });
    }
}