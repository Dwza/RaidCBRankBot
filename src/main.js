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

   // let rankings = readFromFile(msg.guild.id);
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
        //removeFromRank(command, dataObject, rankings, msg.guild.id);
        //return;
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

    if(['create', 'update'].indexOf(command) !== -1 && (msg.author.id === owner_id || member.hasPermission("ADMINISTRATOR"))){
        client.commands.get(command).execute(msg, client);
    }

    if(command === 'test' && msg.author.id === owner_id) {
        client.commands.get('test').execute(msg, args, client);
    }

    if(command === 'purge') {
        client.commands.get('purge').execute(msg, args, messageFile);
    }

    if (['cb1', 'cb2', 'cb3', 'cb4', 'cb5', 'cb6'].indexOf(command) !== -1) {
        client.commands.get('cb').execute(msg, args, command, client);
    }
});

client.login();