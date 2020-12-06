const Discord = require('discord.js');
const rankBot = require('../utils/functions.js');
const path = require('path');
const {status} = require(path.join(__dirname, '..','config', 'messages.json'));
const deleteMessageDelay = process.env.DELETE_MESSAGE_DELAY;

module.exports = {
    name: 'create',
    description: "Create the Ranking-Table in a specific channel.",
    execute(message, client) {

        message.channel.lastMessage.delete();

        // create embed message
        const embed = new Discord.MessageEmbed();

        const rankData = rankBot.readFromFile(message.guild.id);

        // get embedData
        let record_embed = rankData.record_embed;
        embed.setAuthor("Raid Clan Boss RankBot", '','https://rsl-tools.de/');
        //embed.setTitle('Höchster Schaden den man an einem Clan Boss mit _einem_ Key gemacht hat');
        embed.setThumbnail('http://philaurent-raid.de/images/2/20/Clan-Boss.png')

        embed.setFooter('Dwza\'s RSL Clan Boss RankingBot - v1.1.0');
        // set embed attributes
        embed.setColor(record_embed.color);
        embed.setDescription('Ein Ranking für den höchster Schaden den man mit **__einem__** :key: am Clan Boss gemacht hat.');
        // get titles from embedData
        let titles = record_embed.fields;
        // build fields
        embed.addField('Befehlsbeispiele:', 'Hier die Befehle die zum benutzen des RankBots benötigt werden.');
        embed.addField('Eintrag hinzufügen', '```!cb1 12.34``````!cb3 23,45```', true);
        embed.addField('Eintrag Löschen', '```!cb1 -d``````!cb5 -d```', true);
        embed.addField('Eintrag Überschreiben', '```!cb1 12.34 -f``````!cb6 23,65 -f```', true);
        //embed.addField('-------------------------------------------------------------------------------', '**Rankings:** \n----------------------------------------------------------------------------');
        embed.addField('\u200B', '\u200B');
        embed.addField('Rankings:', '\u200B');


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
                console.log(e);
                message.channel.send(status.errors.embed).then(m => m.delete({timeout: Number(deleteMessageDelay)}));
            }
        });
    }
}