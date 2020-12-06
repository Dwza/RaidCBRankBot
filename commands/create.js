const Discord = require('discord.js');
const rankBot = require('../utils/functions.js');
const path = require('path');
const {status} = require(path.join(__dirname, '..','config', 'messages.json'));
const {record_embed} = require(path.join(__dirname, '..','config', 'config.json'));
const deleteMessageDelay = process.env.DELETE_MESSAGE_DELAY;

module.exports = {
    name: 'create',
    description: "Create the Ranking-Table in a specific channel.",
    execute(message) {
        // delete command from chat
        message.channel.lastMessage.delete();
        // create embed message
        const embed = new Discord.MessageEmbed();
        // load data
        const rankData = rankBot.readFromFile(message.guild.id);
        embed.setAuthor(record_embed.title, record_embed.icon,record_embed.url);
        embed.setThumbnail(record_embed.thumbnail);
        embed.setFooter(record_embed.footer + process.env.VERSION);
        embed.setColor(record_embed.color);
        embed.setDescription(record_embed.description);
        embed.addField('Befehlsbeispiele:', 'Hier die Befehle die zum benutzen des RankBots benötigt werden.');
        embed.addField('Eintrag hinzufügen', '```!cb1 12.34``````!cb3 23,45```', true);
        embed.addField('Eintrag Löschen', '```!cb1 -d``````!cb5 -d```', true);
        embed.addField('Eintrag Überschreiben', '```!cb1 12.34 -f``````!cb6 23,65 -f```', true);
        embed.addField('\u200B', '\u200B');
        embed.addField('Rankings:', '\u200B');
        // get titles from embedData
        let titles = record_embed.fields;

        for (const [key] of Object.entries(titles)) {
            embed.addField('```' + titles[key] + '```', '-');
        }

        // send embed to channel
        message.channel.send(embed).then(sent => {
            rankData.record_embed.id = sent.id;
            rankData.record_embed.channel = message.channel.id;
            try {
                rankBot.writeToFile(message.guild.id, rankData);
                message.channel.send(status.added.embed).then(m => m.delete({timeout: Number(deleteMessageDelay)}));
            }catch (e){
                message.channel.send(status.errors.embed).then(m => m.delete({timeout: Number(deleteMessageDelay)}));
            }
        });
    }
}