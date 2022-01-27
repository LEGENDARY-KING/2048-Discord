module.exports = {
	name: 'guildCreate',
	once: true,
	execute(guild) {
		client.channels.cache.get("936337366195535933").send("Joined " + guild.name + " ID: " + guild.id);
	},
};};