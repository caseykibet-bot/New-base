const config = require('../settings');
const { malvin } = require('../malvin');
const moment = require('moment-timezone');

// Bot start time for uptime calculation
const botStartTime = process.hrtime.bigint();

const emojiSets = {
    reactions: ['⚡', '🚀', '💨', '🎯', '🌟', '💎', '🔥', '✨', '🌀', '🔹'],
    status: [
        { threshold: 0.3, text: '🚀 Super Fast' },
        { threshold: 0.6, text: '⚡ Fast' },
        { threshold: 1.0, text: '⚠️ Medium' },
        { threshold: Infinity, text: '🐢 Slow' }
    ]
};

malvin({
    pattern: 'ping',
    alias: ['speed', 'pong','p'],
    desc: 'Check bot\'s response time and status',
    category: 'main',
    react: '⚡',
    filename: __filename
}, async (malvin, mek, m, { from, sender, reply }) => {
    try {
        // High-resolution start time
        const start = process.hrtime.bigint();

        // Random emoji
        const reactionEmoji = emojiSets.reactions[Math.floor(Math.random() * emojiSets.reactions.length)];

        // React with emoji
        try {
            await malvin.sendMessage(from, { react: { text: reactionEmoji, key: mek.key } });
        } catch (reactError) {
            console.log('Could not send reaction, continuing anyway');
        }

        // Calculate response time in seconds
        const responseTime = Number(process.hrtime.bigint() - start) / 1e9;

        // Determine status based on response time
        const statusText = emojiSets.status.find(s => responseTime < s.threshold)?.text || '🐢 Slow';

        // Final output
        const pingMsg = `*${statusText}*\n\n⚡ *Response Time:* ${responseTime.toFixed(2)}s`;

        // Context info for newsletter with external ad
        const contextInfo = {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363405292255480@newsletter',
                newsletterName: `ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴛᴇᴄʜ🎀`,
                serverMessageId: 143
            },
            externalAdReply: {
                title: 'ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴛᴇᴄʜ🌸',
                body: 'ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴀɪ ʙᴏᴛ',
                mediaType: 1,
                previewType: 0,
                sourceUrl: 'https://whatsapp.com/channel/0029VaExampleChannel',
                thumbnailUrl: config.MENU_IMAGE_URL || 'https://files.catbox.moe/6wfq18.jpg',
                mediaUrl: '',
                showAdAttribution: true
            }
        };

        // Send message with context info
        await malvin.sendMessage(from, {
            text: pingMsg,
            contextInfo: contextInfo
        }, { quoted: mek });

        // Success reaction
        try {
            await malvin.sendMessage(from, { react: { text: '✅', key: mek.key } });
        } catch (e) {
            console.log('Could not send success reaction');
        }

    } catch (e) {
        console.error('❌ Ping command error:', e);
        await reply(`❌ Error: ${e.message || 'Failed to process ping command'}`);
        try {
            await malvin.sendMessage(from, { react: { text: '❌', key: mek.key } });
        } catch (reactError) {
            console.log('Could not send error reaction');
        }
    }
});
