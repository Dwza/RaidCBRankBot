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


client.on('message', (message) => {

    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if(['create', 'update'].indexOf(command) !== -1 && (message.author.id === owner_id || message.member.hasPermission("ADMINISTRATOR"))){
        client.commands.get(command).execute(message, client);
    }

    if(command === 'test' && message.author.id === owner_id) {
        client.commands.get('test').execute(message, args, client);
    }

    if(command === 'purge') {
        client.commands.get('purge').execute(message, args, messageFile);
    }

    if (['cb1', 'cb2', 'cb3', 'cb4', 'cb5', 'cb6'].indexOf(command) !== -1) {
        client.commands.get('cb').execute(message, args, command, client);
    }
});

client.login();