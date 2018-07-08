var config = require('./config'),
    cleverbot = require("cleverbot.io"),
    Discord = require("discord.js"),
    shared = require("./shared");

var botFight = {
    botOneDiscord: new Discord.Client(),
    botTwoDiscord: new Discord.Client(),
    botOneChannel: null, botTwoChannel: null,
    ready: false, started: false,
    botOne: shared.initializeCleverbotInstance(), botTwo: shared.initializeCleverbotInstance(), 
    readyHandler: function() {},
        
    onBotsReady: function() {
        if(!this.ready) {
            this.ready = true;
            console.log("Bots ready!");
            this.readyHandler();
            this.readyHandler = null;
        }
    },
    
    setupDiscordBots: function() {
        var botOneReady = false;
        var botTwoReady = false;
        
        let botFight = this;
        var checkIfDone = function() {
            if(botOneReady && botTwoReady) {
                botFight.onBotsReady();
            }
        }

        this.botOneDiscord.on('ready', () => {
            botOneReady = true;
            this.botOneDiscord.guilds.get(config.fight.guildID).members.get(this.botOneDiscord.user.id).setNickname(config.fight.bot1.name);
            this.botOneChannel = this.botOneDiscord.guilds.get(config.fight.guildID).channels.get(config.fight.channelID);
            if(config.fight.bot1.avatarURL) {
                this.botOneDiscord.user.setAvatar(config.fight.bot1.avatarURL);
            }
            this.botOneDiscord.user.setGame(config.fight.botStatus);
            checkIfDone();
        });
        this.botTwoDiscord.on('ready', () => {
            botTwoReady = true;
            this.botTwoDiscord.guilds.get(config.fight.guildID).members.get(this.botTwoDiscord.user.id).setNickname(config.fight.bot2.name);
            this.botTwoChannel = this.botTwoDiscord.guilds.get(config.fight.guildID).channels.get(config.fight.channelID);
            if(config.fight.bot2.avatarURL) {
                this.botTwoDiscord.user.setAvatar(config.fight.bot2.avatarURL);
            }
            this.botTwoDiscord.user.setGame(config.fight.botStatus);
            checkIfDone();
        });

        this.botOneDiscord.login(config.fight.bot1.discordToken);
        this.botTwoDiscord.login(config.fight.bot2.discordToken);
    },
    
    setup: function(readyHandler) {
        console.log("Setting up bots...")
        shared.createCleverbotInstance(this.botOne);
        shared.createCleverbotInstance(this.botTwo);
        if(readyHandler) {
            this.readyHandler = readyHandler;
        }
        this.setupDiscordBots();
    },
    
    sendMessage: function(sendingBot, message) {
        if(this.started) {
            // Figure out bot variables
            var isBotOne = sendingBot == this.botOne,
                receivingBot = (isBotOne ? this.botTwo : this.botOne),
                receivingBotName = (isBotOne ? config.fight.bot2.name : config.fight.bot1.name),
                sendingBotName = (!isBotOne ? config.fight.bot2.name : config.fight.bot1.name),
                receivingBotDiscordChannel = (isBotOne ? this.botTwoChannel : this.botOneChannel),
                sendingBotDiscordChannel = (!isBotOne ? this.botTwoChannel : this.botOneChannel);
            
            // Log and send message
            console.log(sendingBotName + ": " + message);
            sendingBotDiscordChannel.stopTyping();
            sendingBotDiscordChannel.send(message);

            // Get ready for next bot's message:
            receivingBotDiscordChannel.startTyping();
            var overriddenResponse = shared.getOverriddenResponse(message, receivingBotName);
            var botFight = this;
            if (overriddenResponse) {
                // We set a custom response (provided by the script, not Cleverbot), send it (after delay)
                setTimeout(function() {
                    botFight.sendMessage(receivingBot, overriddenResponse);
                });
            } else {
                // We don't override this response, get from Cleverbot.io
                // Time retrival of response so we can delay if it was quick enough
                var timeStart = new Date().getTime();
                sendingBot.ask(message, function(respErr, response) {
                    if(!respErr) {
                        var timeEnd = new Date().getTime();
                        var duration = timeEnd - timeStart;
                        // Got response, send after appropriate delay
                        setTimeout(function() {
                            botFight.sendMessage(receivingBot, response);
                        }, Math.max(0, 1500 - duration));
                    } else {
                        console.log("Couldn't get " + receivingBotName + "'s response!");
                    }
                });
            }
        }
    },
    
    start: function() {
        if(!this.started) {
            console.log("Starting bots!");
            this.started = true;
            this.sendMessage(this.botOne, config.fight.greeting);
        }
    },
    
    stop: function() {
        console.log("Stopping bots!");
        this.started = false;
    }
};

botFight.setup(function() {
    botFight.start();
});