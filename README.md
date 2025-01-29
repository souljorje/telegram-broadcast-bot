# Telegram Rate-Limited Broadcast Bot

A Telegram bot that helps administrators broadcast messages to multiple users with smart rate limiting (30 messages/second) and protection against accidental duplicate broadcasts.

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/username/telegram-broadcast-bot.git
cd telegram-broadcast-bot
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in the project root:
```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

4. Start the bot:
```bash
npm start
```

## Setup Chat for Broadcasting

1. Create a new group chat or use existing one
2. Add your bot to this chat
3. Make bot an administrator in the chat
4. Send a test message to verify the bot is working

## How to Broadcast

1. **Write or forward** the message you want to broadcast in the admin chat where your bot is an administrator
2. **Reply** to this message with command:
```
/broadcast 123456789,987654321,555555555
```

Example flow:
1. You: Send "Hello everyone! Meeting at 5 PM." in the admin chat
2. You: Reply to this message with `/broadcast 123456,789123,456789`
3. Bot: Starts broadcasting and shows progress

## Commands

### Broadcast Message
```
/broadcast <comma_separated_user_ids>
```
Must be used as a reply to the message you want to broadcast.

### Cancel Broadcast
```
/cancelbroadcast
```
Stops active broadcast operation.

## Features

- ⚡ Sends 30 messages per second
- 🔄 10-second cooldown between broadcasts
- 📊 Real-time progress tracking
- 🛡️ Admin-only access
- ❌ Duplicate broadcast protection
- 🚫 Broadcast cancellation
- 📝 Detailed delivery reports

## Progress Tracking

When broadcasting, you'll see updates like:
```
📤 Broadcasting messages: 45%
✅ Sent: 135
❌ Failed: 3
Use /cancelbroadcast to stop
```

## Common Issues

- **"There's already an active broadcast"**: Wait for current broadcast to finish or use `/cancelbroadcast`
- **"Please wait X seconds"**: Cooldown period is active
- **"Must be admin"**: Ensure the bot and you are admins in the chat
- **"No valid users"**: Check the user IDs format
- **"Reply to a message to broadcast"**: Command must be used as a reply to a message

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Security Notice

Never commit your `.env` file or share your bot token. Keep your node modules updated for security patches.