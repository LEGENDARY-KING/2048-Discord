const dbobj = require("../database.js")
const config = require("../config.json")
const Discord=require("discord.js")

module.exports = {
    name: "eval",
    description: "Execute Node.js Code(Only For Owners)",
    async execute(message, args) {
        let client = message.client
        if (!config.ownerIds.includes(message.author.id)) return message.reply("Shhh owner only command").then(m => { setTimeout(() => {m.delete()}),5000}) //Return and Reply and delete after 5 seconds if someone other than ownerIDs use the command
        try {
            const evaled = eval(args.join(" "));
            const cleaned = await clean(evaled);
            message.channel.send(`\`\`\`js\n${cleaned}\n\`\`\``);
        } catch (err) {
            message.channel.send(`\`ERROR\` \`\`\`xl\n${err}\n\`\`\``);
        }
    },
};

const clean = async (text) => {
    if (text && text.constructor.name == "Promise")
        text = await text;
    if (typeof text !== "string")
        text = require("util").inspect(text, { depth: 1 });
    text = text
        .replace(/`/g, "`" + String.fromCharCode(8203))
        .replace(/@/g, "@" + String.fromCharCode(8203));
    text = text.replaceAll(config.token, "[REDACTED]");
    return text;
}