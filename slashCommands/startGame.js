const { SlashCommandBuilder } = require('@discordjs/builders');
const { dbobj } = require("../database.js")
const config = require("../config.json")
const Discord = require("discord.js")
const buildBoard = require("../utils/buildBoard.js");
const mainGame = require("../utils/mainGame.js");
const optionsMain = new Discord.MessageActionRow().setComponents([
    new Discord.MessageButton().setCustomId("left").setEmoji("◀️").setStyle("PRIMARY"),
    new Discord.MessageButton().setCustomId("up").setEmoji("🔼").setStyle("PRIMARY"),
    new Discord.MessageButton().setCustomId("down").setEmoji("🔽").setStyle("PRIMARY"),
    new Discord.MessageButton().setCustomId("right").setEmoji("▶️").setStyle("PRIMARY"),
]);
const optionsSecondary = new Discord.MessageActionRow().setComponents([
    new Discord.MessageButton().setCustomId("save").setLabel("SAVE").setEmoji("📩").setStyle("SUCCESS"),
    new Discord.MessageButton().setCustomId("clear").setLabel("RESET").setEmoji("❌").setStyle("DANGER")
])
const disabledOptionsMain = new Discord.MessageActionRow().setComponents([
    new Discord.MessageButton().setCustomId("left").setEmoji("◀️").setStyle("PRIMARY").setDisabled(true),
    new Discord.MessageButton().setCustomId("up").setEmoji("🔼").setStyle("PRIMARY").setDisabled(true),
    new Discord.MessageButton().setCustomId("down").setEmoji("🔽").setStyle("PRIMARY").setDisabled(true),
    new Discord.MessageButton().setCustomId("right").setEmoji("▶️").setStyle("PRIMARY").setDisabled(true),
]);
const disabledOptionsSecondary = new Discord.MessageActionRow().setComponents([
    new Discord.MessageButton().setCustomId("save").setLabel("SAVE").setEmoji("📩").setStyle("SUCCESS").setDisabled(true),
    new Discord.MessageButton().setCustomId("clear").setLabel("RESET").setEmoji("❌").setStyle("DANGER").setDisabled(true)
]);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('Starts(Or continues) a 2048 game!')
        .addIntegerOption(option => option.setName('grid').setDescription('Set the size of the 2048 board. Default 4').addChoices([["3", 3], ["4", 4], ["5", 5], ["6", 6], ["7", 7], ["8", 9], ["10", 10]]))
        .addBooleanOption(option => option.setName('force').setDescription('Force starts a new game(OLD GAME CANNOT BE RETRIEVED)'))
        .addStringOption(option => option.setName('loadslot').setDescription('Loads a game(Select show to show all slots. Wont work if Force new is true)').addChoices([["Show", 'show'], ["1", '1'], ["2", '2'], ["3", '3'], ["4", '4'], ["5", '5'], ["6", '6'], ["7", '7'], ["8", '9'], ["10", '10']])),
    async execute(interaction) {
        await interaction.reply({ content: "Fetching data", });
        let data = dbobj.getDB(interaction.user.id);
        let force = interaction.options.getBoolean('force') || false;
        let load = interaction.options.getString('loadslot');
        if (load && !force) {
            if (load == 'show') {
                interaction.editReply("Showing all saved games...");
                let message = await interaction.channel.send("Waiting for database...");
                var optionData = []
                for (let i = 0; i < 10; i++) {
                    if (data.saved[i]) optionData.push({ label: "Max Reached " + Math.pow(2, data.saved[i].max), value: i + "", description: `Moves: ${data.saved[i].moves} Score: ${data.saved[i].score}` });
                }
                optionData.push({ label: "cancel", value: "cancel", description: "Cancels the load and starts a new game" });
                const selection = new Discord.MessageActionRow().setComponents([
                    new Discord.MessageSelectMenu().setMaxValues(1).setCustomId("slots").setOptions(optionData)
                ]);
                const embed = new Discord.MessageEmbed()
                    .setTitle("Select the slot which you want to continue")
                    .setFooter({ text: `Played by ${interaction.user.tag} | Please respond in 30 seconds`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp()
                    .setColor("YELLOW");
                message.edit({
                    embeds: [embed],
                    components: [selection],
                })
                const filter = i => {
                    i.deferUpdate();
                    return i.user.id === interaction.user.id;
                };
                message.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 30000 })
                    .then(i => {
                        let value = i.values[0]
                        if (value == "cancel") {
                            let grid = interaction.options.getInteger('grid');
                            if (!grid) grid = 4;
                            let positions = new Array(grid * grid)
                            positions = mainGame.generateRandom(message, [...positions]);
                            positions = mainGame.generateRandom(message, [...positions]);
                            sendGame(positions, message, 0, 0, grid);
                        } else {
                            let selected = data.saved[parseInt(value)];
                            if (selected) {
                                sendGame(selected.board, message, selected.moves, selected.score, selected.grid);
                            } else return message.edit({ embeds: [], components: [], content: "No saved game found at slot " + value + "\nCheck all saved games by /start loadslot: all" });
                        }
                    }).catch(err => {
                        console.log(err)
                        message.channel.send("Unknown Error. Game has been autosaved");
                    })
            } else {
                let savedgame = data.saved[parseInt(load) - 1]
                if (!savedgame) return interaction.editReply("No saved game found at slot " + load + "\nCheck all saved games by /start loadslot: all");
                interaction.editReply("Found saved game");
                let message = await interaction.channel.send({ content: "Loading saved game" });
                sendGame(savedgame.board, message, savedgame.moves, savedgame.score, savedgame.grid);
            }
        } else if (data.autosaved.board && !force) {
            interaction.editReply("Found autosaved game");
            const embed = new Discord.MessageEmbed()
                .setTitle("Autosaved game found")
                .setFooter({ text: "Please respond in 15 seconds" })
                .addFields(
                    { name: "Moves", value: data.autosaved.moves + "", inline: true },
                    { name: "Score", value: data.autosaved.score + "", inline: true },
                    { name: "Started At", value: `<t:${data.autosaved.started.toFixed(0)}>` },
                    { name: "Autosaved At", value: `<t:${data.autosaved.saved.toFixed(0)}>` }
                )
                .setColor("YELLOW")
                .setImage("attachment://game.jpg");
            let board = buildBoard(data.autosaved.board, data.autosaved.grid);
            let attachment = new Discord.MessageAttachment(board.toBuffer(), "game.jpg");
            if (data.autosaved.url) {
                let url = data.autosaved.url.split("/")
                let channel = await client.channels.cache.fetch(url[5]);
                let message = await channel.messages.fetch(url[6]);
                if (message) {
                    embed.addField("From", `[Click Here](${data.autosaved.url})`, true);
                    let emb = message.embeds[0]
                    emb.setTitle("Game started elsewhere");
                    messaged.edit({ embeds: [emb], components: [disabledOptionsMain, disabledOptionsSecondary], files: [attachment] });
                }
            }
            const components = new Discord.MessageActionRow().setComponents([
                new Discord.MessageButton().setCustomId("continue").setLabel("Continue this game").setStyle("SUCCESS"),
                new Discord.MessageButton().setCustomId("clear").setLabel("Clear this game").setStyle("DANGER")
            ]);

            let message = await interaction.channel.send({ embeds: [embed], components: [components], files: [attachment] })
            const filter = i => {
                i.deferUpdate();
                return i.user.id === interaction.user.id;
            };
            message.awaitMessageComponent({ filter, componentType: 'BUTTON', time: 15000 })
                .then(i => {
                    if (i.customId == 'continue') sendGame(data.autosaved.board, message, data.autosaved.moves, data.autosaved.score, data.autosaved.grid);
                    if (i.customId == 'clear') {
                        message.edit({ content: "Loading new game..." });
                        let grid = interaction.options.getInteger('grid');
                        if (!grid) grid = 4;
                        let positions = new Array(grid * grid)
                        positions = mainGame.generateRandom(message, [...positions]);
                        positions = mainGame.generateRandom(message, [...positions]
                            );
                        sendGame(positions, message, 0, 0, grid);
                    }
                })
                .catch(err => {
                    message.channel.send("Unknown Error. Game is still saved");
                    components.setComponents([
                        new Discord.MessageButton().setCustomId("continue").setLabel("Continue this game").setStyle("SUCCESS").setDisabled(true),
                        new Discord.MessageButton().setCustomId("clear").setLabel("Clear this game").setStyle("DANGER").setDisabled(true)
                    ]);
                    message.edit({ embeds: [embed], components: [components], files: [attachment] });
                });
        } else {
            await interaction.editReply({ content: "No autosaved game found. Generating a new game." });
            let message = await interaction.channel.send({ content: "Loading new game..." });
            let grid = interaction.options.getInteger('grid');
            if (!grid) grid = 4;
            let positions = new Array(grid * grid)
            positions = mainGame.generateRandom(message, [...positions]);
            positions = mainGame.generateRandom(message, [...positions]);
            sendGame(positions, message, 0, 0, grid);
        }
        async function sendGame(positions, message, moves, score, grid) {
            let board = buildBoard(positions, grid);
            let attachment = new Discord.MessageAttachment(board.toBuffer(), "game.jpg");
            const embed = new Discord.MessageEmbed()
                .setTitle("2048 game")
                .setFooter({ text: `Played by ${interaction.user.tag} | Please respond in 2 minutes`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .addFields(
                    { name: "Moves", value: moves + "", inline: true },
                    { name: "Score", value: score + "", inline: true })
                .setTimestamp()
                .setColor("YELLOW")
                .setImage("attachment://game.jpg");

            message.edit({
                content: "Loaded!",
                embeds: [embed],
                components: [optionsMain, optionsSecondary],
                files: [attachment],
            })
            data.autosaved = {
                started: message.createdTimestamp / 1000,
                saved: Date.now() / 1000,
                board: positions,
                score: score,
                moves: moves,
                grid: grid,
                message: message.url
            }
            data.autosaved = JSON.stringify(data.autosaved);
            data.saved = JSON.stringify(data.saved);
            dbobj.setUser.run(data);
            data.autosaved = JSON.parse(data.autosaved);
            data.saved = JSON.parse(data.saved);

            const filter = i => {
                i.deferUpdate();
                return i.user.id === interaction.user.id;
            };
            message.awaitMessageComponent({ filter, componentType: 'BUTTON', time: 120 * 1000 })
                .then(async i => {
                    if (i.customId == "clear") {
                        const components = new Discord.MessageActionRow().setComponents([
                            new Discord.MessageButton().setCustomId("continue").setLabel("Continue this game").setStyle("SUCCESS"),
                            new Discord.MessageButton().setCustomId("clear").setLabel("Clear this game").setStyle("DANGER")
                        ]);
                        embed.setTitle("Are you sure you want to reset this game");
                        message.edit({ embeds: [embed], components: [components], files: [attachment] })
                        message.awaitMessageComponent({ filter, componentType: 'BUTTON', time: 15000 })
                            .then(i => {
                                if (i.customId == 'continue') sendGame(positions, message, moves, score, grid);
                                if (i.customId == 'clear') {
                                    message.edit({ content: "Loading new game..." });
                                    let grid = interaction.options.getInteger('grid');
                                    if (!grid) grid = 4;
                                    let positions = new Array(grid * grid)
                                    positions = mainGame.generateRandom(message, [...positions]);
                                    positions = mainGame.generateRandom(message, [...positions]);
                                    sendGame(positions, message, 0, 0, grid);
                                }
                            })
                    } else if (i.customId == "save") {
                        let optionData = [];
                        for (let i = 0; i < 10; i++) {
                            if (!data.saved[i]) optionData.push({ label: "Slot " + (i + 1), value: i + "", description: "Empty Slot" });
                            else optionData.push({ label: "Max Reached " + Math.pow(2, data.saved[i].max), value: i + "", description: `Moves: ${data.saved[i].moves} Score: ${data.saved[i].score}` });
                        }
                        optionData.push({ label: "cancel", value: "cancel", description: "Cancels the save and continues the game" });
                        const selection = new Discord.MessageActionRow().setComponents([
                            new Discord.MessageSelectMenu().setMaxValues(1).setCustomId("slots").setOptions(optionData)
                        ]);
                        embed
                            .setTitle("Select the slot where you want to save this game")
                            .setFooter({ text: `Played by ${interaction.user.tag} | Please respond in 30 seconds`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });
                        message.edit({
                            embeds: [embed],
                            components: [selection],
                            files: [attachment],
                        })
                        message.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 30000 })
                            .then(i => {
                                let value = i.values[0]
                                if (value == "cancel") sendGame(positions, message, moves, score, grid);
                                else {
                                    data.saved[parseInt(value)] = {
                                        max: Math.max(...positions.filter(i => i != undefined)),
                                        board: positions,
                                        moves: moves,
                                        grid: grid,
                                        score: score,
                                        savedAt: Date.now() / 1000,
                                        startedAt: message.createdTimestamp / 1000
                                    }
                                    data.autosaved = "{}"
                                    data.saved = JSON.stringify(data.saved);
                                    dbobj.setUser.run(data);
                                    data.autosaved = JSON.parse(data.autosaved);
                                    data.saved = JSON.parse(data.saved);
                                    var emb = new Discord.MessageEmbed().setTitle("Saved! Play by using /start loadslot:" + (parseInt(value) + 1)).setColor("GREEN");
                                    message.edit({ content: "Saved!", embeds: [emb], attachments: [], components: [] })
                                }
                            }).catch(err => {
                                console.log(err)
                                message.channel.send("Unknown Error. Game has been autosaved");
                            })
                    } else {
                        let moved = mainGame.move(message, [...positions], i.customId, grid, score);
                        if (moved == false) {
                            message.channel.send("No legal move in that direcion.").then(m => setTimeout(() => { m.delete() }, 5000));
                            sendGame(positions, message, moves, score, grid);
                            return
                        }
                        else if (moved == 'gameover') {
                            message.channel.send("No legal move in any direction, Game over");
                            embed.setTitle("GAME OVER").setColor("RED");
                            message.edit({ embeds: [embed], files: [attachment], components: [disabledOptionsMain, disabledOptionsSecondary] });
                            data.bestGameMax = JSON.parse(data.bestGameMax);
                            data.bestGameScore = JSON.parse(data.bestGameScore);
                            if (!data.bestGameMax[grid]) data.bestGameMax[grid] = { max: 0 }
                            if (!data.bestGameScore[grid]) data.bestGameScore[grid] = { score: 0 }
                            if (data.bestGameScore[grid].score < score) {
                                let emb = new Discord.MessageEmbed()
                                    .setTitle("New Max Record")
                                    .setDescription("You just made a new record. Highest max score with this grid\n\nYour old record was " + data.bestGameScore[grid].score)
                                    .setColor("GREEN");
                                if (data.bestGameScore[grid].board) {
                                    emb.setImage("attachment://game.jpg").addFields([
                                        { name: "Score", value: data.bestGameScore[grid].score, inline: true },
                                        { name: "Max", value: "" + data.bestGameScore[grid].max, inline: true }
                                    ])
                                    let maxBoard = buildBoard(data.bestGameScore[grid].board, grid);
                                    let attach = new Discord.MessageAttachment(maxBoard.toBuffer(), "game.jpg");
                                    message.channel.send({ embeds: [emb], files: [attach] });
                                }
                                else message.channel.send({ embeds: [emb] });
                                data.bestGameScore[grid] = {
                                    max: Math.max(...positions),
                                    score: score,
                                    moves: moves,
                                    board: positions,
                                    grid: grid
                                }
                            }
                            if (data.bestGameMax[grid].max < Math.max(...positions)) {
                                let emb = new Discord.MessageEmbed()
                                    .setTitle("New Max Record")
                                    .setDescription("You just made a new record. Highest max number with this grid\n\nYour old record was " + data.bestGameScore[grid].max)
                                    .setColor("GREEN");
                                if (data.bestGameMax[grid].board) {
                                    emb.setImage("attachment://game.jpg").addFields([
                                        { name: "Score", value: data.bestGameMax[grid].score, inline: true },
                                        { name: "Max", value: "" + data.bestGameMax[grid].max, inline: true }
                                    ])
                                    let maxBoard = buildBoard(data.bestGameMax[grid].board, grid);
                                    let attach = new Discord.MessageAttachment(maxBoard.toBuffer(), "game.jpg");
                                    message.channel.send({ embeds: [emb], files: [attach] });
                                }
                                else message.channel.send({ embeds: [emb] });
                                data.bestGameMax[grid] = {
                                    max: Math.max(...positions),
                                    score: score,
                                    moves: moves,
                                    board: positions,
                                    grid: grid
                                }
                            }
                            data.autosaved = {}
                            data.autosaved = JSON.stringify(data.autosaved);
                            data.saved = JSON.stringify(data.saved);
                            data.bestGameMax = JSON.stringify(data.bestGameMax);
                            data.bestGameScore = JSON.stringify(data.bestGameScore);
                            dbobj.setUser.run(data);
                            data.autosaved = JSON.parse(data.autosaved);
                            data.saved = JSON.parse(data.saved);
                        } else {
                            moves++
                            positions = moved.positions;
                            score = moved.score
                            positions = mainGame.generateRandom(message, [...positions]);
                            sendGame(positions, message, moves, score, grid);
                        }
                    }
                }).catch(err => {
                    console.log(err)
                    embed.setTitle("Stopped 2048 Game(Has Been Autosaved)");
                    message.edit({
                        embeds: [embed],
                        components: [disabledOptionsMain, disabledOptionsSecondary],
                        files: [attachment],
                    })
                });

        }
    },
};
