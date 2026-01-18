/******************************************************************
 * Veyra Sentinel — FINAL STABLE BUILD
 * Wave 3 (Timers) + Olympus + WEBSITE Cloudflare Protection
 ******************************************************************/
require("dotenv").config();
const https = require("https");
const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
/* ================= ENV ================= */
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
if (!TOKEN || !CLIENT_ID) {
  console.error("❌ Missing environment variables");
  process.exit(1);
}
/* ================= SITES ================= */
const GAME_SITES = {
  olympus: "https://demonicscans.org/active_wave.php?gate=5&wave=9",
  grakthar: "https://demonicscans.org/active_wave.php?gate=3&wave=8"
};
/* ================= ROLES ================= */
const ADMIN_ROLES = ["Council Elders","Commanders","Dukes","Overseers","Emperor"];
const CONTROL_ROLES = ["Emperor","Overseers","Dukes","Commanders"];
const DEBUG_ROLES = ["Overseers","Emperor"];
/* ================= COLORS ================= */
const COLORS = {
  WAVE3: 0x1e40af,
  OLYMPUS: 0x3b82f6,
  ALERT: 0xef4444,
  INFO: 0x22c55e,
  CONTROL: 0xf59e0b,
  CLOUD: 0x7c3aed
};
/* ================= IMAGES ================= */
const GENERALS = [
  { name: "General Skarn — The Molten General", img: "https://demonicscans.org/images/monsters/Skarn-The-Molten-General.webp" },
  { name: "General Vessir — The Solar Inferna Empress", img: "https://demonicscans.org/images/monsters/Vessir-The-Solar-Inferna-Empress.webp" },
  { name: "General Hrazz — The Dawnflame Seraph", img: "https://demonicscans.org/images/monsters/General-Hrazz-The-Dawnflame-Seraph.webp" }
];
const LIZARD_KING = {
  name: "Drakzareth — The Tyrant Lizard King",
  img: "https://demonicscans.org/images/monsters/monster_6911fb48cc65d0.94230012.webp"
};
const OCEANUS_IMG = "https://demonicscans.org/images/monsters/oceanus.webp";
const POSEIDON_IMG = "https://demonicscans.org/images/monsters/poseidon.webp";
const OLYMPUS_GATE = "https://demonicscans.org/images/gates/gate_688a438aea7f24.99262397.webp";
const W3_GATE = "https://demonicscans.org/images/gates/gate_688e438aba7f24.99262397.webp";
/* ================= DEFAULT TIMERS ================= */
const OLYMPUS_DEFAULTS = {
  oceanus:{spawn:12*3600000,alive:5*3600000},
  poseidon:{spawn:48*3600000,alive:24*3600000}
};
const W3_DEFAULTS = {
  generals:{spawn:6*3600000,alive:2*3600000},
  lizard:{spawn:8*3600000,alive:2*3600000}
};
/* ================= STATE ================= */
const state = {
  settings:{ channelId:null, graktharRoleId:null, olympusRoleId:null },
  gameCloud:{ olympus:"STABLE", grakthar:"STABLE" },
  wave3:{
    generals:{status:"waiting",remaining:W3_DEFAULTS.generals.spawn},
    lizard:{status:"waiting",remaining:W3_DEFAULTS.lizard.spawn},
    lastTick:Date.now()
  },
  olympus:{
    oceanus:{status:"waiting",remaining:OLYMPUS_DEFAULTS.oceanus.spawn},
    poseidon:{status:"waiting",remaining:OLYMPUS_DEFAULTS.poseidon.spawn},
    lastTick:Date.now()
  },
  debugLog:[]
};
/* ================= HELPERS ================= */
const hasRole=(m,r)=>m?.roles?.cache?.some(x=>r.includes(x.name));
function getIST(){
  return new Date().toLocaleString("en-IN",{timeZone:"Asia/Kolkata"});
}
function logDebug(msg){
  state.debugLog.unshift(`[${getIST()}] ${msg}`);
  if(state.debugLog.length>50) state.debugLog.pop();
}
const formatTime=(ms)=>{
  const s=Math.max(0,Math.floor(ms/1000));
  const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;
  return `${h}h ${m}m ${sec}s`;
};
/* ================= CLIENT ================= */
const client = new Client({intents:[GatewayIntentBits.Guilds]});
/* ================= CHANNEL ================= */
async function getAlertChannel(){
  if(!state.settings.channelId) return null;
  return client.channels.fetch(state.settings.channelId).catch(()=>null);
}
/* ================= ROLE MENTION ================= */
function getMentionPayload(system){
  let roleId=null;
  if(system==="grakthar") roleId=state.settings.graktharRoleId;
  if(system==="olympus") roleId=state.settings.olympusRoleId;
  if(roleId){
    return {content:`<@&${roleId}>`,allowedMentions:{roles:[roleId]}};
  }
  return {content:"@everyone",allowedMentions:{parse:["everyone"]}};
}
/* ================= WEBSITE CLOUD CHECK ================= */
function checkWebsite(url){
  return new Promise(res=>{
    const req=https.get(url,r=>{
      const c=r.statusCode;
      if(c===403||c===429||c===503) res(false);
      else if(c>=200&&c<300) res(true);
      else res(false);
    });
    req.on("error",()=>res(false));
    req.setTimeout(10000,()=>{req.destroy();res(false);});
  });
}
/* ================= CLOUD CARD ================= */
async function sendCloudCard(title,msg){
  const ch=await getAlertChannel(); if(!ch) return;
  const e=new EmbedBuilder().setColor(COLORS.CLOUD).setTitle(title).setDescription(msg).setTimestamp();
  await ch.send({embeds:[e]});
}
/* ================= GAME CLOUD MONITOR ================= */
setInterval(async()=>{
  const o=await checkWebsite(GAME_SITES.olympus);
  if(!o && state.gameCloud.olympus==="STABLE"){
    state.gameCloud.olympus="UNSTABLE";
    await sendCloudCard("☁️ Olympus Shielded","Cloudflare protection detected.\nLive data paused.");
    logDebug("Game Cloud ON — Olympus");
  }
  if(o && state.gameCloud.olympus==="UNSTABLE"){
    state.gameCloud.olympus="STABLE";
    await sendCloudCard("☀️ Olympus Restored","Cloud protection lifted.\nSystems online.");
    logDebug("Game Cloud OFF — Olympus");
  }
  const g=await checkWebsite(GAME_SITES.grakthar);
  if(!g && state.gameCloud.grakthar==="STABLE"){
    state.gameCloud.grakthar="UNSTABLE";
    await sendCloudCard("☁️ Grakthar Shielded","Cloudflare protection detected.\nBattle systems paused.");
    logDebug("Game Cloud ON — Grakthar");
  }
  if(g && state.gameCloud.grakthar==="UNSTABLE"){
    state.gameCloud.grakthar="STABLE";
    await sendCloudCard("☀️ Grakthar Restored","Cloud protection lifted.\nBattle systems restored.");
    logDebug("Game Cloud OFF — Grakthar");
  }
},60000);
/* ================= ALERTS ================= */
async function sendOlympusAlert(boss,type){
  const ch=await getAlertChannel(); if(!ch) return;
  const img=boss==="oceanus"?OCEANUS_IMG:POSEIDON_IMG;
  const name=boss==="oceanus"?"Oceanus — The Water Titan":"Poseidon — The Sea Emperor";
  const title=type==="spawn"?"🏛 Olympus Boss Spawned":"⚔️ Olympus Boss Defeated";
  const desc=type==="spawn"?`✨ **${name}** has emerged!`:`🛡 **${name}** has fallen.`;
  const mention=getMentionPayload("olympus");
  const e=new EmbedBuilder()
    .setColor(COLORS.OLYMPUS)
    .setTitle(title)
    .setDescription(desc)
    .setThumbnail(img)
    .setImage(OLYMPUS_GATE)
    .setTimestamp();
  await ch.send({...mention,embeds:[e]});
}
async function sendW3GeneralsAlert(type){
  const ch=await getAlertChannel(); if(!ch) return;
  const mention=getMentionPayload("grakthar");
  const title=type==="spawn"?"⭐ GENERALS SPAWNED":"⚔️ GENERALS DEFEATED";
  const embeds=GENERALS.map(g=>
    new EmbedBuilder()
      .setColor(COLORS.ALERT)
      .setTitle(title)
      .setDescription(`**${g.name}**`)
      .setThumbnail(g.img)
      .setTimestamp()
  );
  await ch.send({...mention,embeds});
}
async function sendW3LizardAlert(type){
  const ch=await getAlertChannel(); if(!ch) return;
  const mention=getMentionPayload("grakthar");
  const title=type==="spawn"?"🐲 FINAL BOSS ARRIVED":"⚔️ FINAL BOSS DEFEATED";
  const desc=type==="spawn"
    ?`👑 **${LIZARD_KING.name}** has entered Grakthar Gate!`
    :`🛡 **${LIZARD_KING.name}** has fallen.`;
  const e=new EmbedBuilder()
    .setColor(COLORS.ALERT)
    .setTitle(title)
    .setDescription(desc)
    .setThumbnail(LIZARD_KING.img)
    .setTimestamp();
  await ch.send({...mention,embeds:[e]});
}
/* ================= SLASH COMMANDS ================= */
const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check bot latency and uptime"),
  new SlashCommandBuilder()
    .setName("debug")
    .setDescription("View system debug logs"),
  new SlashCommandBuilder()
    .setName("about")
    .setDescription("About Veyra Sentinel"),
  new SlashCommandBuilder()
    .setName("w3-status")
    .setDescription("View Wave 3 boss timers"),
  new SlashCommandBuilder()
    .setName("w3-alert")
    .setDescription("Send Wave 3 spawn alerts")
    .addStringOption(o =>
      o.setName("type")
        .setDescription("Alert type")
        .setRequired(true)
        .addChoices(
          { name: "Generals Spawned", value: "general" },
          { name: "Lizard King Spawned", value: "lizard" }
        )
    ),
  new SlashCommandBuilder()
    .setName("w3-control")
    .setDescription("Override Wave 3 timers (Admin)")
    .addStringOption(o =>
      o.setName("boss")
        .setDescription("Target")
        .setRequired(true)
        .addChoices(
          { name: "Generals", value: "generals" },
          { name: "Lizard King", value: "lizard" }
        )
    )
    .addStringOption(o =>
      o.setName("state")
        .setDescription("Timer state")
        .setRequired(true)
        .addChoices(
          { name: "Will Spawn In", value: "spawn" },
          { name: "Will Die In", value: "death" }
        )
    )
    .addIntegerOption(o => o.setName("hours").setDescription("Hours"))
    .addIntegerOption(o => o.setName("minutes").setDescription("Minutes"))
    .addIntegerOption(o => o.setName("seconds").setDescription("Seconds")),
  new SlashCommandBuilder()
    .setName("olympus-status")
    .setDescription("View Olympus boss timers"),
  new SlashCommandBuilder()
    .setName("olympus-alert")
    .setDescription("Send Olympus alerts")
    .addStringOption(o =>
      o.setName("boss")
        .setDescription("Boss")
        .setRequired(true)
        .addChoices(
          { name: "Oceanus", value: "oceanus" },
          { name: "Poseidon", value: "poseidon" }
        )
    )
    .addStringOption(o =>
      o.setName("state")
        .setDescription("State")
        .setRequired(true)
        .addChoices(
          { name: "Spawned", value: "spawn" },
          { name: "Defeated", value: "death" }
        )
    ),
  new SlashCommandBuilder()
    .setName("olympus-control")
    .setDescription("Override Olympus timers (Admin)")
    .addStringOption(o =>
      o.setName("boss")
        .setDescription("Boss")
        .setRequired(true)
        .addChoices(
          { name: "Oceanus", value: "oceanus" },
          { name: "Poseidon", value: "poseidon" }
        )
    )
    .addStringOption(o =>
      o.setName("state")
        .setDescription("Timer state")
        .setRequired(true)
        .addChoices(
          { name: "Will Spawn In", value: "spawn" },
          { name: "Will Die In", value: "death" }
        )
    )
    .addIntegerOption(o => o.setName("hours").setDescription("Hours"))
    .addIntegerOption(o => o.setName("minutes").setDescription("Minutes"))
    .addIntegerOption(o => o.setName("seconds").setDescription("Seconds")),
  new SlashCommandBuilder()
    .setName("set-channel")
    .setDescription("Set alert channel (Admin)")
    .addChannelOption(o =>
      o.setName("channel")
        .setDescription("Target channel")
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("set-role")
    .setDescription("Set ping role (Admin)")
    .addStringOption(o =>
      o.setName("system")
        .setDescription("System")
        .setRequired(true)
        .addChoices(
          { name: "Grakthar", value: "grakthar" },
          { name: "Olympus", value: "olympus" }
        )
    )
    .addRoleOption(o =>
      o.setName("role")
        .setDescription("Role to ping")
        .setRequired(true)
    )
].map(c => c.toJSON());
/* ================= REGISTER ================= */
const rest=new REST({version:"10"}).setToken(TOKEN);
(async()=>{await rest.put(Routes.applicationCommands(CLIENT_ID),{body:commands});})();
/* ================= READY ================= */
client.once("ready",()=>console.log(`🤖 Online as ${client.user.tag}`));
