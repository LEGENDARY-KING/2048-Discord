module.exports = {
	name: "ping",
	description: "Pong!",
	async execute(message, args) {
		var m = await message.reply("Pinging...")
		m.edit(`Pong! \`${m.createdTimestamp - message.createdTimestamp}ms\``);
	},
};