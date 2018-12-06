
var Util = {
    //see if message is already checked off by seeing if any reactions belong to the bot itself
    checkReact: function(reactions) {
        var already = false;
        for (var i = 0; i < reactions.length; i++) {
            var users = reactions[i].users.fetchUsers({limit:70})
            var users = reactions[i].users.array()
            for (var x = 0; x < users.length; x++) {
                if (users[x].bot == true) {
                    already = true;
                }
            }
        }
        return already
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