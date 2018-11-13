const Discord = require('discord.js');
const client = new Discord.Client();
 
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

/*TODO
    Restrict to mod/admin interaction
    Check for reactions, post passed proposals on announcements
    Delete all reactions that are not updoge/downdoge
*/
client.on('message', msg => {
  if (msg.content.includes(client.user.toString())) {
    var inp = msg.content.trim();
    var cmd = inp.substr(client.user.toString().length(),inp.indexOf(' '))
    var ctx = inp.substr(inp.indexOf(' '))
    if (cmd == null || cmd.trim().length == 0) {
        msg.channel.send("lol ping Uhtred for help noob");
    }
    else if (helper.func[cmd] == null)
        msg.channel.send(msg.author.toString() + ", the command '" + cmd + "' does not exist.")
    else if (ctx == null)
        msg.channel.send(msg.author.toString() + ", please provide command context.")
    else {
        helper.func[cmd](msg, ctx, function(error, res) {
            if (error) msg.channel.send(error)
            else {
                msg.channel.send(res)
            }
        })
        //msg.channel.send(msg.author.toString());
    }
  }
});

var bot_secret_token = "NTExNjcyNjkxMDI4MTMxODcy.DsuUfQ.knMgnXhf2FOTWau5wi6yB9n0tVo"
client.login(bot_secret_token)


var Helper = function() {
    var self = this;
    
    self.func = {};
    self.func.propose = function(msg, ctx, cb) {
        //console.log(msg.guild);
        var ch = msg.guild.channels.find(function(channel) {
          if (channel.name == "epic-mod-voting") {
            return channel
          } else return null
        });
        //var ch = msg.guild.channels.find(channel => channel.name === "epic-mod-voting");

        if (ch == null) {
            cb("Please add a channel called #epic-mod-voting in order to create a proposal. It is recommended that you restrict #epic-mod-voting so only the bot can post.", null)
        }
        else {
            var prop_id = Math.random().toString(36).substring(5);
            ch.send(
                "Proposal ID: " + prop_id + "\n" + 
                "Author: " + msg.author.toString() + "\n" +
                "Info: " + ctx 
                );
            cb(null, "Proposal succesfully sent.")
        }
    }
}

var helper = new Helper();