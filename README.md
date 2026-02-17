# SnapCode

**Screenshot to Code in Seconds.** Upload any UI screenshot and get clean, responsive code instantly.

## Features

- **6 Frameworks** — HTML + Tailwind, React, Vue, Next.js, Svelte, Bootstrap
- **AI-Powered** — Uses Google Gemini to analyze screenshots and generate code
- **AI Editing** — Edit generated code with natural language instructions
- **Live Preview** — Desktop, tablet, and mobile responsive preview
- **Export** — Copy code, download ZIP, open in CodeSandbox or StackBlitz
- **Free** — No signup required, 5 conversions per day

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **AI:** Google Gemini 2.5 Flash
- **Editor:** Monaco Editor
- **Animations:** Framer Motion

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/snapcode.git
cd snapcode
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey) and add it to `.env.local`:

```
GEMINI_API_KEY=your_api_key_here
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use SnapCode.

## Deploy

Deploy to Vercel in one click:

```bash
npm run build
```

Set `GEMINI_API_KEY` in your Vercel project environment variables.

## License

MIT
