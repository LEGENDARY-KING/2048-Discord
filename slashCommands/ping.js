const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		let sent = await interaction.reply({ content: "Pinging...", fetchReply: true})
		interaction.editReply(`Pong! \`${sent.createdTimestamp - interaction.createdTimestamp}ms\``);
	},
};