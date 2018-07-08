var config = require('./config'),
    cleverbot = require("cleverbot.io"),
    Discord = require("discord.js"),
    shared = require("./shared"),
    typingHandler = require("./typing_handler");
    
var botTalk = {

    botDiscord: new Discord.Client(),
    botChannel: null,
    ready: false,
    bot: shared.initializeCleverbotInstance(),
    readyHandler: function() {},
    typingHandler: null,
            
    onBotsReady: function() {
        if(!this.ready) {
            this.ready = true;
            console.log("Bots ready to take requests!");
            this.readyHandler();
            this.readyHandler = null;
        }
    },

 
    sendReplyTo: function(user, reply) {
        this.typingHandler.stopTyping();
        console.log("Responding to " + user.username + " with: " + reply);
        this.botChannel.send("" + user.toString() + ": " + reply);
    },
    
    handleResponseTo: function(message, fromUser) {
        this.typingHandler.startTyping();
        var overriddenResponse = shared.getOverriddenResponse(message, config.talk.bot.name);
        var botTalk = this;
        if (overriddenResponse) {
            // We set a custom response (provided by the script, not Cleverbot), send it (after delay)
            setTimeout(function() {
                botTalk.sendReplyTo(fromUser, overriddenResponse);
            }, 500);
        } else {
            // We don't override this response, get from Cleverbot.io
            // Time retrival of response so we can delay if it was quick enough
            var timeStart = new Date().getTime();
            this.bot.ask(message, function(respErr, response) {
                if(!respErr) {
                    var timeEnd = new Date().getTime();
                    var duration = timeEnd - timeStart;
                    // Got response, send after appropriate delay
                    setTimeout(function() {
                        botTalk.sendReplyTo(fromUser, response);
                    }, Math.max(0, 500 - duration));
                } else {
                    console.log("Couldn't get response!");
                    botTalk.typingHandler.stopTyping();
                }
            });
        }
    },
    
    setupDiscordBot: function() {
        var botTalk = this;
        this.botDiscord.on('ready', () => {
            botTalk.botDiscord.guilds.get(config.talk.guildID).members.get(botTalk.botDiscord.user.id).setNickname(config.talk.bot.name);
            botTalk.botChannel = botTalk.botDiscord.guilds.get(config.talk.guildID).channels.get(config.talk.channelID);
            botTalk.typingHandler = new typingHandler(botTalk.botChannel);
            if(config.talk.bot.avatarURL) {
                botTalk.botDiscord.user.setAvatar(config.talk.bot.avatarURL);
            }
            botTalk.botDiscord.user.setGame(config.talk.botStatus);
            botTalk.onBotsReady();
        });
        this.botDiscord.on('message', function(message) {
            if(message.channel.type == "text" && message.channel.guild.id == config.talk.guildID && message.channel.id == config.talk.channelID && message.author.id != botTalk.botDiscord.user.id && message.content != "") {
                console.log("" + message.author.username + " said: " + message.content);
                botTalk.handleResponseTo(message.content, message.author);
            }
        });

        this.botDiscord.login(config.talk.bot.discordToken);
    },
    
    setup: function(readyHandler) {
        console.log("Setting up bots...")
        shared.createCleverbotInstance(this.bot);
        if(readyHandler) {
            this.readyHandler = readyHandler;
        }
        this.setupDiscordBot();
    },
};

botTalk.setup();