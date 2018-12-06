
var Util = {
    //to be deprecated, currently only used by feedback
    checkReact: function(reactions) {
        var already = false;
        for (var i = 0; i < reactions.length; i++) {
            var users = reactions[i].users.array()
            for (var x = 0; x < users.length; x++) {
                if (users[x].bot == true) {
                    already = true;
                }
            }
        }
        return already
    },
    
    checkConcluded: function(embed) {
        return embed.title.includes("𝐂𝐎𝐍𝐂𝐋𝐔𝐃𝐄𝐃") || embed.title.includes("PASSED") || embed.title.includes("FAILED")
    },
    
    getChannel: function(channels, query) { //get channel by name
        return channels.find(function(channel) {
          if (channel.name == query) {
            return channel
          } else return null
        });
    }
}

module.exports = Util