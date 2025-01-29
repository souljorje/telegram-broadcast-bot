require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api');

// Load environment variables
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const bot = new TelegramBot(TOKEN, { polling: true });

// Rate limiting configuration
const MESSAGES_PER_SECOND = 30;
const BATCH_INTERVAL = 1000; // 1 second

// Broadcast protection
const activeBroadcasts = new Map(); // Track active broadcasts by chatId
const broadcastCooldowns = new Map(); // Track cooldowns by chatId
const COOLDOWN_PERIOD = 10000; // 10 seconds cooldown between broadcasts

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

// Function to process messages in batches with rate limiting
async function processBatch(users, chatId, messageId, messageParams, updateProgress) {
    const sentUsers = [];
    const notSentUsers = [];

    // Process users in batches
    for (let i = 0; i < users.length; i += MESSAGES_PER_SECOND) {
        // Check if broadcast was cancelled
        if (!activeBroadcasts.get(chatId)) {
            throw new Error('Broadcast cancelled');
        }

        const batch = users.slice(i, i + MESSAGES_PER_SECOND);
        const batchPromises = batch.map(async (user) => {
            try {
                await bot.copyMessage(
                    user,
                    chatId,
                    messageId,
                    messageParams
                );
                return { success: true, user };
            } catch (err) {
                console.error(`Failed to send message to ${user}:`, err);
                return { success: false, user };
            }
        });

        // Wait for all messages in the current batch to be sent
        const results = await Promise.all(batchPromises);
        
        // Process results
        results.forEach(({ success, user }) => {
            if (success) {
                sentUsers.push(user);
            } else {
                notSentUsers.push(user);
            }
        });

        // Update progress after each batch
        const progress = Math.round((i + batch.length) / users.length * 100);
        await updateProgress(progress, sentUsers.length, notSentUsers.length);

        // Wait for the next interval if there are more messages to send
        if (i + MESSAGES_PER_SECOND < users.length) {
            await new Promise(resolve => setTimeout(resolve, BATCH_INTERVAL));
        }
    }

    return { sentUsers, notSentUsers };
}

// Cancel broadcast command
bot.onText(/\/cancelbroadcast/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!(await isAdmin(chatId, userId))) {
        bot.sendMessage(chatId, "You must be an admin to cancel broadcasts.");
        return;
    }

    if (activeBroadcasts.get(chatId)) {
        activeBroadcasts.set(chatId, false);
        bot.sendMessage(chatId, "🛑 Cancelling broadcast... The current batch will complete before stopping.");
    } else {
        bot.sendMessage(chatId, "No active broadcast to cancel.");
    }
});

// Broadcast command
bot.onText(/\/broadcast(?:\s(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Check for active broadcast
    if (activeBroadcasts.get(chatId)) {
        bot.sendMessage(chatId, "⚠️ There's already an active broadcast. Use /cancelbroadcast to stop it first.");
        return;
    }

    // Check cooldown
    const lastBroadcast = broadcastCooldowns.get(chatId);
    if (lastBroadcast && Date.now() - lastBroadcast < COOLDOWN_PERIOD) {
        const remainingTime = Math.ceil((COOLDOWN_PERIOD - (Date.now() - lastBroadcast)) / 1000);
        bot.sendMessage(chatId, `⏳ Please wait ${remainingTime} seconds before starting another broadcast.`);
        return;
    }

    // Ensure the user is an admin
    if (!(await isAdmin(chatId, userId))) {
        bot.sendMessage(chatId, "You must be an admin to use this command.");
        return;
    }

    // Ensure a reply exists
    if (!msg.reply_to_message) {
        bot.sendMessage(chatId, "Reply to a message to broadcast.");
        return;
    }

    // Check if user IDs were provided
    if (!match[1]) {
        bot.sendMessage(chatId, "No users to broadcast to.");
        return;
    }

    // Process user IDs - remove duplicates and invalid IDs
    const userIds = match[1]
        .split(",")
        .map(id => id.trim())
        .map(id => parseInt(id))
        .filter(id => !isNaN(id));
    
    // Use Set to ensure uniqueness and convert back to array
    const uniqueUserIds = [...new Set(userIds)];

    if (uniqueUserIds.length === 0) {
        bot.sendMessage(chatId, "No valid users to broadcast to.");
        return;
    }

    // Set active broadcast flag and cooldown
    activeBroadcasts.set(chatId, true);
    broadcastCooldowns.set(chatId, Date.now());

    // Send initial status message
    const statusMessage = await bot.sendMessage(chatId, "📤 Broadcasting messages: 0%");

    // Progress update function
    const updateProgress = async (progress, sentCount, failedCount) => {
        const statusText = `📤 Broadcasting messages: ${progress}%\n` +
            `✅ Sent: ${sentCount}\n` +
            `❌ Failed: ${failedCount}\n` +
            `Use /cancelbroadcast to stop`;
        await bot.editMessageText(statusText, {
            chat_id: chatId,
            message_id: statusMessage.message_id
        }).catch(console.error);
    };

    try {
        // Extract message parameters
        const { message_id: messageId, ...restMessageParams } = msg.reply_to_message;

        // Process messages with rate limiting
        const { sentUsers, notSentUsers } = await processBatch(
            uniqueUserIds,
            chatId,
            messageId,
            restMessageParams,
            updateProgress
        );

        // Send final summary messages
        await bot.sendMessage(chatId, "📬 Broadcast completed!");
        if (sentUsers.length > 0) {
            bot.sendMessage(chatId, `✅ Successfully sent to ${sentUsers.length} users: ${sentUsers.join(', ')}`);
        }
        if (notSentUsers.length > 0) {
            bot.sendMessage(chatId, `❌ Failed to send to ${notSentUsers.length} users: ${notSentUsers.join(', ')}`);
        }
    } catch (error) {
        if (error.message === 'Broadcast cancelled') {
            await bot.sendMessage(chatId, "🛑 Broadcast cancelled successfully.");
        } else {
            await bot.sendMessage(chatId, "❌ An error occurred during broadcast.");
            console.error('Broadcast error:', error);
        }
    } finally {
        // Clean up
        activeBroadcasts.set(chatId, false);
    }
});