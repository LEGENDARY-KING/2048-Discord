const { SlashCommandBuilder } = require('@discordjs/builders');
const dbobj = require("../database.js")
const config = require("../config.json")
const Discord = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Shows the help command'),
	async execute(interaction) {
		let embed = new Discord.MessageEmbed().setTitle("Help Menu")
			.setDescription(`This is a bot for the game [2048](https://play2048.co/)
To start a game type \`/start\`
Thats it, press the buttons to move the tiles in any direction and reach 2048

You can also configure the grid size using \`/start grid:3-10\`

The bot autosaves after every move so dont worry if you have to go, You can continue instantly

You can also save by pressing the save button and then the slot
And you can load by \`/ start loadslot: [SlotNumber] or Show\` to show all the options`);
		let link = new Discord.MessageActionRow().setComponents([
			new Discord.MessageButton().setStyle("LINK").setURL("https://youtu.be/Ru-RKzMohFs").setLabel("Video tutorial"),
			new Discord.MessageButton().setStyle("LINK").setURL("https://discord.com/api/oauth2/authorize?client_id=592382087797932045&permissions=116736&scope=bot%20applications.commands ").setLabel("Invite the bot!"),
			new Discord.MessageButton().setStyle("LINK").setURL("https://discord.gg/EKZTYtznav").setLabel("Join support server")
			])
		interaction.reply({ embeds: [embed], components: [link], ephemeral: true });
	},
};