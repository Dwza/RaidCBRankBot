const rankBot = require('../utils/functions.js');
const rankFileDir = process.env.RANK_FILE_DIR;
module.exports = {
    name: 'update',
    description: "Update Ranking Embed",
    execute(message, client) {

        message.channel.lastMessage.delete();
        const guildId = message.guild.id;
        let rankChannel = rankBot.getRankChannel(guildId, client);
        let {record_embed, cb1 = null, cb2 = null, cb3 = null, cb4 = null, cb5 = null, cb6 = null} = require('.' + rankFileDir + guildId + '.json');
        // get ranking embed
        rankChannel.messages.fetch(record_embed.id).then(message => {

            const {stages} = require(rankBot.configFilePath);
            let mEmbed = message.embeds[0];
            const fieldPreset = mEmbed.fields.length - 7;

            for ( let i = 1; i <= 6; i++) {
                mEmbed.fields[i+fieldPreset].name = '```' + record_embed.fields[stages[i-1]] + '```';
                let cb = eval('cb' + i);
                let newValue = '';
                if(cb !== null) {
                    if(cb.length > 0) {
                        cb.sort(function(a, b) {
                            return b.score - a.score;
                        });
                        cb.forEach(function(e, n){
                            newValue += rankBot.rankLine(e, n+1);
                        });
                    }else{
                        newValue = '-';
                    }
                }else {
                    newValue = '-';
                }
                mEmbed.fields[i+fieldPreset].value = newValue;
            }
            message.edit(mEmbed).then();
        });
    }
}