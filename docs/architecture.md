# Architecture

## Overview

Context Vocab Reader is a Next.js application deployed to Vercel. Supabase provides authentication and persistent PostgreSQL storage. Translation requests are executed through a server-side provider abstraction.

```text
Browser
  ↓
Next.js UI
  ↓
Server Action / Route Handler
  ↓
Translation provider abstraction
  ├─ Mock provider
  └─ Google Cloud Translation API

Next.js server code
  ↓
Supabase Auth + PostgreSQL + RLS
```

## Main responsibilities

### Browser

The browser is responsible for:

- rendering the interface
- managing temporary UI state
- displaying documents and translations
- selecting sentences and words
- initiating authenticated actions

The browser must never receive privileged secrets.

### Next.js

Next.js is responsible for:

- routing
- server-rendered and client-rendered UI boundaries
- protected route handling
- validation of user input
- translation provider calls
- access to server-only environment variables
- orchestration of Supabase operations
- mapping infrastructure errors into controlled application errors

### Supabase

Supabase is responsible for:

- Google OAuth
- email/password authentication
- session management
- PostgreSQL persistence
- Row Level Security
- user data isolation
- schema migrations

### Vercel

Vercel is responsible for:

- preview deployments for pull requests and branches
- production deployment from the main branch
- environment variable management
- execution of Next.js server functions

### GitHub Actions

GitHub Actions is responsible for continuous integration checks:

- dependency installation
- linting
- type checking
- unit tests
- integration tests when available
- production build validation

Vercel handles application deployment. Supabase database migrations are applied manually at first and can later be moved to a protected manual workflow.

## Server and client boundary

Client components should be used only when browser interaction or local UI state is required.

Server Components, Server Actions, and Route Handlers should be preferred for:

- reading authenticated data
- creating or updating user-owned records
- accessing server-only secrets
- calling the translation provider
- enforcing authorization before mutations

The following values must never be exposed to the client:

- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_TRANSLATE_API_KEY`
- any future privileged database credentials

## Authentication flow

```text
User opens protected page
→ server checks Supabase session
→ unauthenticated user is redirected to /login
→ user authenticates through Google or email/password
→ Supabase redirects to /auth/callback
→ session is established
→ user is redirected to the application
```

Google OAuth redirect URLs must be configured for both localhost and Vercel deployments.

## Translation flow

```text
User selects text
→ client sends text and language pair to server
→ server validates input and session
→ server creates a normalized cache key
→ server checks short-lived cache
→ cache hit: return cached translation
→ cache miss: call configured provider
→ store temporary cache entry
→ return translation
```

Sentence and paragraph translations are not persistent learning data and are not stored as permanent translation history.

## Translation provider abstraction

Application code should depend on a provider contract rather than Google-specific implementation details.

```ts
interface TranslationProvider {
  translate(input: {
    text: string;
    sourceLanguage: string;
    targetLanguage: string;
  }): Promise<{
    translatedText: string;
    provider: string;
  }>;
}
```

Initial implementations:

- `MockTranslationProvider`
- `GoogleTranslationProvider`

The active implementation is selected through `TRANSLATION_PROVIDER`.

## Cache strategy

The short-lived cache exists to:

- avoid duplicate provider calls
- reduce translation cost
- remove repeated network latency
- improve responsiveness during an active reading session

The first implementation may use in-memory server storage. This has an accepted limitation: Vercel serverless instances do not share a global in-memory cache and may be recreated at any time.

A distributed cache should be introduced only if real usage proves it necessary.

## Text processing

Documents store the original text in `documents.content`.

Paragraphs, sentences, and word tokens are derived at runtime. They are not separate database entities in the MVP.

Pure functions should handle:

- paragraph splitting
- sentence splitting
- word tokenization
- word normalization

These functions should preserve punctuation and spacing required for correct rendering.

## Security principles

- RLS is enabled for every user-owned table.
- A user ID submitted by the browser is never trusted.
- Mutations derive the user ID from the authenticated server session.
- Service role access is reserved for narrowly defined server-only operations.
- Translation input is validated before calling an external API.
- Logs must not expose secrets or unnecessary user content.
- External image failures must not affect vocabulary data integrity.

## Deployment model

```text
Feature branch
→ pull request
→ GitHub Actions checks
→ Vercel preview deployment
→ review
→ merge to main
→ Vercel production deployment
```

Database migrations initially follow:

```text
Create migration locally
→ supabase db reset
→ review migration
→ link remote project
→ supabase db push
```

## Architecture constraints

The MVP deliberately avoids:

- a separate backend service
- persistent sentence translation storage
- database entities for paragraphs or sentences
- Supabase Storage for vocabulary images
- distributed queues
- microservices
- premature distributed caching

These constraints keep the system understandable while preserving a clean path for later evolution.
