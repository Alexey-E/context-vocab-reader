# Context Vocab Reader

A language learning reader that helps users translate text on demand and save vocabulary cards from real reading context.

The project is built as a production-style MVP using **Next.js**, **TypeScript**, **Supabase**, and **Vercel**. The main goal is not to build another generic translator, but to demonstrate a clean full-stack architecture around authentication, user-owned data, translation flow, vocabulary cards, and cost-aware API usage.

## Product idea

Context Vocab Reader allows users to paste or import a text, read it sentence by sentence, translate selected sentences on demand, and save useful words as vocabulary cards.

Sentence translations are treated as temporary reading assistance. Vocabulary cards are persistent learning data.

## Core features

- Google authentication with Supabase Auth
- Email/password authentication fallback
- Read-only public sample texts in multiple languages
- Guest translation demo without sign-in
- User-owned documents
- Reader view with sentence-level translation
- Highlighting for words that already have saved vocabulary cards
- Hover popover for saved words
- Vocabulary cards with:
  - word
  - source and target languages
  - one or more translations
  - usage context
  - optional note
  - optional external image URL
- Vocabulary dashboard
- Light and dark theme design
- Row Level Security for user-owned data

## Important product decisions

### Sentence translations are temporary

Sentence and paragraph translations are requested on demand and are not stored as persistent user content.

This is a deliberate product and architecture decision: the application does not need to build a long-term database of sentence translations in order to support the main learning flow.

To improve responsiveness and reduce unnecessary translation API calls, the app may use a short-lived in-memory cache during the active reading session. This cache is a technical optimization for UX and cost control, not a persistent translation history.

### Vocabulary cards are persistent

Only words explicitly saved by the user become persistent learning data.

This keeps the database focused on the actual learning workflow instead of storing every temporary translation result.

Each card stores its source and target languages. This keeps identically spelled words in different languages separate and allows the same source word to be translated into different languages.

### Usage context is stored for saved words

A saved vocabulary card can include the sentence or fragment where the word was originally encountered.

This field is not the source of truth for the word translation. It is stored as usage context, helping the user remember how the word appeared in real reading.

### Images are external URLs

Vocabulary cards can include an image URL, but the MVP does not upload or store images on the application server or in Supabase Storage.

If an external image URL becomes unavailable, the app should show a fallback state while keeping the vocabulary card itself usable.

### Public demo can use mock translations

To avoid unexpected Google Translation API costs, the deployed demo can run with a mock translation provider.

Real Google Translation API integration can be enabled locally or in a controlled environment.

## Tech stack

- **Next.js** — application framework
- **React** — UI
- **TypeScript** — type safety
- **Supabase** — auth, Postgres database, RLS
- **Vercel** — deployment
- **Google OAuth** — social login
- **Google Cloud Translation API** — optional real translation provider
- **Vitest** — unit tests
- **ESLint / TypeScript** — code quality checks

## Architecture overview

```txt
Client UI
  ↓
Next.js Server Actions / Route Handlers
  ↓
Translation Provider
  ├─ Mock provider for demo/dev safety
  └─ Google Translation API for real translation
  ↓
Supabase
  ├─ Auth
  ├─ Postgres
  └─ Row Level Security
```

## Data model

Planned MVP entities:

```txt
auth.users
  └─ profiles

profiles
  ├─ documents
  └─ vocabulary_cards

sample_documents
  └─ curated public demo texts
```

### `profiles`

Stores user-facing profile settings and language preferences.

### `documents`

Stores texts added by the user for reading.

### `sample_documents`

Stores curated read-only texts that visitors can open without signing in.

### `vocabulary_cards`

Stores words explicitly saved by the user.

Each card can include:

- normalized word
- source language
- target language
- one or more translations
- usage context
- note
- external image URL

## Supabase and security

The app uses Supabase Auth for authentication and Supabase Postgres for persistent data.

All user-owned tables should have Row Level Security enabled.

Expected RLS behavior:

- anonymous and authenticated visitors can read curated sample documents
- clients cannot create, update, or delete curated sample documents
- users can read only their own documents
- users can create only their own documents
- users can update only their own documents
- users can delete only their own documents
- users can read only their own vocabulary cards
- users can manage only their own vocabulary cards

Service role keys must never be exposed to the browser.

## Environment variables

Create a `.env.local` file based on `.env.example`.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GOOGLE_TRANSLATE_API_KEY=
TRANSLATION_PROVIDER=mock

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Translation provider

Use mock translations by default:

```env
TRANSLATION_PROVIDER=mock
```

Use Google Translation API only when needed:

```env
TRANSLATION_PROVIDER=google
```

## Local development

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Run typecheck:

```bash
pnpm typecheck
```

Run lint:

```bash
pnpm lint
```

Run tests:

```bash
pnpm test
```

Build the app:

```bash
pnpm build
```

## Supabase local setup

Initialize Supabase:

```bash
supabase init
```

Start local Supabase:

```bash
supabase start
```

Create a migration:

```bash
supabase migration new initial_schema
```

Reset local database and apply migrations:

```bash
supabase db reset
```

Link remote Supabase project:

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

Push migrations to the remote project:

```bash
supabase db push
```

## Authentication setup

The MVP supports:

- Google OAuth
- email/password login

For Google login:

1. Create a Google OAuth Client ID in Google Cloud Console.
2. Add the Supabase callback URL to Google OAuth settings.
3. Enable Google provider in Supabase Auth.
4. Add local and production redirect URLs in Supabase.
5. Add Vercel production URL after deployment.

Example redirect URLs:

```txt
http://localhost:3000/**
https://your-app.vercel.app/**
```

## Deployment

The app is deployed with Vercel.

Recommended deployment model:

```txt
GitHub repository
  ↓
Vercel project
  ↓
Preview deployments for pull requests
  ↓
Production deployment from main branch
```

GitHub is used for source control and CI checks.

Vercel is used for application deployment.

Supabase migrations are initially applied manually using the Supabase CLI. A manual GitHub Actions workflow for database deployment can be added later when the schema stabilizes.

## CI

Planned GitHub Actions checks:

- install dependencies
- lint
- typecheck
- unit tests
- production build

CI is used to validate code quality before merging.

Vercel handles preview and production deployments.

## Suggested project structure

```txt
context-vocab-reader/
  app/
  components/
  features/
    auth/
    documents/
    reader/
    vocabulary/
    translation/
  lib/
    supabase/
    translation/
    validation/
  supabase/
    migrations/
    seed.sql
  docs/
    architecture.md
    database.md
    ai-usage.md
    trade-offs.md
  .env.example
  README.md
```

## AI-assisted development

AI tools may be used for scaffolding, refactoring suggestions, test generation, and code review.

All generated code should be manually reviewed, adjusted, and tested before being committed.

Architecture decisions, data model, RLS policies, API boundaries, and cost-control strategy are manually designed and verified.

## Scope control

The MVP intentionally does not include:

- image upload/storage
- payments
- teams or shared workspaces
- public vocabulary cards, likes, and recommendations
- long-term sentence translation storage
- vocabulary review scheduling and history
- spaced repetition algorithms
- offline mode
- browser extension
- mobile app
- advanced text import formats

These can be considered future improvements.

## Future improvements

- Spaced repetition scheduling, review history, and statistics
- Public vocabulary card sharing with likes and recommendations
- Import from EPUB/PDF/TXT
- Browser extension for saving words from any page
- Optional Supabase Storage support for images
- Translation history
- Shared reading lists
- Better language detection

## Repository goal

This repository is intended to demonstrate:

- practical Next.js application architecture
- Supabase Auth and RLS
- secure server/client boundary
- thoughtful MVP scoping
- cost-aware external API integration
- clean data modeling
- portfolio-ready engineering documentation
