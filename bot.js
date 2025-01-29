require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api');

// Load environment variables
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

// Function to check if a user is an admin
async function isAdmin(chatId, userId) {
    try {
        const chatMember = await bot.getChatMember(chatId, userId);
        return chatMember.status === 'administrator' || chatMember.status === 'creator';
    } catch (err) {
        console.error('Error checking admin status:', err);
        return false;
    }
}

// Broadcast command
bot.onText(/\/broadcast(?:\s(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Ensure the user is an admin
    if (!(await isAdmin(chatId, userId))) return;

    // Ensure a reply exists
    if (!msg.reply_to_message) {
        bot.sendMessage(chatId, "Reply to a message to broadcast.");
        return;
    }

    // Get the target users (either from args or from saved users)

    if (!match[1]) {
        bot.sendMessage(chatId, "No users to broadcast to.");
        return;
    }
    const uniqUsers = [...new Set(match[1].split(","))];
    const targetUsers = uniqUsers.map(id => parseInt(id.trim())).filter(id => !isNaN(id));

    if (targetUsers.length === 0) {
        bot.sendMessage(chatId, "No users to broadcast to.");
        return;
    }

    const sentUsers = [];
    const notSentUsers = []
    // Forward the message to the target users
    for (const user of targetUsers) {
        const { message_id: messageId, ...restMessageParams } = msg.reply_to_message
        try {
          await bot.copyMessage(
            user,
            chatId,
            messageId,
            restMessageParams
          )
          sentUsers.push(user);
        } catch (err) {
            notSentUsers.push(user);
            console.error(`Failed to send message to ${user}:`, err);
        }
    }

    bot.sendMessage(chatId, `Broadcast sent to users: ${sentUsers.join(', ')}`);
    bot.sendMessage(chatId, `Broadcast NOT sent to users: ${notSentUsers.join(', ')}`);
});
