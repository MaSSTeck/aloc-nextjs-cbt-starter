# ALOC Next.js CBT Practice Starter Kit 🚀

> A production-ready, open-source Computer Based Test (CBT) practice web application for Nigerian & West African examinations (JAMB/UTME, WAEC, NECO, and Post-UTME), powered by **[ALOC Station](https://aloc.com.ng)** and `@massteck/aloc-sdk`.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMaSSTeck%2Faloc-nextjs-cbt-starter&env=ALOC_API_KEY,ALOC_BASE_URL)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![ALOC SDK](https://img.shields.io/badge/SDK-%40massteck%2Faloc--sdk-gold.svg)](https://www.npmjs.com/package/@massteck/aloc-sdk)
[![MCP Ready](https://img.shields.io/badge/MCP-Ready-purple.svg)](https://aloc.com.ng/docs/mcp)

---

## Features

- 🎯 **Exam Selection**: Built-in support for JAMB/UTME, WAEC (WASSCE), NECO, and Post-UTME.
- 📚 **Topic & Subject Drills**: Drill down into specific curriculum subjects (Mathematics, Chemistry, Physics, Biology, English) and syllabus topics.
- ⏱️ **Timed CBT Simulation**: Real-time countdown timer, question navigator, and answered state tracking.
- 📊 **Instant Score & Analytics**: Calculates accuracy score, breakdown by topic, and time spent.
- 💡 **Step-by-Step Explanations**: Instant access to L3 step-by-step reasoning and worked solutions.
- 🤖 **AI Tutor & MCP Ready**: Built on infrastructure compatible with ALOC's native Model Context Protocol (MCP) server for Claude and Cursor AI tutors.
- ⚡ **Zero-Config SDK**: Integrated with `@massteck/aloc-sdk` for typed API interaction.

---

## Quickstart

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/MaSSTeck/aloc-nextjs-cbt-starter.git
cd aloc-nextjs-cbt-starter
npm install
```

### 2. Configure Your Environment

Copy `.env.example` to `.env` and add your ALOC API Key:

```bash
cp .env.example .env
```

```env
ALOC_API_KEY=alc_live_your_api_key_here
ALOC_BASE_URL=https://dev.aloc.com.ng/api/v1
```

> Don't have an API key yet? [Create a free developer account on ALOC](https://aloc.com.ng/register) and get 1,000 free credits/month.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How It Works

This starter uses `@massteck/aloc-sdk` to fetch curriculum-aligned questions directly from the ALOC Assessment Content Infrastructure API:

```typescript
import { QuestionsApi, Configuration } from "@massteck/aloc-sdk";

const apiKey = process.env.ALOC_API_KEY || "";
const config = new Configuration({
  apiKey: apiKey,
  basePath: process.env.ALOC_BASE_URL || "https://dev.aloc.com.ng/api/v1",
  headers: {
    "X-API-Key": apiKey,
  },
});

const aloc = new QuestionsApi(config);

// Query WAEC Chemistry questions by topic (defaults to historical past questions)
const response = await aloc.listQuestions({
  examType: "waec",
  subject: "chemistry",
  topic: "Periodic Table",
  contentSource: "historical", // Default: 'historical'; pass 'synthetic' or 'all' to opt in
  limit: 15,
});
```

---

## Deploy to Vercel

Click the button below to deploy this starter directly to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMaSSTeck%2Faloc-nextjs-cbt-starter&env=ALOC_API_KEY,ALOC_BASE_URL)

---

## License

MIT © [MaSSTeck / ALOC Station](https://aloc.com.ng).
