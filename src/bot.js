const { Client, Intents, Message } = require('discord.js');
const bondScraper = require('./bondScraper');


const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });


const PREFIX = "/"

client.on('read', () => {
    console.log(`${client.user.tag} has logged in`);
});

client.on('messageCreate', (message) => {
    if(message.author.bot) return;
    const channel = client.channels.cache.find(c => c.id === message.channelId);
    console.log(`[${message.author.tag}]: ${message.content}`)
    if(message.content.startsWith(PREFIX)) {
        const [CMD_NAME, ...args] = message.content
        .trim()
        .substring(PREFIX.length)
        .split(/\s+/);
        if(CMD_NAME === 'bonds') {
            if(args.length == 1 && (args[0] == 'wonderland' || args[0] == 'euphoria')) {
                (async function() {
                    let hashBond = await bondScraper.scraper(args[0]);
                    console.log(hashBond);
                    if(Object.keys(hashBond).length != 0) {
                        message = `\`\`\`\**${args[0]} bonds**\n`;
                        for(var i in hashBond) {
                            message += `${i}:\nDiscount Price: ${hashBond[i][0]}\nBond ROI %: ${hashBond[i][1]}\nTotal Purchased: ${hashBond[i][2]}\n\n\n`;
                        }
                        message += `\`\`\``;
                        channel.send(message);
                    }
                    
                })();
                
            }
            else {
                message = `\`\`\`\Invalid arguments, try again with 1 argument, wonderland or euphoria\`\`\``;
                channel.send(message);
            }
        }
    }
});

client.login(process.env.DISCORD_JS_BOT_TOKEN)



module.exports = client;