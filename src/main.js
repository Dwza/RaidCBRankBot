require('dotenv-flow').config();
const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');

const botRoot = path.join(__dirname, '..');
const utils = path.join(botRoot, 'utils', 'functions.js');
const bot = require(utils);
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
    const c = client.commands.get(command) || client.commands.find( cmd => typeof cmd.aliases !== 'undefined' && cmd.aliases.indexOf(command) !== -1)

    if(!bot.checkPermission(c.permissions, message)) return bot.accessDenied(message);

    c.execute(client, message, args, command);

});

client.login();