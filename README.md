# Telegram Rate-Limited Broadcast Bot

A Telegram bot that helps administrators broadcast messages to multiple users with smart rate limiting (30 messages/second) and protection against accidental duplicate broadcasts.

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/souljorje/telegram-broadcast-bot.git
cd telegram-broadcast-bot
```

2. Install dependencies:
```bash
npm i
```

3. Create `.env` file in the project root:
```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

4. Start the bot:
```bash
npm start
```

## Commands

### Broadcast Message
Reply to any message with command:
```
/broadcast 123456789,987654321,555555555
```
The bot will send this message to all specified users with rate limiting.

### Cancel Broadcast
To stop active broadcast:
```
/cancelbroadcast
```

## Features

- ⚡ Sends 30 messages per second
- 🔄 10-second cooldown between broadcasts
- 📊 Real-time progress tracking
- 🛡️ Admin-only access
- ❌ Duplicate broadcast protection
- 🚫 Broadcast cancellation
- 📝 Detailed delivery reports

## Usage Example

1. Forward or send the message you want to broadcast to your bot
2. Reply to this message with:
```
/broadcast 123456,789123,456789
```

You'll see progress updates:
```
📤 Broadcasting messages: 45%
✅ Sent: 135
❌ Failed: 3
Use /cancelbroadcast to stop
```

## Common Issues

- **"There's already an active broadcast"**: Wait for current broadcast to finish or use `/cancelbroadcast`
- **"Please wait X seconds"**: Cooldown period is active
- **"Must be admin"**: You need admin rights in the chat
- **"No valid users"**: Check the user IDs format

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