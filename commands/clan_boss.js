const bot = require('../utils/functions.js');
const path = require('path');
const {cb} = require(path.join(__dirname, '..', 'config', 'messages.json'));
const deleteMessageDelay = process.env.DELETE_MESSAGE_DELAY;

module.exports = {
    name: 'cb',
    aliases: [],
    permissions: [],
    description: "Adds entry to Leaderboard",
    execute(client, message, args, command) {

        bot.deleteLastMessage();

        const options = {
            "delete": args.indexOf('-d') !== -1,
            "force": args.indexOf('-f') !== -1,
            "help": args.indexOf('-h') !== -1
        };

        // get guild id
        const guildId = message.guild.id;

        if (options.delete) {
            const result = bot.removeFromRank(command, message, client, args);
            if (result) {
                message.channel.send('Your entry has been removed.').then(m => m.delete({timeout: Number(deleteMessageDelay)}));
            } else {
                message.channel.send('No entry found.').then(m => m.delete({timeout: Number(deleteMessageDelay)}));
            }
            return;
        }
        // early exit if some data is missing
        if (!args[0]) return message.reply(cb.missing).then(m => m.delete({timeout: Number(deleteMessageDelay)}));
        // replace comma with dot to make it a valid float
        const param = args[0].replace(/,/g, '.');
        if (isNaN(param)) return message.reply(cb.number).then(m => m.delete({timeout: deleteMessageDelay}));
        // get new score
        let score = parseFloat(param).toFixed(2);
        // get rank data
        let rankData = bot.readFromFile(guildId);
        // check if cb entry exists
        if (Object.keys(rankData).indexOf(command) !== -1) {
            // check if author has an entry
            let found = rankData[command].find(item => {
                return item.id === message.author.id;
            });

            if (found) {
                if (parseFloat(found.score).toFixed(2) >= score && !options.force) {
                    message.channel.send(cb.low).then(m => m.delete({timeout: Number(deleteMessageDelay)}));
                    return;
                }
            }
        } else {
            /** create new cb array **/
            rankData[command] = [];
        }

        let key = rankData[command].findIndex(item => {
            return item.id === message.author.id;
        });
        if (key !== -1) {
            rankData[command][key].score = score;
            rankData[command][key].date = bot.getDate();

        } else {
            rankData[command].push({
                "id": message.author.id,
                "date": bot.getDate(),
                "score": score
            });
        }
        bot.writeToFile(guildId, rankData);
        message.channel.send(cb.added.rank).then(m => m.delete({timeout: Number(deleteMessageDelay)}));

        bot.updateEmbed(rankData, command, guildId, client);
    }
}