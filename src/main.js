const Discord = require('discord.js');
require('dotenv-flow').config();
const fs = require('fs');
const path = require('path');

const botRoot = path.join(__dirname, '..');
const configFile = path.join(botRoot, 'config', 'config.json');
const messageFile = path.join(botRoot, 'config', 'messages.json');
const functionPath = path.join(botRoot, 'utils', 'functions.js');

const rankBot = require(functionPath);
const config = require(configFile);
const {errors, status} = require(messageFile);
const {positions, stages} = require(configFile);

const owner_id = process.env.OWNER;
const prefix = process.env.PREFIX;
const rankFileDir = process.env.RANK_FILE_DIR;

const client = new Discord.Client();

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`../commands/${file}`);
    client.commands.set(command.name, command);
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.username}`);
});


client.on('message', (msg) => {
    let content = msg.content;
    let channel = msg.channel;
    let member = msg.member;

    if (msg.author.bot || !content.startsWith(prefix)) return;

    let rankings = readFromFile(msg.guild.id);
    const args = content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const author_id = msg.author.id;
    let score = args[0];

    const options = {
        "delete": false,
        "force": false,
        "help": false
    };

    let rank = {
        'id': author_id,
        'date': rankBot.getDate()
    };

    let dataObject = {
        "rank": rank,
        "channel": channel
    };

    if (args.indexOf('-h') !== -1) {
        options.help = true;
    }

    if (args.indexOf('-d') !== -1) {
        removeFromRank(command, dataObject, rankings, msg.guild.id);
        return;
    }else {
        if(typeof score !== "undefined"){
            score = score.replace(/,/g,'.');
        }
        rank.score = parseFloat(score).toFixed(2);
        dataObject.rank = rank;
    }

    if (args.indexOf('-f') !== -1) {
        options.force = true
    }

    if(command === 'update' && (msg.author.id === owner_id || member.hasPermission("ADMINISTRATOR"))){
        channel.lastMessage.delete();
        let rankChannel = getRankChannel(msg.guild.id);
        let {record_embed, cb1 = null, cb2 = null, cb3 = null, cb4 = null, cb5 = null, cb6 = null} = require(rankFileDir + msg.guild.id + '.json');
        rankChannel.messages.fetch(record_embed.id).then(message => {
            let mEmbed = message.embeds[0];

            for ( let i = 1; i <= 6; i++) {
                mEmbed.fields[i-1].name = '```' + record_embed.fields[stages[i]] + '```';
                let cb = eval('cb' + i);
                let newValue = '';
                if(cb !== null) {
                    if(cb.length > 0) {
                        cb.sort(function(a, b) {
                            return b.score - a.score;
                        });
                        cb.forEach(function(e, n){
                            newValue += rankLine(e, n+1);
                        });
                    }else{
                        newValue = '-';
                    }
                }else {
                    newValue = '-';
                }

                mEmbed.fields[i-1].value = newValue;
            }
            message.edit(mEmbed).then();
        });
    }

    if(command === 'test' && msg.author.id === owner_id) {
        client.commands.get('test').execute(msg, args, rankBot);
    }

    if(command === 'purge'){
        client.commands.get('purge').execute(msg, args, messageFile);
    }


    if (command === 'create' && (msg.author.id === owner_id || member.hasPermission("ADMINISTRATOR"))) {

        channel.lastMessage.delete();

        // create embed message
        const embed = new Discord.MessageEmbed();

        const dataFile = rankFileDir + msg.guild.id + '.json';

        if(!fs.existsSync(dataFile)){
            fs.copyFileSync('./resources/template.json', dataFile);
        }

        const rankings = rankBot.readFromFile(msg.guild.id);



        // get embedData
        let record_embed = rankings.record_embed;
        // set embed attributes
        embed.setColor(record_embed.color);
        embed.setDescription(record_embed.description);
        // get titles from embedData
        let titles = record_embed.fields;
        // build fields
        for (const [key] of Object.entries(titles)) {
            embed.addField('```' + titles[key] + '```', '-');
        }

        // send embed to channel
        channel.send(embed).then(sent => {
            rankings.record_embed.id = sent.id;
            rankings.record_embed.channel = channel.id;
            fs.writeFile(dataFile, JSON.stringify(rankings, null, 4), err => {
                if (err) throw err;
                channel.send(status.added.embed).then(m => m.delete({timeout: 5000}));
            });
        });
        //*/
    }

    if (['cb1', 'cb2', 'cb3', 'cb4', 'cb5', 'cb6'].indexOf(command) !== -1) {
        addRank(command, dataObject, rankings, options, msg.guild.id);
    }
});

client.login();

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
        /** create new cb array **/
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

function updateEmbed(command, dataObject, rankings, guildId){
    let rankChannel = getRankChannel(guildId);
    rankChannel.messages.fetch(rankings.record_embed.id).then(message => {
        let e = message.embeds[0];
        let newValue = '';
        let allRankings = readFromFile(guildId)[command];
        if(allRankings.length > 0){
            allRankings.sort(function(a, b) {
                return b.score - a.score;
            });

            for (let i = 0; i < allRankings.length; i++) {
                newValue += rankLine(allRankings[i], i+1);
            }
        }else {
            newValue = '-';
        }

        let i = parseInt(command.substr(-1)) - 1;
        e.fields[i].name = '```' + rankings.record_embed.fields[stages[i+1]] + '```';
        e.fields[i].value = newValue;
        message.edit(e).then();
    });
}

function writeToFile(data, guildId) {
    fs.writeFileSync(rankFileDir + guildId + '.json', JSON.stringify(data, null, 4));
}

function readFromFile(guildId){
    let filename = createRankFile(guildId);
    return JSON.parse(fs.readFileSync(filename, "utf8"));
}

function createRankFile(guildId){
    let filename = rankFileDir + guildId + '.json';
    if(!fs.existsSync(filename)){
        fs.copyFileSync(process.env.RANK_TEMPLATE, filename);
    }
    return filename;
}

function getRankChannel(guildId) {
    let file = readFromFile(guildId);
    return client.channels.cache.find( ch => ch.id === file.record_embed.channel);
}