const config = require('../settings');
const moment = require('moment-timezone');
const { malvin, commands } = require('../malvin');
const { runtime } = require('../lib/functions');
const os = require('os');
const { getPrefix } = require('../lib/prefix');

// Fonction pour styliser les majuscules comme ʜɪ
function toUpperStylized(str) {
  const stylized = {
    A: 'ᴀ', B: 'ʙ', C: 'ᴄ', D: 'ᴅ', E: 'ᴇ', F: 'ғ', G: 'ɢ', H: 'ʜ',
    I: 'ɪ', J: 'ᴊ', K: 'ᴋ', L: 'ʟ', M: 'ᴍ', N: 'ɴ', O: 'ᴏ', P: 'ᴘ',
    Q: 'ǫ', R: 'ʀ', S: 's', T: 'ᴛ', U: 'ᴜ', V: 'ᴠ', W: 'ᴡ', X: 'x',
    Y: 'ʏ', Z: 'ᴢ'
  };
  return str.split('').map(c => stylized[c.toUpperCase()] || c).join('');
}

// Normalisation des catégories
const normalize = (str) => str.toLowerCase().replace(/\s+menu$/, '').trim();

// Emojis par catégorie normalisée
const emojiByCategory = {
  ai: '🤖',
  anime: '🍥',
  audio: '🎧',
  bible: '📖',
  download: '⬇️',
  downloader: '📥',
  fun: '🎮',
  game: '🕹️',
  group: '👥',
  img_edit: '🖌️',
  info: 'ℹ️',
  information: '🧠',
  logo: '🖼️',
  main: '🏠',
  media: '🎞️',
  menu: '📜',
  misc: '📦',
  music: '🎵',
  other: '📁',
  owner: '👑',
  privacy: '🔒',
  search: '🔎',
  settings: '⚙️',
  sticker: '🌟',
  tools: '🛠️',
  user: '👤',
  utilities: '🧰',
  utility: '🧮',
  wallpapers: '🖼️',
  whatsapp: '📱',
};

malvin({
  pattern: 'menu',
  alias: ['allmenu'],
  desc: 'Show all bot commands',
  category: 'menu',
  react: '👌',
  filename: __filename
}, async (malvin, mek, m, { from, sender, reply }) => {
  try {
    const prefix = getPrefix();
    const timezone = config.TIMEZONE || 'Africa/Nairobi';
    const time = moment().tz(timezone).format('HH:mm:ss');
    const date = moment().tz(timezone).format('dddd, DD MMMM YYYY');

    const uptime = () => {
      let sec = process.uptime();
      let h = Math.floor(sec / 3600);
      let m = Math.floor((sec % 3600) / 60);
      let s = Math.floor(sec % 60);
      return `${h}h ${m}m ${s}s`;
    };

    let menu = `*╭───────────────────⊷*
*┃ ᴜꜱᴇʀ : @${sender.split("@")[0]}*
*┃ ʀᴜɴᴛɪᴍᴇ : ${uptime()}*
*┃ ᴍᴏᴅᴇ : ${config.MODE}*
*┃ ᴘʀᴇғɪx : 「 ${config.PREFIX}」* 
*┃ ᴏᴡɴᴇʀ : ${config.OWNER_NAME}*
*┃ ᴘʟᴜɢɪɴꜱ : 『 ${commands.length} 』*
*┃ ᴅᴇᴠ : ᴄᴀsᴇʏʀʜᴏᴅᴇs 🎀*
*┃ ᴠᴇʀꜱɪᴏɴ : 2.0.0*
*╰──────────────────⊷*`;

    // Group commands by category (improved logic)
    const categories = {};
    for (const cmd of commands) {
      if (cmd.category && !cmd.dontAdd && cmd.pattern) {
        const normalizedCategory = normalize(cmd.category);
        categories[normalizedCategory] = categories[normalizedCategory] || [];
        // Extract just the command name without prefix
        const commandName = cmd.pattern.split('|')[0].trim();
        categories[normalizedCategory].push(commandName);
      }
    }

    // Add sorted categories with stylized text
    for (const cat of Object.keys(categories).sort()) {
      const emoji = emojiByCategory[cat] || '💫';
      menu += `\n\n*╭───『 ${emoji} ${toUpperStylized(cat)} ${toUpperStylized('Menu')} 』──⊷*\n`;
      for (const cmd of categories[cat].sort()) {
        menu += `*│ ✘${cmd}*\n`; // Using ✘ instead of prefix
      }
      menu += `*╰───────────────⊷*`;
    }

    menu += `\n\n> ${config.DESCRIPTION || toUpperStylized('Explore the bot commands!')}`;
    
    // Context info for newsletter with external ad
    const imageContextInfo = {
      forwardingScore: 1,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363405292255480@newsletter',
        newsletterName: 'ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴄᴀsᴇʏʀʜᴏᴅᴇs 🎀',
        serverMessageId: -1
      },
      externalAdReply: {
        title: 'ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴛᴇᴄʜ',
        body: 'ᴄᴀsᴇʏʀʜᴏᴅᴇs ʙᴏᴛ',
        mediaType: 1,
        sourceUrl: 'https://whatsapp.com/channel/0029VaExampleChannel',
        thumbnailUrl: config.MENU_IMAGE_URL || 'https://files.catbox.moe/6wfq18.jpg'
      }
    };

    // Send menu image
    await malvin.sendMessage(
      from,
      {
        image: { url: config.MENU_IMAGE_URL || 'https://files.catbox.moe/6wfq18.jpg' },
        caption: menu,
        contextInfo: imageContextInfo,
        mentions: [sender]
      },
      { quoted: mek }
    );

  } catch (e) {
    console.error('Menu Error:', e.message);
    await reply(`❌ ${toUpperStylized('Error')}: Failed to show menu. Try again.\n${toUpperStylized('Details')}: ${e.message}`);
  }
});
