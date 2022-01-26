const dbobj = require("../database.js")
const config = require("../config.json")

module.exports = {
	name: 'voiceStateUpdate',
	once: false,
	async execute(olds,news) {
        let data
        if (news.channel) data = dbobj.getDB(news.channel.guild.id); //If the user joined a channel
        else if (olds.channel) data = dbobj.getDB(olds.channel.guild.id); //If the user left a channel
        //If channel ID is the one to create new channel then create new channel and move
        if (news.channelId == config.joinVC) {
            try {
                let channel = await news.guild.channels.create(news.member.displayName + "'s Room", {
                    type: "GUILD_VOICE",
                    parent: news.channel.parentId,
                    permissionOverwrites: [{
                        id: news.member.id,
                        allow: "MOVE_MEMBERS",
                        type: "member"
                    }]
                }); //create the new channel on join
                news.setChannel(channel); //Move the user to the new channel
                data.voicechannels.push(channel.id); //Add the channel to the DB
                data.voicechannels = JSON.stringify(data.voicechannels); //Covert it to string to work with flat sql
                dbobj.setGuild.run(data);
                data.voicechannels = JSON.parse(data.voicechannels); //Objectify it again to work in the function
            }
            catch (e) {
                console.error(e);
            }
        }
        //Delete if everyone left from the channels stored in the DB created by the bot
        if (data.voicechannels.includes(olds.channelId)) {
            if (olds.channel.members.size == 0) {
                olds.channel.delete("Everyone Left"); //Delete the channel
                data.voicechannels.splice(data.voicechannels.indexOf(olds.channelId), 1) //Remove the channel from the array
                data.voicechannels = JSON.stringify(data.voicechannels); //Covert it to string to work with flat sql
                dbobj.setGuild.run(data);
                data.voicechannels = JSON.parse(data.voicechannels); //Objectify it again to work in the function
            }
        }
	},
};