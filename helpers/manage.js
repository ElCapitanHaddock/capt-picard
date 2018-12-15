    
var ms = require('ms')

var Manage = function(db, client, Discord) {
    var self = this
    
    self.defaultError = " Incorrect syntax!\nTry *@Ohtred help*"
    
    self.mutes = []
    self.mute = function(msg, ctx, config, cb) {
        var user
        var users = msg.mentions.users.array()
        for (var i = 0; i < users.length; i++) {
            if (users[i].id !== client.user.id) user = users[i]
        }
        if (user) {
            var mem = msg.guild.members.find(m => m.id == user.id)
            if (mem) {
                for (var i = 0; i < self.mutes.length; i++) { //override/cancel previous mutes
                    if (self.mutes[i].member == mem) {
                        clearTimeout(self.mutes[i].timeout)
                        self.mutes.splice(i,1)
                    }
                }
                if (config.mutedRole) {
                    mem.addRole(config.mutedRole, "Muted by " + msg.author.toString())
                    var params = ctx.trim().split(" ")
                    if (params[1]) {
                        self.mutes.push( 
                            {
                                member: mem,
                                timeout: setTimeout(function() {
                                    mem.removeRole(config.mutedRole).then().catch(console.error);
                                }, ms(params[1]) )
                            }
                        )
                        cb(null, mem.toString() + " was muted for " + ms(ms(params[1]), { long: true }) )
                    } else cb(null, mem.toString() + " was muted.")
                }
                else {
                    cb(
                        "**The muted role could not be found. Follow this syntax:**"
                        +"```@Ohtred mutedrole role```"
                    )
                }
            }
        }
        else cb(msg.author.toString() + self.defaultError)
    }
    
    self.unmute = function(msg, ctx, config, cb) {
        var user
        var users = msg.mentions.users.array()
        for (var i = 0; i < users.length; i++) {
            if (users[i].id !== client.user.id) user = users[i]
        }
        if (config.mutedRole && user) {
            var mem = msg.guild.members.find(m => m.id == user.id)
            if (mem) {
                for (var i = 0; i < self.mutes.length; i++) { //override/cancel previous mutes
                    if (self.mutes[i].member == mem) {
                        clearTimeout(self.mutes[i].timeout)
                        self.mutes.splice(i,1)
                    }
                }
                if (mem.roles.find(function(role) { return role.id == config.mutedRole }) ) {
                    mem.removeRole(config.mutedRole).then().catch(console.error);
                    cb(null, mem.toString() + " was unmuted.")
                }
                else cb(" that user is already unmuted!")
            }
        }
        else if (!config.mutedRole) {
            cb(
                "**The muted role could not be found. Follow this syntax:**"
                +"```@Ohtred mutedrole role```" )
        }
        else cb(msg.author.toString() + self.defaultError)
    }
    
    self.ban = function(msg, ctx, config, cb) {
        if (ctx) {
            ctx = ctx.replace(/\D/g,'')
            msg.guild.ban( ctx, "Banned by " + msg.author.toString()).then(function(user) {
                    cb(null, user.toString() + " was banned.")
                })
                .catch(function(error) {
                    if (error) cb(msg.author.toString() + " couldn't ban that user! Check my permissions!")
                })
        }
        else cb(msg.author.toString() + " couldn't find that user!")
    }
    self.unban = function(msg, ctx, config, cb) {
        if (ctx) {
            ctx = ctx.replace(/\D/g,'')
            msg.guild.unban( ctx, "Unbanned by " + msg.author.toString()).then(function(user) {
                cb(null, user.toString() + " was unbanned.")
            })
            .catch(function(error) {
                if (error) cb(msg.author.toString() + " I couldn't unban that ID! Double-check your input and my permissions!")
            })
        }
        else cb(msg.author.toString() + " give some context!")
    }
    
    self.kick = function(msg, ctx, config, cb) {
        ctx = ctx.replace(/\D/g,'')
        var mem = msg.guild.members.find(m => m.id == ctx)
        if (mem) {
            mem.kick("Kicked by " + msg.author.toString()).then(function(mem) {
                cb(null, mem.toString() + " was kicked.")
            })
            .catch(function(error) {
                if (error) cb(msg.author.toString() + " I couldn't kick that ID! Double-check your input and my permissions!")
            })
        }
        else cb(msg.author.toString() + " can't find that user!")
    }
    
    self.role = function(msg, ctx, config, cb) {
        var params = ctx.split(" ")
        if (params.length >= 2) {
            var me = params[0].replace(/\D/g,'');
            var ro = params.slice(1).join(" ");
            
            var mem = msg.guild.members.find(m => m.id == me);
            var diff_role = msg.guild.roles.find( r => r.name.toLowerCase().startsWith(ro.toLowerCase()) || r.id == ro.replace(/\D/g,'') )
            if (mem && diff_role) {
                var check_role = mem.roles.find(r => r.id == diff_role.id) //check if user has it
                if (!check_role && !mem.permissions.has('ADMINISTRATOR')) {
                    mem.addRole(diff_role.id, "Roled by " + msg.author.toString()).then(function(mem) {
                        cb(null, mem.toString() + " was added to " + diff_role.toString())
                    })
                    .catch(function(error) {
                        if (error) cb(msg.author.toString() + " I couldn't role that user! Check my perms.")
                    })
                }
                
                else if (mem.permissions.has('ADMINISTRATOR')) cb(msg.author.toString() + " that user is an admin!")
                
                else { //has the role, remove it
                    mem.removeRole(diff_role.id, "Unroled by " + msg.author.toString()).then(function(mem) {
                        cb(null, mem.toString() + " was removed from " + check_role.toString())
                    })
                    .catch(function(error) {
                        if (error) cb(msg.author.toString() + " I couldn't unrole that user! Check my perms.")
                    })
                }
            }
            else if (!mem) cb(msg.author.toString() + " couldn't find that user!")
            else cb(msg.author.toString() + " couldn't find that role!")
        } else cb(msg.author.toString() + " give some context!")
    }
    self.warn = function(msg, ctx, config, cb) {
        var params = ctx.split(" ")
        if (params.length >= 2) {
            var member = params[0].replace(/\D/g,'');
            var message = params.slice(1).join(" ");
            var mem = msg.guild.members.find(m => m.id == member);
            if (mem) {
                mem.send("⚠️ " + message)
                msg.react("✅")
            }
            else cb(msg.author.toString() + " couldn't find that user!")
        } else cb(msg.author.toString() + " give some context!")
    }
    
    self.wash = function(msg, ctx, config, cb) {
        if (!isNaN(ctx) && ctx > 0 && ctx <= 100) {
            /*// Bulk delete messages
            const collector = new Discord.MessageCollector(msg.channel, m => m.author.id == msg.author.id, {time: 30000});
            msg.reply("30 second carwash activated.\nType WASH to scrub messages and STOP to stop the carwash.")
            collector.on('collect', message => {
                if (message.content.toUpperCase().trim() == "SCRUB") {
                    message.channel.bulkDelete(ctx+1)
                      .then(messages => console.log(`Bulk deleted ${messages.size} messages`))
                      .catch(console.error);
                }
                else if (message.content.toUpperCase().trim() == "STOP") {
                    collector.stop()
                }
            })*/
            msg.channel.bulkDelete(ctx+1)
              .then(messages => console.log(`Bulk deleted ${messages.size} messages`))
              .catch(console.error);
        }
        else cb("Please include a valid number 1-100!")
    }
}
module.exports = Manage