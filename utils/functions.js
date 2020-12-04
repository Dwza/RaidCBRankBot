const moment = require('moment');
const fs = require('fs');
const rankFileDir = process.env.RANK_FILE_DIR;

module.exports = {
    getDate: () => {
        moment.locale('de');
        return moment().format('L');
    },

    writeToFile: (guildId, data) => {
        fs.writeFileSync(rankFileDir + guildId + '.json', JSON.stringify(data, null, 4));
    },

    readFromFile: (guildId) => {
        let filename = this.createRankFile(guildId);
        return JSON.parse(fs.readFileSync(filename, "utf8"));
    },

    createRankFile: (guildId) => {
        let filename = rankFileDir + guildId + '.json';
        if (!fs.existsSync(filename)) {
            fs.copyFileSync(process.env.RANK_TEMPLATE, filename);
        }
        return filename;
    },

    getRankChannel: (guildId) => {
        let file = this.readFromFile(guildId);
        return client.channels.cache.find(ch => ch.id === file.record_embed.channel);
    },

    updateEmbed: (command, dataObject, rankings, guildId) => {
        let rankChannel = getRankChannel(guildId);
        rankChannel.messages.fetch(rankings.record_embed.id).then(message => {
            let e = message.embeds[0];
            let newValue = '';
            let allRankings = readFromFile(guildId)[command];
            if (allRankings.length > 0) {
                allRankings.sort(function(a, b) {
                    return b.score - a.score;
                });

                for (let i = 0; i < allRankings.length; i++) {
                    newValue += rankLine(allRankings[i], i + 1);
                }
            } else {
                newValue = '-';
            }

            let i = parseInt(command.substr(-1)) - 1;
            e.fields[i].name = '```' + rankings.record_embed.fields[stages[i + 1]] + '```';
            e.fields[i].value = newValue;
            message.edit(e).then();
        });
    }
}

/*
 function removeFromRank(command, dataObject, rankings, guildId) {
 dataObject.channel.lastMessage.delete();

 let dataJson = readFromFile(guildId);
 if (Object.keys(dataJson).indexOf(command) !== -1) {
 let key = dataJson[command].findIndex(item => {
 return item.id === dataObject.rank.id;
 });
 if (key !== -1) {
 dataJson[command].splice(key,1);
 writeToFile(dataJson, guildId);
 updateEmbed(command, dataObject, rankings, guildId);
 }
 }
 }

 function rankLine(entry, i) {
 let line = ' - ';
 switch (i){
 case 1:
 line = positions.first + ' ' + mention(entry.id) + ' ' + entry.score + ' Mio. *(' + entry.date + ')*\n';
 break;
 case 2:
 line =  positions.second + ' ' + mention(entry.id) + ' ' + entry.score + ' Mio. *(' + entry.date + ')*\n';
 break;
 case 3:
 line =  positions.third + ' ' + mention(entry.id) + ' ' + entry.score + ' Mio. *(' + entry.date + ')*\n';
 break;
 default:
 line = positions.other + ' ' + mention(entry.id) + ' ' + entry.score + ' Mio. *(' + entry.date + ')*\n';
 break;
 }
 return line;
 }

 function mention(id) {
 return '<@' + id + '>';
 }

 function addRank(command, dataObject, rankings, options, guildId) {
 let doAdd = true;
 dataObject.channel.lastMessage.delete();

 let dataJson = readFromFile(guildId);

 if (Object.keys(dataJson).indexOf(command) !== -1) {
 let found = dataJson[command].find(item => {
 return item.id === dataObject.rank.id;
 });
 if (found) {
 if (parseFloat(found.score).toFixed(2) >= dataObject.rank.score && !options.force) {
 dataObject.channel.send(errors.low).then(m => m.delete({timeout: 5000}));
 doAdd = false;
 }
 }
 } else {
 // create new cb array
 dataJson[command] = [];
 }
 if (doAdd) {
 let key = dataJson[command].findIndex(item => {
 return item.id === dataObject.rank.id;
 });
 if (key !== -1) {
 dataJson[command][key].score = dataObject.rank.score;
 dataJson[command][key].date = dataObject.rank.date;

 } else {
 dataJson[command].push(dataObject.rank);
 }
 writeToFile(dataJson, guildId);
 dataObject.channel.send(status.added.rank).then(m => m.delete({timeout: 3000}));
 }
 updateEmbed(command, dataObject, rankings, guildId);
 }
 */
