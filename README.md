# Word Hub Bot

A Telegram bot companion for [Word Hub](https://github.com/mehrnazkhani/word-hub): save, review, and quiz yourself on vocabulary right from Telegram.

Built with [grammY](https://grammy.dev) and [Hono](https://hono.dev), running on Cloudflare Workers.

<!-- Add a screenshot or short demo GIF of the bot here -->

## Features

- Add new words from a Telegram chat
- AI-assisted word details and translations (Google Gemini / Groq via the Vercel AI SDK)
- Multi-step conversations (grammY conversations plugin), with state stored in Workers KV
- Words stored in Supabase, shared with the Word Hub web app
- Serverless: runs on Cloudflare Workers, no server to maintain

## Tech Stack

| Area               | Tools                                            |
| ------------------ | ------------------------------------------------ |
| Runtime            | Cloudflare Workers, Wrangler                     |
| Web framework      | Hono                                             |
| Bot framework      | grammY, `@grammyjs/conversations`                |
| Database           | Supabase                                         |
| Conversation state | Cloudflare KV                                    |
| AI                 | Vercel AI SDK (`@ai-sdk/google`, `@ai-sdk/groq`) |
| Validation         | Zod                                              |
| Language / tooling | TypeScript, pnpm                                 |

## Getting Started

### Prerequisites

- Node.js and [pnpm](https://pnpm.io)
- A Cloudflare account
- A Telegram bot token from [@BotFather](https://t.me/BotFather)
- A Supabase project
- A Google AI (Gemini) and/or Groq API key

### Installation

```bash
git clone https://github.com/mehrnazkhani/word-hub-bot.git
cd word-hub-bot
pnpm install
```

### Configuration

Create a `.dev.vars` file for local development:

```env
BOT_TOKEN=your_telegram_bot_token
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
```

Create a KV namespace for conversation state and put its ID in `wrangler.jsonc`:

```bash
pnpm wrangler kv namespace create CONVERSATIONS
```

For production, set each secret with Wrangler:

```bash
pnpm wrangler secret put BOT_TOKEN
```

### Run Locally

```bash
pnpm dev
```

### Deploy

```bash
pnpm deploy
```

After deploying, point Telegram's webhook at your Worker URL:

```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<your-worker>.workers.dev/"
```

### Generate Worker Types

```bash
pnpm cf-typegen
```

## Project Structure

```
src/
  index.ts        # Hono app and Worker entry point
wrangler.jsonc    # Worker configuration and KV binding
```

## Related

- [Word Hub](https://github.com/mehrnazkhani/word-hub): the web app this bot works alongside

## License

MIT
