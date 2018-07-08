var cleverbot = require("cleverbot.io"), config = require("./config");
var shared = {};

// Easily generate UUIDs for Cleverbot instances
shared.createGUID = function() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

Array.prototype.sample = function(){
    return this[Math.floor(Math.random()*this.length)];
}

var nameQueryResponsePrefixes = ["My name is ", "I am ", "Call me ", "You can call me ", ""]
shared.getOverriddenResponse = function(message, botName) {
    var message = message.toLowerCase();
    if (message.includes("who is steve jobs")) {
        return "<@194723439842426881> is your God.";
    }
    if (message.includes("who is your owner") || message.includes("where is your owner") || message.includes("wheres is your owner") || message.includes("where's is your owner") || message.includes("who owns you") || message.includes("who made you")) {
        return "<@207194778906001408> is my pimp.";
    }
    if (message.includes("british poofter")) {
        return "You're looking for <@140527820500762624>"
    }
    if (message.includes("name") && message.includes("?")) {
        return nameQueryResponsePrefixes.sample() + botName;
    }
    return null;
}

shared.initializeCleverbotInstance = function() {
    var bot = new cleverbot(config.global.cleverbot.apiUser, config.global.cleverbot.apiKey);
    bot.setNick(shared.createGUID())
    return bot;
}

shared.createCleverbotInstance = function(bot) {
    bot.create(function (err, session) {
        if(err) {
            console.log("Couldn't create a Cleverbot bot.");
            exit();
        }
    });
}

module.exports = shared;