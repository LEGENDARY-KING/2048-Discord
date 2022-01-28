module.exports = {
	name: 'guildDelete',
	once: true,
	execute(guild) {
		client.guild.client.channels.cache.get("936337376945520690").send("Left " + guild.name + " ID: " + guild.id);
	},
};