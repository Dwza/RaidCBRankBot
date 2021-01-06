const moment = require('moment');
const fs = require('fs');
const path = require('path');
const rankFileDir = process.env.RANK_FILE_DIR;
const rankFilePath = path.join(__dirname, '..', 'resources','rank_files');
const configFile = path.join(__dirname, '..', 'config', 'config.json');
const messageFile = path.join(__dirname, '..', 'config', 'messages.json');
const guildConfigPath = path.join(__dirname, '..', 'resources', 'guild_configs');
const rankTemplate = path.join(__dirname, '..', 'resources', 'templates', 'template.json');
const guildConfigTemplate = path.join(__dirname, '..', 'resources','templates', 'configs', 'template.json');
const {positions, stages, record_embed} = require(configFile);

module.exports = {
    configFilePath: configFile,
    msg: require(messageFile),
    config: require(configFile),
    paths: {
        guildConfigPath: guildConfigPath,
        rankFilePath: rankFilePath,
    },
    templates: {
        rankTemplate: rankTemplate,
        guildConfigTemplate: guildConfigTemplate
    },
    utils: {
        moment: moment,
        path: path,
        fs: fs
    },


    getDate: () => {
        moment.locale('de');
        return moment().format('L');
    },

    checkPermission: (permissions, message) => {
        let access = false;
        if(!Array.isArray(permissions)) permissions = [permissions];
        if(permissions.length === 0) return true;
        permissions.forEach(permission => {
            if(permission === "ADMINISTRATOR" && !access){
                access = message.member.hasPermission(permission);
            }
            if(permission === "OWNER" && !access) {
                access = message.author.id === process.env.OWNER;
            }
        });
        return access;
    },

    accessDenied(message, delay = 5000){
        return message.reply(this.msg.permission.denied).then(m => m.delete({timeout: delay}));
    },

    getArgArray: (message) => {
        return message.content.slice(process.env.PREFIX.length).trim().split(/ +/);
    },

    deleteLastMessage: (message) => {
        message.channel.lastMessage.delete();
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
                line = positions.first + ' ';
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

    updateEmbed: (rankData, command, guildId, client) => {

        let rankChannel = module.exports.getRankChannel(guildId, client);

        rankChannel.messages.fetch(rankData.record_embed.id).then(message => {

            let e = message.embeds[0];
            let newValue = '';
            let allRankings = rankData[command];

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

            const preset = e.fields.length - 6;
            let i = parseInt(command.substr(-1)) + (preset -1);
            e.fields[i].name = '```' + record_embed.fields[stages[i - preset]] + '```';
            e.fields[i].value = newValue;

            message.edit(e).then();

        });
    },

    removeFromRank: (command, message, client, args) => {

        const guildId = message.guild.id;
        let author = message.author.id;

        // delete entry for specific user
        if (message.author.id === process.env.OWNER || message.member.hasPermission('ADMINISTRATOR')) {
            const user = message.mentions.users.first();
            if(user !== undefined){
                author = user.id;
            }
        }

        let rankData = module.exports.readFromFile(guildId);

        if (Object.keys(rankData).indexOf(command) !== -1) {
            let key = rankData[command].findIndex(item => {
                return item.id === author;
            });
            if (key !== -1) {
                rankData[command].splice(key, 1);
                module.exports.writeToFile(guildId, rankData);
                module.exports.updateEmbed(rankData, command, guildId, client);
                return true;
            }
        }
        return false;
    }
}

