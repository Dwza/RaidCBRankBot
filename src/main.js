require('dotenv-flow').config();
const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');

const botRoot = path.join(__dirname, '..');
const messageFile = path.join(botRoot, 'config', 'messages.json');
const owner_id = process.env.OWNER;
const prefix = process.env.PREFIX;
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

    if(command === 'purge' && (message.author.id === owner_id || message.member.hasPermission("ADMINISTRATOR"))) {
        client.commands.get('purge').execute(message, args, messageFile);
    }

    if (['cb1', 'cb2', 'cb3', 'cb4', 'cb5', 'cb6'].indexOf(command) !== -1) {
        client.commands.get('cb').execute(message, args, command, client);
    }

    if (command === 'cc') {
        client.commands.get('cc').execute(message);
    }
});

client.login();