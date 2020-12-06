const moment = require('moment');
const fs = require('fs');
const path = require('path');
const rankFileDir = process.env.RANK_FILE_DIR;

const botRoot = path.join(__dirname, '..');
const configFile = path.join(botRoot, 'config', 'config.json');
const {positions, stages} = require(configFile);

module.exports = {
    configFilePath: configFile,
    getDate: () => {
        moment.locale('de');
        return moment().format('L');
    },

    writeToFile: (guildId, data) => {
        fs.writeFileSync(rankFileDir + guildId + '.json', JSON.stringify(data, null, 4));
    },

    readFromFile: (guildId) => {
        let filename = module.exports.createRankFile(guildId);
        return JSON.parse(fs.readFileSync(filename, "utf8"));
    },

    createRankFile: (guildId) => {
        let filename = rankFileDir + guildId + '.json';
        if (!fs.existsSync(filename)) {
            fs.copyFileSync(process.env.RANK_TEMPLATE, filename);
        }
        return filename;
    },

    getRankChannel: (guildId, client) => {
        let file = module.exports.readFromFile(guildId);
        return client.channels.cache.find(ch => ch.id === file.record_embed.channel);
    },
    mention: (id) => {
        return '<@' + id + '>';
    },

    rankLine: (entry, i) => {
        let line = ' - ';
        switch (i) {
            case 1:
                line = positions.first + ' ' ;
                break;
            case 2:
                line = positions.second + ' ';
                break;
            case 3:
                line = positions.third + ' ';
                break;
            default:
                line = positions.other + ' ';
                break;
        }
        return line + module.exports.mention(entry.id) + ' ' + entry.score + ' Mio. *(' + entry.date + ')*\n';
    },
    updateEmbed: (data, command, guildId, client) => {

        let rankChannel = module.exports.getRankChannel(guildId, client);

        rankChannel.messages.fetch(data.record_embed.id).then(message => {

            let e = message.embeds[0];
            let newValue = '';
            let allRankings = data[command];

            if (allRankings.length > 0) {
                allRankings.sort(function(a, b) {
                    return b.score - a.score;
                });

                for (let i = 0; i < allRankings.length; i++) {

                    newValue += module.exports.rankLine(allRankings[i], i + 1);
                }
            } else {
                newValue = '-';
            }

            let i = parseInt(command.substr(-1)) + 5;
            e.fields[i].name = '```' + data.record_embed.fields[stages[i - 6]] + '```';
            e.fields[i].value = newValue;

            message.edit(e).then();

        });
    }
}