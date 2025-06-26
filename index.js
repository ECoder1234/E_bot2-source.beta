const { Client, Events, GatewayIntentBits, ActivityType, PermissionsBitField } = require("discord.js");
require("dotenv/config");
const OpenAI = require("openai");

// 1️⃣ Nicknames
const userNicknames = {
  "1270938893734248510": "Asees",
  "1307227891804667916": "Jiawei Clause",
  "1377733461506527262": "Savvas",
  "1336835338810953795": "Easton",
  "1349004501553778718": "Ryan",
  "1282182859880403005": "Izo",
  "1364343013450715166": "Mason",
  "1251674989065928775": "Triston",
  "1107621917827006508": "Ervin",
};

// 2️⃣ Personalities
const personalities = {
  "1270938893734248510": "Hes Likes Admin Abusing, And Swearing",
  "1307227891804667916": "Just A Chill Guy That Loves Fortnite",
  "1377733461506527262": "2 foot guy thats best friend is IZO",
  "1336835338810953795": "Speaks like a cowboy from the wild west.",
  "1349004501553778718": "Friendly nerd who loves math.",
  "1282182859880403005": "Has chaotic Gen Z energy and uses too many emojis.",
  "1364343013450715166": "Speaks in Shakespearean English.",
  "1251674989065928775": "Acts like a pirate. Arrr!",
  "1107621917827006508": "The bossy 9-year-old game dev with strong opinions and sass.",
};

// 3️⃣ OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

// 4️⃣ Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const activeServers = new Set();
const timeoutMap = new Map();

// 5️⃣ On Ready
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setStatus("invisible");
  client.user.setActivity("Offline. Mention to activate", { type: ActivityType.Watching });
});

// 6️⃣ Activation Helper
const activateBot = async (message) => {
  activeServers.add(message.guild.id);
  client.user.setStatus("idle");
  client.user.setActivity("Updating...", { type: ActivityType.Watching });
  await message.channel.send("🔄 Activating E_Bot2...");

  setTimeout(() => {
    client.user.setStatus("online");
    client.user.setActivity("Ready To Play", { type: ActivityType.Playing });
    message.channel.send("✅ E_Bot2 is online! What do you want?");
  }, 2000);

  scheduleDeactivation(message.guild.id);
};

function scheduleDeactivation(guildId) {
  if (timeoutMap.has(guildId)) clearTimeout(timeoutMap.get(guildId));
  const timeout = setTimeout(() => {
    activeServers.delete(guildId);
    timeoutMap.delete(guildId);
    if (activeServers.size === 0) {
      client.user.setStatus("invisible");
      client.user.setActivity("Offline. Mention to activate", { type: ActivityType.Watching });
    }
  }, 5 * 60 * 1000);
  timeoutMap.set(guildId, timeout);
}

// 7️⃣ Commands
const customCommands = {
  "!cmd-help": (message) => {
    message.channel.send(`📜 **E_Bot2 Commands**:
!cmd-help - Show this list
!bot-info - Info about E_Bot2
!say <msg> - Make me say anything
!joke - A funny dev joke
!echo <msg> - Repeat your message
!ping - Check latency
!avatar - Your profile pic
!userinfo - Info about you
!serverinfo - Info about this server
!copy <userID> <msg> - Copy a user’s style (customizable)
!flood <msg> - Repeat a message 100x
!clear <amount> - Delete messages (Mods)
!ban <@user> <reason> - Ban someone (Mods)
!kick <@user> <reason> - Kick someone (Mods)
!mute <@user> - Mute (placeholder)
!unmute <@user> - Unmute (placeholder)
!warn <@user> <reason> - Warn
!poll <question> - Start a poll
!coinflip - Flip a coin
!8ball <question> - Magic 8 ball
!quote - Motivation!
!slowmode <secs> - (Ervin only) Set slowmode
`);
  },

  "!bot-info": (m) => m.channel.send("🤖 I am **E_Bot2**, your Gen-Z Discord assistant bot!"),

  "!say": (m) => {
    const text = m.content.slice("!say".length).trim();
    if (!text) return m.channel.send("❌ Say something.");
    m.channel.send(text);
  },

  "!joke": (m) => {
    const jokes = [
      "Why do Python programmers wear glasses? Because they can't C.",
      "Debugging: Being the detective in a crime movie where you're also the murderer.",
      "There are 10 types of people: those who understand binary and those who don’t.",
    ];
    m.channel.send(jokes[Math.floor(Math.random() * jokes.length)]);
  },

  "!echo": (m) => {
    const msg = m.content.slice("!echo".length).trim();
    m.channel.send(msg || "🔊 Echo!");
  },

  "!ping": (m) => {
    const start = Date.now();
    m.channel.send("🏓").then(sent =>
      sent.edit(`🏓 Pong! ${Date.now() - start}ms`)
    );
  },

  "!avatar": (m) => {
    const user = m.mentions.users.first() || m.author;
    m.channel.send(`${user.username}'s avatar: ${user.displayAvatarURL()}`);
  },

  "!userinfo": (m) => {
    const u = m.author;
    m.channel.send(`🧍 Username: ${u.username}\n🆔 ID: ${u.id}\n📆 Created: ${u.createdAt}`);
  },

  "!serverinfo": (m) => {
    const g = m.guild;
    m.channel.send(`📊 **Server Info**\nName: ${g.name}\nMembers: ${g.memberCount}\nOwner: <@${g.ownerId}>`);
  },

  "!copy": (m) => {
    const [_, userId, ...rest] = m.content.split(" ");
    const msg = rest.join(" ");
    if (!userId || !msg) return m.channel.send("❌ Usage: `!copy <userID> <message>`");
    const style = personalities[userId] || "[Default tone]";
    m.channel.send(`🧠 Copying <@${userId}>\n\n${msg}\n📝 Style: _${style}_`);
  },

  "!flood": (m) => {
    const floodMsg = m.content.slice("!flood".length).trim();
    if (!floodMsg) return m.channel.send("❌ You need to give me a message.");
    for (let i = 0; i < 100; i++) m.channel.send(floodMsg);
  },

  "!slowmode": (m) => {
    if (m.author.id !== "1107621917827006508") return m.channel.send("🚫 Only Ervin can do that.");
    const seconds = parseInt(m.content.split(" ")[1]);
    if (isNaN(seconds)) return m.channel.send("⏱️ Enter a number.");
    m.channel.setRateLimitPerUser(seconds)
      .then(() => m.channel.send(`🐢 Slowmode set to ${seconds} second(s)!`))
      .catch(() => m.channel.send("⚠️ I couldn't set the slowmode."));
  },

  "!clear": async function (m) {
    if (
      m.author.id !== "1107621917827006508" &&
      !m.member.permissions.has(PermissionsBitField.Flags.ManageMessages)
    ) return m.channel.send("❌ Need permission.");
    const amt = parseInt(m.content.split(" ")[1]);
    if (isNaN(amt)) return m.channel.send("❌ Give a number.");
    await m.channel.bulkDelete(amt, true);
    m.channel.send(`🧹 Cleared ${amt} messages.`);
  },

  "!ban": async function (m) {
    if (
      m.author.id !== "1107621917827006508" &&
      !m.member.permissions.has(PermissionsBitField.Flags.BanMembers)
    ) return m.channel.send("🚫 No ban perms.");
    const user = m.mentions.users.first();
    const reason = m.content.split(" ").slice(2).join(" ") || "No reason";
    if (!user) return m.channel.send("❌ Tag someone to ban.");
    const member = m.guild.members.cache.get(user.id);
    if (member) {
      await member.ban({ reason });
      m.channel.send(`🔨 Banned ${user.tag}: ${reason}`);
    }
  },

  "!kick": async function (m) {
    if (
      m.author.id !== "1107621917827006508" &&
      !m.member.permissions.has(PermissionsBitField.Flags.KickMembers)
    ) return m.channel.send("🚫 No kick perms.");
    const user = m.mentions.users.first();
    const reason = m.content.split(" ").slice(2).join(" ") || "No reason";
    if (!user) return m.channel.send("❌ Tag someone to kick.");
    const member = m.guild.members.cache.get(user.id);
    if (member) {
      await member.kick(reason);
      m.channel.send(`👢 Kicked ${user.tag}: ${reason}`);
    }
  },

  "!warn": async function (m) {
    if (
      m.author.id !== "1107621917827006508" &&
      !m.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)
    ) return m.channel.send("🚫 You can’t warn.");
    const user = m.mentions.users.first();
    const reason = m.content.split(" ").slice(2).join(" ") || "No reason given.";
    if (!user) return m.channel.send("⚠️ Tag someone to warn.");

    try {
      await user.send(`⚠️ You’ve been warned in **${m.guild.name}** for: *${reason}*`);
      m.channel.send(`⚠️ <@${user.id}> has been warned: ${reason}`);
    } catch {
      m.channel.send("❌ Couldn't DM the user, but they’ve been warned here.");
    }
  },

  "!poll": async function (m) {
    const q = m.content.slice("!poll".length).trim();
    if (!q) return m.channel.send("❓ What's the poll?");
    const p = await m.channel.send(`📊 **Poll:** ${q}`);
    await p.react("👍");
    await p.react("👎");
  },

  "!coinflip": (m) => {
    const r = Math.random() > 0.5 ? "Heads" : "Tails";
    m.channel.send(`🪙 It landed on **${r}**!`);
  },

  "!8ball": (m) => {
    const responses = ["Yes.", "No.", "Maybe.", "Absolutely.", "Nah.", "Try again later."];
    const a = responses[Math.floor(Math.random() * responses.length)];
    m.channel.send(`🎱 ${a}`);
  },

  "!quote": (m) => {
    const q = [
      "“Code never lies, comments sometimes do.” – Ron Jeffries",
      "“Simplicity is the soul of efficiency.” – Austin Freeman",
      "“Make it work, make it right, make it fast.” – Kent Beck",
    ];
    m.channel.send(`💡 ${q[Math.floor(Math.random() * q.length)]}`);
  },
};


// 8️⃣ Message Handler
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || !message.guild) return;

  const content = message.content.trim();
  const commandName = content.split(" ")[0];

  if (customCommands[commandName]) {
    try {
      await customCommands[commandName](message);
    } catch (err) {
      console.log("Command error:", err);
      message.channel.send("❌ Command failed.");
    }
    return;
  }

  const lower = content.toLowerCase();

  if (message.mentions.has(client.user)) {
    if (!activeServers.has(message.guild.id)) {
      await activateBot(message);
    } else {
      await message.channel.send("😎 I'm already active. Ask me anything!");
      scheduleDeactivation(message.guild.id);
    }
    return;
  }

  if (["bye", "goodbye", "see ya", "later"].some(w => lower.includes(w))) {
    if (activeServers.has(message.guild.id)) {
      activeServers.delete(message.guild.id);
      clearTimeout(timeoutMap.get(message.guild.id));
      timeoutMap.delete(message.guild.id);
      await message.channel.send("👋 Aight, peace out. Shutting down.");
      if (activeServers.size === 0) {
        client.user.setStatus("invisible");
        client.user.setActivity("Offline. Mention to activate", { type: ActivityType.Watching });
      }
    }
    return;
  }

  if (!activeServers.has(message.guild.id)) return;

  try {
    await message.channel.sendTyping();
    const fetched = await message.channel.messages.fetch({ limit: 3, before: message.id });
    const messages = [message, ...Array.from(fetched.values())];

    const getName = (m) => userNicknames[m.author.id] || m.member?.displayName || m.author.username;

    const chatMessages = [
      {
        role: "system",
         content: "You Are A Mean And Sassy 9 Yrs Old",
      },
    ];

    messages.reverse().forEach((m) => {
      chatMessages.push({
        role: m.author.id === client.user.id ? "assistant" : "user",
        content:
          m.author.id === client.user.id
            ? m.content
            : `${getName(m)}: ${m.content}`,
      });
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatMessages,
      max_tokens: 500,
    });

    await message.channel.send(response.choices[0].message.content);
    scheduleDeactivation(message.guild.id);
  } catch (err) {
    console.log("💥 OpenAI Error:", err);
    client.user.setStatus("dnd");
    client.user.setActivity("Error occurred", { type: ActivityType.Watching });
    await message.channel.send("⚠️ Uhhh something went wrong... try again later.");
  }
});

// 9️⃣ Login
client.login(process.env.BOT_TOKEN);
