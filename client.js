
/* jshint undef: true, unused: true, asi : true, esversion: 6 */
/*
   dBBBBBb  dBP dBBBP dBBBBBb   dBBBBBb    dBBBBb
       dB'                 BB       dBP       dB'
   dBBBP' dBP dBP      dBP BB   dBBBBK'  dBP dB' 
  dBP    dBP dBP      dBP  BB  dBP  BB  dBP dB'  
 dBP    dBP dBBBBP   dBBBBBBB dBP  dB' dBBBBB'   2018 - Jeremy Yang
*/

/*---------------------------------------------------------------------------------
Picard is a Discord bot that promotes democracy in a server...
---------------------------------------------------------------------------------*/
/*

Picard is hosted on Heroku as my alter-ego, Ohtred
If you wish to host your own version of Picard, here is a good tutorial: https://shiffman.net/a2z/bot-heroku/

Invite:
https://discordapp.com/oauth2/authorize?client_id=511672691028131872&permissions=8&scope=bot


*/

process.env.NODE_ENV = 'production'


//____________FIREBASE
var admin = require("firebase-admin")

var serviceAccount = require("./firebase_key.json")

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

var firestore = admin.firestore();

const settings = {timestampsInSnapshots: true};
firestore.settings(settings);

var databaseAPI = require("./dbAPI.js")
var API = new databaseAPI(firestore)
//--------------------------------------------


//DISCORDJS API
const Discord = require('discord.js')
const client = new Discord.Client({
  autofetch: ['MESSAGE_REACTION_ADD'], //not implemented in discord API yet
  disabledEvents: ['TYPING_START', 'USER_UPDATE', 'USER_NOTE_UPDATE', 'VOICE_SERVER_UPDATE'],
});
    
//PERSPECTIVE API
const Perspective = require('perspective-api-client')
const perspective = new Perspective({apiKey: process.env.PERSPECTIVE_API_KEY})
//--------------------------------------------

/*
bruhmoment : 483122820843307008
okbr : 398241776327983104
*/
//These are the servers where I let myself talk through Ohtred
var Intercom = require('./intercom.js')
var intercom = new Intercom(client, Discord)
//--------------------------------------------

var util = require('./util')
var schema = require('./config_schema')

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`)
    var guilds = client.guilds.array()
    for (var i = 0; i < guilds.length; i++) {
        API.get(guilds[i].id, function(err, config) {
            if (err) {
                if (err == 404 && guilds[i]) {
                    var proto_newG = new schema(guilds[i])
                    var newG = Object.assign({}, proto_newG)
                    API.set(newG.id, newG, function(err, res) {
                        if (err) console.error(err)
                        else console.log("New guild added: " + guilds[i].name)
                    })
                }
                else console.error(err)
            }
            else if (config) {
                var guild = client.guilds.find(function(g) { return g.id == config.id })
                if (guild) {
                    if (config.name !== guild.name) {
                        API.update(guild.id,{name:guild.name},function(err, res) {
                            if (err) console.error(err)
                        })
                    }
                    //fetch history
                    var mv = util.getChannel(guild.channels, config.channels.modvoting)
                    var fb = util.getChannel(guild.channels, config.channels.feedback) //config.fetch
                    if (mv) mv.fetchMessages({limit: 100}).catch( function(error) { console.error(error.message) } )
                    if (fb) fb.fetchMessages({limit: 100}).catch( function(error) { console.error(error.message) } )
                }
            }
        })
    }
    client.user.setActivity('@ me with help')
    /*
    setInterval(() => {
        console.log("Posting stats: " + client.guilds.size)
        if (client.shards && client.shards.id) dbl.postStats(client.guilds.size, client.shards.id, client.shards.total); //cycle
    }, 1800000); //every 30 minutes
    */
})

const DBL = require("dblapi.js");
const dbl = new DBL(process.env.DBL_KEY, client);

var Helper = require('./helper.js')
var helper = new Helper(API, Discord, client, perspective, dbl);

var Handler = require('./handler.js')
var handler = new Handler(API, Discord, client, intercom,helper,perspective)

client.on('message', handler.message);
client.on('messageReactionAdd', handler.reactionAdd)
client.on('messageReactionRemove', handler.reactionRemove)
client.on('guildCreate', handler.guildCreate)
client.on('guildRemove', handler.guildRemove)
client.on('presenceUpdate', handler.presenceUpdate)
client.on('guildMemberAdd', handler.guildMemberAdd)
client.on('error', console.error);

client.login(process.env.BOT_TOKEN)

// Optional events

dbl.on('posted', () => {
  console.log('Server count posted!');
})

dbl.on('error', e => {
 console.log(`Oops! ${e}`);
})