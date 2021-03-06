const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const config = require('./config.json');
var CronJob = require('cron').CronJob;


const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });

const { exec } = require('child_process');
// Registers the slash commands to the discord guild
exec("node ./deploy-commands.js", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
})

//Slash Commands

client.slashCommands = new Collection();

const slashCommandFiles = fs.readdirSync('./slashCommands').filter(file => file.endsWith('.js'));

for (const file of slashCommandFiles) {
    const command = require(`./slashCommands/${file}`);
    // Set a new item in the Collection
    // With the key as the command name and the value as the exported module
    client.slashCommands.set(command.data.name, command);
}
//Text Commands

client.textCommands = new Collection();

const textCommandFiles = fs.readdirSync('./textCommands').filter(file => file.endsWith('.js'));

for (const file of textCommandFiles) {
    const command = require(`./textCommands/${file}`);
    // Set a new item in the Collection
    // With the key as the command name and the value as the exported module
    console.log(`Loaded ${command.name}: ${command.description}`)
    client.textCommands.set(command.name, command);
}


// Event Handling
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}





process.on('uncaughtException', function (err) {
    console.error((err && err.stack) ? err.stack : err);
});



client.login(config.token);