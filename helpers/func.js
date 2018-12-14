
var util = require('../util')
var Func = function(Discord) {
    var self = this
        
    self.propose = function(msg, ctx, config, cb) {
        var ch = util.getChannel(msg.guild.channels, config.channels.modvoting);
        if (ch == null) {
            cb("Use the command @Ohtred channel modvoting [name] to assign a designated voting channel", null)
        }
        else {
            console.log(msg.author.toString() + " proposed: " + msg.content)
            var prop_id = Math.random().toString(36).substring(4);
            const embed = new Discord.RichEmbed()
    
            embed.setTitle(".:: **PROPOSAL**")
            embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL)
            if (msg.attachments.size > 0) {
                console.log("Image attached")
                embed.setDescription(ctx + "\n" + msg.attachments.array()[0].url)
            }
            else {
                console.log("No image attached")
                embed.setDescription(ctx)
            }
            
            embed.setFooter(prop_id)
            embed.setTimestamp()
            ch.send({embed})
                .then(message => cb(null, msg.author.toString() + "\n *" + prop_id + `* at ${message.url}`)).catch( function(error) { console.error(error) } )
            ctx = ctx.replace("❗",":exclamation:")
            var alert_level = (ctx.match(/:exclamation:/g) || []).length
            if (alert_level >= 2) {
                ch.send("@everyone")
            }
            else if (alert_level == 1) {
                ch.send("@here")
            }
        }
    }
}

module.exports = Func