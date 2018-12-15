
/* jshint undef: true, unused: true, asi : true, esversion: 6 */

var util = require('./util')
var schema = require('./config_schema')
var roast = require('shakespeare-insult')


var Handler = function(Discord,db,intercom,client,helper,perspective) {
    var self = this
    
    self.message = function(msg) {
        if (msg.guild && msg.guild.name != "MKV Syndicate" && db[msg.guild.id] && msg.author.id !== 301164188070576128) {
            if (!db[msg.guild.id].blacklist.includes(msg.channel.id)) {
                self.decodeMessage(msg)
            }
        }
    }
    
    self.decodeMessage = function(msg) {
        var config = db[msg.guild.id]
        if (!msg.author.bot || msg.author.id == client.user.id) intercom.update(msg)
        //console.log(msg.author.username + " [" + msg.guild.name + "]" + "[" + msg.channel.name + "]: " + msg.content)
        
        var gottem = ( msg.isMentioned(client.user) || (config.prefix && msg.content.startsWith(config.prefix)) )

        if ( gottem && !msg.author.bot ) { //use msg.member.roles
            
            var perm = false
            for (var i = 0; i < config.permissible.length; i++) {
                if (msg.member.roles.find(function(role) { return role.id == config.permissible[i] }) ) perm = true
            }
            
            var ments = ["<@511672691028131872>", "<@!511672691028131872>"]
            
            var inp = msg.content.trim();
            
            if (!msg.isMentioned(client.user) && config.prefix) inp = inp.replace(config.prefix, "").trim()
            
            if (inp.startsWith(ments[0])) inp = inp.replace(ments[0], "").trim()
            
            if (inp.startsWith(ments[1])) inp = inp.replace(ments[1], "").trim()
            
            /*var cmd = (inp.indexOf(' ') !== 0) ? inp.slice(0, inp.indexOf(' ')).trim() : inp.slice(inp.length).trim()
            var ctx = (inp.indexOf(' ') !== 0) ? inp.slice(inp.indexOf(' ')).trim() : ""*/
            var spl = inp.split(" ")
            var params = [spl[0], spl.slice(1).join(' ')]
            console.log("["+msg.guild.name+"] " + params[0] + " " + params[1])
            var cmd = params[0].toString()
            var ctx = params[1].toString()
            self.parseMessage(msg, cmd, ctx, perm, config)
        }
        //TESTING PURPOSES
        else if (msg.content.startsWith("!") && msg.author.id == client.user.id && !msg.isMentioned(client.user)) { //self-sent commands, for testing
            let inp = msg.content.slice(1)
            let cmd = inp.substr(0,inp.indexOf(' '))
            let ctx = inp.substr(inp.indexOf(' '), inp.length).trim()
            
            if (helper.cosmetic[cmd.toLowerCase()]) {
                helper.cosmetic[cmd.toLowerCase()](msg, ctx, config, function(error, res) {
                    if (error) msg.channel.send(error).catch( function(error) { console.error(error.message) } )
                    else {
                        msg.channel.send(res).catch( function(error) { console.error(error.message) } )
                    }
                })
            }
            else self.parseMessage(msg, cmd, ctx, true, config)
        }
        else if (!msg.author.bot && config.embassy && config.embassy[msg.channel.id]) {
            var other = db[msg.channel.topic]
            if (other && other.embassy) {
                var otherG = client.guilds.find(function(g) { return g.id == other.id })
                if (otherG) {
                    var ch = util.getChannelByTopic(otherG.channels, config.id);
                    //ch = util.getChannel(otherG.channels, other.embassy.channel)
                    if (ch && other.embassy[ch.id]) { //check if channel exists and if it is mutually set
                        var cont = msg.cleanContent
                        if (msg.attachments.size > 0) { //append attachments to message
                            var arr = msg.attachments.array()
                            for (var i = 0; i < arr.length; i++) {
                                cont += " " + arr[i].url
                            }
                        }
                        if (cont && cont.trim()) {
                            new Discord.WebhookClient(other.embassy[ch.id].id, other.embassy[ch.id].token)
                            .edit(msg.author.username, msg.author.avatarURL)
                            .then(function(wh) {
                                wh.send(cont).catch(console.error);
                            }).catch(console.error)
                        }
                    }
                    else msg.reply("Couldn't connect to that server! Make sure it is mutual, and check my webhook perms")
                }
            }
        }
        /*else if (msg.author.id == 301164188070576128 && (msg.content.toLowerCase().includes("joy") || msg.content.includes("😂")) ) {
            msg.reply("😂") //joy
        }*/
        else if (msg.channel.topic && !msg.author.bot) {
            helper.monitor(msg, config)
        }
    }
    
    self.parseMessage = function(msg, cmd, ctx, perm, config) {
        if (msg.attachments.size > 0) { //append attachments to message
            ctx += " " + msg.attachments.array()[0].url
        }
        if (cmd && cmd.trim()) {
            
            if (helper.cosmetic[cmd.toLowerCase()]) { //ANYONE CAN USE
                helper.cosmetic[cmd.toLowerCase()](msg, ctx, config, function(error, res) {
                    if (error) msg.channel.send(error).catch( function(error) { console.error(error.message) } )
                    else {
                        msg.channel.send(res).catch( function(error) { console.error(error.message) } )
                    }
                })
            }
            
            else if (helper.func[cmd.toLowerCase()] != null) { //CERTAIN PERMITTED ROLES
                if (!ctx || !ctx.trim()) msg.channel.send("<:red_x:520403429835800576> " + msg.author.toString() + " give context!").catch( function(error) { console.error(error.message) } )
                else if (perm || msg.member.permissions.has('ADMINISTRATOR')) {
                    helper.func[cmd.toLowerCase()](msg, ctx, config, function(error, res) {
                        if (error) msg.channel.send(error).catch( function(error) { console.error(error.message) } )
                        else {
                            msg.channel.send(res).catch( function(error) { console.error(error.message) } )
                        }
                    })
                } else  msg.channel.send("<:red_x:520403429835800576> " +  msg.author.toString() + " you aren't permitted to do that, ya " + roast.random()).catch( function(error) { console.error(error.message) } )
            }
            
            else if (helper.manage[cmd.toLowerCase()] != null) { //MODERATORS
                //execute settings command
                if (!ctx || !ctx.trim()) msg.channel.send("<:red_x:520403429835800576> " + msg.author.toString() + " give context!").catch( function(error) { console.error(error.message) } )
                else if (msg.member.permissions.has('MANAGE_ROLES')  || msg.member.permissions.has('ADMINISTRATOR')) {
                    helper.manage[cmd.toLowerCase()](msg, ctx, config, function(error, res) {
                        if (error) msg.channel.send("<:red_x:520403429835800576> " +error).catch( function(error) { console.error(error.message) } )
                        else {
                            msg.channel.send("<:green_check:520403429479153674> "+res).catch( function(error) { console.error(error.message) } )
                        }
                    })
                } else msg.channel.send("<:red_x:520403429835800576> " +  msg.author.toString() + " you need to be a role manager to do that.").catch( function(error) { console.error(error.message) } )
            }
            
            else if (helper.set[cmd.toLowerCase()] != null) {
                //execute settings command
                if (!ctx || !ctx.trim()) msg.channel.send("<:red_x:520403429835800576> " + msg.author.toString() + " give context!").catch( function(error) { console.error(error.message) } )
                else if (msg.member.permissions.has('ADMINISTRATOR')) { //ADMIN ONLY
                    helper.set[cmd.toLowerCase()](msg, ctx, config, function(error, res) {
                        if (error) msg.channel.send("<:red_x:520403429835800576> " +error).catch( function(error) { console.error(error.message) } )
                        else {
                            msg.channel.send("<:green_check:520403429479153674> "+res).catch( function(error) { console.error(error.message) } )
                        }
                    })
                } else msg.channel.send("<:red_x:520403429835800576> " +  msg.author.toString() + " ask an admin to do that.").catch( function(error) { console.error(error.message) } )
            }
            else if (cmd && ctx) {
                if (msg.guild.id != 264445053596991498) {
                    console.log(msg.guild.id)
                    msg.react("❔");
                    //msg.channel.send("<:red_x:520403429835800576> " + msg.author.toString() + " that command doesn't exist").catch( function(error) { console.error(error.message) } )
                }
            }
            else if (msg.content.toLowerCase().includes("help")) {
                helper.help(msg)
            }
            else if (!ctx) {
                if (msg.guild.id != 264445053596991498) {
                    console.log(msg.guild.id)
                    msg.react("❔");
                    //msg.channel.send("<:red_x:520403429835800576> " + msg.author.toString() + " that command doesn't exist").catch( function(error) { console.error(error.message) } )
                }
            }
        }
        else if (msg.content.toLowerCase().includes("help")) {
            helper.help(msg)
        }
    }
    
    self.reactionRemove = function(reaction, user) {
        var config = db[reaction.message.guild.id]
        if (!reaction.message.deleted && !reaction.message.bot && config && reaction.message.embeds && reaction.message.embeds[0]) {
            
            var already = util.checkConcluded(reaction.message.embeds[0])
            //util.checkReact(reaction.message.reactions.array()) //see if bot already checked this off (e.g. already reported, passed, rejected etc)
            
            //MOD-VOTING CHANNEL
            if (reaction.message.channel.id == config.channels.modvoting && reaction.message.embeds.length >= 1 && !already) {
                
                var activity_log = util.getChannel(reaction.message.guild.channels,config.channels.modactivity)
                //upvote
                if ( (reaction._emoji.name == config.upvote || reaction._emoji.toString() == config.upvote) && activity_log ) {
                    activity_log.send(user.toString() + " just withdrew endorsement for *" + reaction.message.embeds[0].footer.text + "*").catch( function(error) { console.error(error.message) } )
                }
                
                //downvote
                else if ( (reaction._emoji.name == config.downvote || reaction._emoji.toString() == config.upvote) && activity_log ) {
                    activity_log.send(user.toString() + " just withdrew opposition for *" + reaction.message.embeds[0].footer.text + "*").catch( function(error) { console.error(error.message) } )
                }
            }
        }
    }
    
    self.reactionAdd = function(reaction, user) {
        var config = db[reaction.message.guild.id]
        if (!reaction.message.deleted && !reaction.message.bot && config) {
            self.parseReaction(reaction, user, config)
        }
    }
    
    self.parseReaction = function(reaction, user, config) { //just for added reactions
        if (!reaction.message.deleted && !reaction.message.bot && reaction.message.embeds && reaction.message.embeds[0]) {
            var already = util.checkConcluded(reaction.message.embeds[0])//util.checkReact(reaction.message.reactions.array()) //see if bot already checked this off (e.g. already reported, passed, rejected etc)
            
            //MOD-VOTING CHANNEL
            if (!already && reaction.message.channel.id == config.channels.modvoting && reaction.message.embeds.length >= 1) {
                
                //activity log channel
                var activity_log = util.getChannel(reaction.message.guild.channels,config.channels.modactivity)
                
                //get the proper threshold
                var upvote = config.thresh.mod_upvote;
                var downvote = config.thresh.mod_downvote;
                if (reaction.message.embeds[0].title.includes("MOTION")) {
                    var thresh = Number(reaction.message.embeds[0].title.replace(/\*/g, "").split(" | ")[1])
                    upvote = Number(thresh);
                    downvote = Number(thresh);
                }
                
                //upvote
                if (reaction._emoji.name == config.upvote || reaction._emoji.toString() == config.upvote) {
                    if (reaction.count >= upvote) {
                        helper.react.upvote(reaction, user, config);
                    }
                    if (activity_log) {
                        activity_log.send(user.toString() + " just endorsed *" + reaction.message.embeds[0].footer.text + "*").catch( function(error) { console.error(error.message) } )
                    }
                }
                
                //downvote
                else if (reaction._emoji.name == config.downvote || reaction._emoji.toString() == config.downvote) {
                    if (reaction.count >= downvote) {
                        helper.react.downvote(reaction, user, config);
                    }
                    if (activity_log) {
                        activity_log.send(user.toString() + " just opposed *" + reaction.message.embeds[0].footer.text + "*").catch( function(error) { console.error(error.message) } )
                    }
                }
            }   
        }
        //FEEDBACK CHANNEL
        else if ((reaction._emoji.name == config.upvote || reaction._emoji.toString() == config.upvote) && reaction.message.channel.id == config.channels.feedback && !util.checkReact(reaction.message.reactions.array())) {
            if (reaction.count >= config.thresh.petition_upvote) self.react.plebvote(reaction, user, config)
        }
        //REPORTABLE CHANNELS
        else if (config.reportable.indexOf(reaction.message.channel.id) != -1) { 
            if (!config.report_time) config.report_time = 60
            if ((reaction._emoji.name == config.report || reaction._emoji.toString() == config.report) && reaction.count == config.thresh.report_vote) {
                self.react.report(reaction, user, config)
            }
        }
    }
    
    self.guildCreate = function(guild) { //invited to new guild
        console.log("Added to new server: "+guild.name)
        var config = db[guild.id]
        if (!config) {
            db[guild.id] = new schema(guild)
        }
    }
    
    self.guildRemove = function(guild) { //removed from a guild
        console.log("Removed from a server: "+guild.name)
        db[guild.id] = null
    }
    
    self.presenceUpdate = function(oldMember, newMember) {
        var config = db[oldMember.guild.id]
        if (config && config.counter) {
            var channel = newMember.guild.channels.array().find(function(ch) {
                return ch.name.startsWith("🔺") || ch.name.startsWith("🔻") 
            })
            if (channel) {
                var old = parseInt(channel.name.replace(/\D/g,''))
                var len = newMember.guild.members.filter(m => m.presence.status === 'online' && !m.user.bot).size
                var diff = Math.abs(old - len)
                var emo = (old < len) ? "🔺  " : "🔻  "
                if (diff >= config.counter)  channel.setName(emo + len + " online")
                
                else if (!(/\d/.test(channel.name))) channel.setName("🔺  " + len + " online") //if no numbers found
            }
        }
        //ch.setTopic(len + " users online")
    }
    
    self.guildMemberAdd = function(member) {
        var config = db[member.guild.id]
        if (config) {
            if (config.lockdown && config.lockdown > 0) {
                console.log("Lockdown auto-action: " + config.lockdown)
                switch(config.lockdown) {
                    case 1:
                        member.kick("Autokicked by lockdown mode").catch(console.error)
                        break;
                    case 2:
                        member.ban("Autobanned by lockdown mode").catch(console.error)
                        break;
                }
            }
            else if (config.autorole) member.setRoles([config.autorole]).catch(console.error);
        }
    }
}

module.exports = Handler