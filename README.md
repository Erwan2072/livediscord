#🎥 Discord Twitch Live Notifier

Bot Discord permettant d’annoncer automatiquement les lives Twitch des streamers de votre choix.

Il utilise l’API Twitch Helix et envoie un message personnalisé + un embed complet contenant :
✔ Le titre du live
✔ Le jeu joué
✔ Le nombre de viewers
✔ L’heure de début
✔ Une miniature HD
✔ Un ping @everyone
✔ Anti-doublon (une seule annonce par live)

##📌 Fonctionnalités

🔍 Détection automatique du lancement des streams

📣 Annonce automatique dans un salon Discord dédié

🛑 Anti-spam / Anti-doublon — un streamer n’est annoncé qu’une fois

🖼️ Embed personnalisé reprenant l’apparence Twitch

⛔ Suppression de l’aperçu automatique Discord

📝 Logs dans la console

⚙️ Test possible via une variable FORCE_LIVE

📁 Structure du projet
/livediscord
 ├── index.js          # Code principal du bot
 ├── package.json      # Dépendances et scripts
 ├── .env              # Tokens Discord & Twitch
 └── README.md         # Documentation du projet

##⚙️ Installation
1. Cloner le projet
git clone <url-du-projet>
cd livediscord

2. Installer les dépendances
npm install

🔐 Configuration

Créer un fichier .env :

BOT_TOKEN=TON_TOKEN_DISCORD
TWITCH_CLIENT_ID=TON_CLIENT_ID
TWITCH_CLIENT_SECRET=TON_CLIENT_SECRET


⚠️ Le fichier .env ne doit jamais être commité sur GitHub.

##🎮 Configuration des streamers

Dans index.js, modifier la liste :

const LIVES_CHANNEL = "ID_DU_SALON_DISCORD";

const streamers = [
  { name: "nom_du_streamer", channel: LIVES_CHANNEL },
  { name: "autre_streamer", channel: LIVES_CHANNEL },
];


name = pseudo Twitch sans majuscule

channel = ID du salon Discord où envoyer l’annonce

▶️ Lancer le bot
npm start


La console affichera :

Bot connecté !
Nouveau token Twitch récupéré
Analyse des live en cours...

📡 Fonctionnement

Le bot vérifie toutes les 60 secondes si un streamer passe en live.

Lorsqu’un live démarre :

Envoi d’un message personnalisé

Envoi d’un embed Twitch

Stockage en mémoire pour éviter les doublons

Le bot n’envoie pas une nouvelle annonce si le streamer reste en live.

🧪 Mode test : FORCER UN LIVE

Dans index.js :

const FORCE_LIVE = true;


→ Le bot annoncera le live même si la personne n’est pas en stream
⚠️ N’oublie pas de remettre false :

const FORCE_LIVE = false;

🚫 Désactiver l’embed automatique de Discord

Ce bot inclut déjà :

flags: 4096


Cela supprime l’aperçu automatique des liens Twitch, pour garder un message propre.

##🛠️ Dépendances principales
"discord.js": "^14.x",
"node-fetch": "^3.x",
"dotenv": "^16.x"

##🤝 Contributions

Les PR et suggestions sont les bienvenues.
N'hésitez pas à proposer de nouvelles fonctionnalités :

Bouton "Regarder le live"

Message pour fin de live

Système de logs webhook

Dashboard web de gestion

##📜 Licence

Ce projet est open-source sous licence MIT.