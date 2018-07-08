function TypingHandler(channel) {
    return {
        typingCount: 0,
        botChannel: channel,
        
        startTyping: function() {
            if(this.typingCount <= 0) {
                this.botChannel.startTyping();
            }
            this.typingCount++;
        },
        
        stopTyping: function() {
            if(this.typingCount > 0) {
                this.typingCount--;
                if(this.typingCount == 0) {
                    this.botChannel.stopTyping();
                }
            }
        }
    }
}

TypingHandler.prototype = Object.create(TypingHandler.prototype);

module.exports = TypingHandler;