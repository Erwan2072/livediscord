// index.js
import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

// --- CONFIG STREAMERS ---
const LIVES_CHANNEL = "1410353175906484385";

// TEST : force le live même hors-ligne
const FORCE_LIVE = true;

const streamers = [
  { name: "r_one2072", channel: LIVES_CHANNEL },
  { name: "albaart_mg", channel: LIVES_CHANNEL },
  { name: "papy_doc72", channel: LIVES_CHANNEL },
  { name: "baf_ouille", channel: LIVES_CHANNEL },
  { name: "mira_sati47", channel: LIVES_CHANNEL },
  { name: "rubydass", channel: LIVES_CHANNEL },
  { name: "Benaudo", channel: LIVES_CHANNEL },
  { name: "luckyfr06", channel: LIVES_CHANNEL },
  { name: "tisione30", channel: LIVES_CHANNEL },
];

// Anti double-annonce
const liveStatus = {};

// Token Twitch
let twitchToken = null;
let twitchTokenExpiry = 0;

// ----------------------
// TOKEN TWITCH
// ----------------------
async function getTwitchToken() {
  const now = Date.now();

  if (twitchToken && now < twitchTokenExpiry - 60000) {
    return twitchToken;
  }

  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: "POST" }
  );

  if (!res.ok) {
    console.error("Erreur token Twitch:", await res.text());
    return null;
  }

  const data = await res.json();
  twitchToken = data.access_token;
  twitchTokenExpiry = now + data.expires_in * 1000;

  console.log("Nouveau token Twitch récupéré");
  return twitchToken;
}

// ----------------------
// INFOS TWITCH STREAMER
// ----------------------
async function getStreamInfo(streamerName) {
  const token = await getTwitchToken();
  const cleanName = streamerName.trim().toLowerCase();

  const res = await fetch(
    `https://api.twitch.tv/helix/streams?user_login=${cleanName}`,
    {
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    console.error(
      `Erreur API Twitch pour ${cleanName}:`,
      res.status,
      await res.text()
    );
    return null;
  }

  const data = await res.json();
  return data.data.length > 0 ? data.data[0] : null;
}

// Format date FR
function formatStartTime(startedAt) {
  const date = new Date(startedAt);
  return date.toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ----------------------
// DISCORD BOT
// ----------------------
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

async function checkLive() {
  for (const streamer of streamers) {
    try {
      const stream = await getStreamInfo(streamer.name);
      const isLive = !!stream;


      // DÉBUT DU LIVE
      if (isLive && !liveStatus[streamer.name]) {
        liveStatus[streamer.name] = true;

        const title = stream.title || "En live !";
        const gameName = stream.game_name || "Non spécifié";
        const viewers = stream.viewer_count ?? 0;
        const startedAt = formatStartTime(stream.started_at);

        const thumbnail = stream.thumbnail_url
          .replace("{width}", "1280")
          .replace("{height}", "720");

        const embed = new EmbedBuilder()
          .setTitle(`${stream.user_name} est en live sur Twitch !`)
          .setDescription(title)
          .setURL(`https://twitch.tv/${streamer.name}`)
          .setColor(0x9146ff)
          .addFields(
            { name: "🎮 Jeu", value: gameName, inline: true },
            { name: "👁️ Viewers", value: viewers.toString(), inline: true },
            { name: "🕒 Live commencé à", value: startedAt, inline: false }
          )
          .setImage(thumbnail)
          .setTimestamp();

        const channel = client.channels.cache.get(streamer.channel);
        if (channel) {
          // Message @everyone SANS EMBED AUTO
          await channel.send({
            content:
              `📢 **Hey @everyone !**\n` +
              `Notre streamer **${streamer.name}** est en live !\n` +
              `👉 **Clique ici pour le soutenir :** <https://www.twitch.tv/${streamer.name}>\n` +
              `💬 Viens discuter et passer un bon moment avec lui !`,
            allowedMentions: { parse: ["everyone"] },
            flags: 4096 // ⛔ supprime l’embed automatique de Discord
          });

          // Embed Twitch personnalisé
          await channel.send({ embeds: [embed] });

          console.log(`Annonce envoyée pour ${streamer.name}`);
        }
      }

      // FIN DU LIVE
      if (!isLive && liveStatus[streamer.name]) {
        liveStatus[streamer.name] = false;
        console.log(`${streamer.name} est maintenant hors-ligne.`);
      }
    } catch (e) {
      console.error("Erreur check stream:", e);
    }
  }
}

// ----------------------
// BOT READY
// ----------------------
client.once("ready", () => {
  console.log(`Bot connecté en tant que ${client.user.tag} !`);
  checkLive();
  setInterval(checkLive, 60000);
});

client.login(process.env.BOT_TOKEN);
