# 🤖 Jarvis — AI Personal Assistant

A premium, futuristic AI assistant with persistent memory, voice interaction, and a glassmorphism UI.

## ✨ Features

- **Voice Interface** — Speech recognition + text-to-speech with visual waveform
- **Persistent Memory** — Remembers preferences, projects, goals across conversations
- **LLM-Powered** — Claude (Anthropic) with memory context injection
- **4 Pages** — Landing, Assistant dashboard, Memory manager, Settings
- **Futuristic UI** — Dark glassmorphism with glow effects, grid backgrounds, scan lines
- **Responsive** — Desktop sidebar + mobile bottom nav

## 🗂 Project Structure

```
jarvis/
├── app/
│   ├── page.tsx                   # Landing page
│   ├── layout.tsx                 # Root layout
│   ├── globals.css                # Jarvis design system
│   └── (app)/
│       ├── layout.tsx             # App shell (sidebar + mobile nav)
│       ├── assistant/page.tsx     # Main chat interface
│       ├── memory/page.tsx        # Memory manager
│       ├── settings/page.tsx      # Settings panel
│       └── api/
│           ├── chat/route.ts      # Chat + history API
│           ├── memories/route.ts  # Memory CRUD API
│           └── settings/route.ts  # Settings API
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx            # Desktop sidebar nav
│   │   └── MobileNav.tsx          # Mobile bottom nav
│   ├── chat/
│   │   └── ChatMessage.tsx        # Message bubble component
│   └── voice/
│       ├── Waveform.tsx           # Animated voice waveform
│       └── useVoice.ts            # Speech recognition + TTS hook
├── lib/
│   ├── prisma.ts                  # Prisma client singleton
│   └── memory.ts                  # Memory context + auto-extraction
├── prisma/
│   └── schema.prisma              # Database schema
└── .env.example                   # Environment template
```

## 🚀 Setup & Installation

### 1. Clone and install

```bash
cd jarvis
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="file:./dev.db"
ANTHROPIC_API_KEY="sk-ant-..."    # Get from console.anthropic.com
```

### 3. Initialize database

```bash
npm run db:generate    # Generate Prisma client
npm run db:push        # Create database + tables
```

### 4. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🗄 Database Schema

| Table | Purpose |
|-------|---------|
| `Conversation` | Chat session containers |
| `Message` | Individual messages (user + assistant) |
| `Memory` | Persistent knowledge entries (4 categories) |
| `Settings` | User and assistant configuration |

### Memory Categories
- **preferences** — User likes, dislikes, working style
- **projects** — Ongoing work and codebases
- **goals** — Short and long-term objectives  
- **general** — Miscellaneous important facts

## 🔑 Getting an API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account or sign in
3. Navigate to **API Keys**
4. Create a new key and copy it to your `.env`

## 🚢 Production Deployment

### Switch to PostgreSQL

```env
DATABASE_URL="postgresql://user:password@host:5432/jarvis"
```

Run:
```bash
npm run db:push
npm run build
npm start
```

### Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Add environment variables in Vercel dashboard:
- `DATABASE_URL` — PostgreSQL connection string (e.g. Neon, Supabase)
- `ANTHROPIC_API_KEY` — Your Anthropic key

### Recommended free hosting stack
- **App**: Vercel (free tier)
- **Database**: Neon (free PostgreSQL) or Supabase
- **Domain**: Vercel subdomain or custom

## 🎤 Voice Support

Voice features use browser Web Speech API:
- **Chrome/Edge**: Full support (recognition + TTS)
- **Firefox**: TTS only (no recognition)
- **Safari**: Partial support (may need microphone permission)

The UI gracefully degrades — mic button hides if recognition is unavailable.

## 🧠 Memory System

**Auto-extraction**: When chatting, the system scans messages for patterns like:
- "My name is..." → saves as Preference
- "I'm working on..." → saves as Project  
- "My goal is..." → saves as Goal
- "I prefer..." → saves as Preference

**Manual memory**: Use the Memory Manager page to add, edit, pin, or delete entries.

**Context injection**: Every AI response includes a formatted memory summary in the system prompt, so Jarvis always knows your context.

## 🎨 Design System

The UI uses custom CSS classes from `globals.css`:
- `.glass` / `.glass-card` — Glassmorphism panels
- `.glow-text` / `.glow-border` — Cyan glow effects  
- `.glow-btn` / `.glow-btn-primary` — Buttons
- `.grid-bg` — Futuristic grid background
- `.font-display` — Rajdhani display font
- `.message-user` / `.message-assistant` — Chat bubbles

Colors: `#020408` bg, `#00d4ff` cyan glow, `#0066ff` blue accent, `#00ff88` green status

## 🛠 Customization

- **Assistant personality**: Edit `systemPrompt` in Settings page
- **Assistant name**: Change in Settings → Identity
- **Add memory categories**: Update `CATEGORIES` in `memory/page.tsx` and the Prisma schema
- **Change AI model**: Edit `model` in `app/api/chat/route.ts`

---

Built with Next.js 14, Prisma, Tailwind CSS, Framer Motion, and Anthropic Claude.
