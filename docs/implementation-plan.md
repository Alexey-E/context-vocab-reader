# Implementation Plan

The project is implemented in vertical, reviewable stages. Each stage should leave the application in a working state and end with clear acceptance criteria.

## Stage 0 — Scope and architecture decisions

- [x] Define the MVP user flow.
- [x] Define included and excluded features.
- [x] Separate persistent learning data from temporary translation data.
- [x] Define the high-level application architecture.
- [x] Define the initial database entities.
- [x] Record important trade-offs.
- [x] Define rules for AI-assisted development.

### Exit criteria

The team can explain what the MVP includes, where data lives, where secrets live, which data is temporary, and which decisions are intentionally deferred.

## Stage 1 — Project foundation

- [x] Initialize Next.js with the App Router and TypeScript.
- [x] Use pnpm and commit the lockfile.
- [x] Add ESLint and formatting configuration.
- [x] Add `typecheck`, `test`, and `build` scripts.
- [x] Add `.gitignore` for macOS, VS Code, Next.js, Supabase, Vercel, and test artifacts.
- [x] Add `.env.example` without real secrets.
- [ ] Create the initial `src/` feature-oriented structure.
- [x] Verify local development and production build.

### Exit criteria

`pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` pass locally.

## Stage 2 — CI and Vercel deployment

- [ ] Import the repository into Vercel.
- [ ] Configure development, preview, and production environment variables.
- [ ] Add GitHub Actions checks for lint, typecheck, tests, and build.
- [ ] Verify preview deployments for pull requests.
- [ ] Verify production deployment from `main`.
- [ ] Add branch protection after CI is stable.

### Exit criteria

Every pull request has automated quality checks and a preview deployment.

## Stage 3 — Supabase foundation

- [ ] Initialize Supabase local development.
- [ ] Create the initial schema migration.
- [ ] Create `profiles`, `documents`, and `vocabulary_cards`.
- [ ] Add constraints and indexes.
- [ ] Enable Row Level Security.
- [ ] Add ownership policies for all user-owned tables.
- [ ] Add development seed data.
- [ ] Verify schema recreation with `supabase db reset`.
- [ ] Link the remote project and apply migrations manually.

### Exit criteria

The database can be recreated from versioned migrations and one user cannot access another user's data.

## Stage 4 — Authentication

- [ ] Configure Supabase clients for browser and server usage.
- [ ] Implement email/password registration and login.
- [ ] Configure Google OAuth.
- [ ] Implement the OAuth callback route.
- [ ] Protect application routes.
- [ ] Add logout.
- [ ] Create or synchronize the user profile.
- [ ] Handle loading, invalid credentials, cancelled OAuth, and expired sessions.

### Exit criteria

A user can register, sign in, refresh the application, access protected routes, and sign out locally and on Vercel.

## Stage 5 — Documents vertical slice

- [ ] Create the documents dashboard.
- [ ] Create a document form with title, content, source language, and target language.
- [ ] Store documents under the authenticated user.
- [ ] List only the current user's documents.
- [ ] Open a document by ID.
- [ ] Delete a document with confirmation.
- [ ] Add empty, loading, validation, and error states.

### Exit criteria

A signed-in user can create, list, open, refresh, and delete a private document.

## Stage 6 — Reader without translation

- [ ] Render document content in a readable responsive layout.
- [ ] Split content into paragraphs.
- [ ] Split paragraphs into interactive sentences.
- [ ] Tokenize text while preserving whitespace and punctuation.
- [ ] Implement `normalizeWord`.
- [ ] Add selected-sentence state.
- [ ] Add light and dark themes.
- [ ] Add unit tests for splitting, tokenization, and normalization.

### Exit criteria

Normal prose is rendered without losing punctuation or spacing, and sentences and words can be interacted with independently.

## Stage 7 — Translation provider abstraction

- [ ] Define the translation-provider contract.
- [ ] Implement a deterministic mock provider.
- [ ] Implement the Google Cloud Translation provider.
- [ ] Select the provider through environment configuration.
- [ ] Keep provider credentials server-side.
- [ ] Add input validation, timeouts, and controlled error mapping.

### Exit criteria

Feature code can request a translation without knowing which provider is active.

## Stage 8 — Sentence translation and short-lived cache

- [ ] Add a server action or route handler for translation.
- [ ] Generate a cache key from normalized text, languages, and provider.
- [ ] Add a short-lived in-memory cache.
- [ ] Add idle, loading, success, error, and retry states.
- [ ] Avoid duplicate provider requests during the cache lifetime.
- [ ] Document the limits of instance-local serverless memory.

### Exit criteria

A sentence can be translated on demand, and an immediate repeated request can reuse the cached response without creating persistent translation history.

## Stage 9 — Save vocabulary cards

- [ ] Allow the user to select or activate a word.
- [ ] Request or enter a word translation.
- [ ] Store the document's normalized source and target languages on the card.
- [ ] Capture optional `usage_context`.
- [ ] Support an optional note.
- [ ] Validate an optional external image URL.
- [ ] Preview the image and handle broken URLs.
- [ ] Show the existing card when the normalized word and language pair are already saved.
- [ ] Store multiple meanings in the card's `translation` array without duplicate values.
- [ ] Save or update the card under the authenticated user.

### Exit criteria

A card persists after refresh and remains inaccessible to other users.

## Stage 10 — Saved words in the reader

- [ ] Load vocabulary cards matching the document's source and target languages.
- [ ] Build a lookup structure keyed by language pair and normalized word.
- [ ] Highlight tokens with saved cards.
- [ ] Add hover, keyboard focus, click, and mobile tap interactions.
- [ ] Show the matching card in a popover.
- [ ] Update reader state after saving without a full reload.

### Exit criteria

Saved words are visible and accessible in the reader across mouse, keyboard, and touch interaction models.

## Stage 11 — Vocabulary dashboard

- [ ] List vocabulary cards.
- [ ] Add search.
- [ ] Display and filter cards by language pair.
- [ ] Edit and delete cards.
- [ ] Show image fallbacks.

### Exit criteria

Vocabulary cards can be managed independently of the reader.

## Stage 12 — Production behavior and accessibility

- [ ] Add route-level error and not-found states.
- [ ] Handle expired authentication.
- [ ] Handle provider timeouts and rate limits.
- [ ] Audit keyboard navigation and focus visibility.
- [ ] Audit contrast in light and dark themes.
- [ ] Verify responsive behavior.
- [ ] Add safe optimistic updates where appropriate.

### Exit criteria

Expected failures do not break the demo and all primary flows are keyboard accessible.

## Stage 13 — Testing

- [ ] Unit-test text processing, URL validation, cache keys, and vocabulary normalization.
- [ ] Integration-test document and vocabulary operations.
- [ ] Verify authorization boundaries.
- [ ] Add an end-to-end happy path: login, create document, translate sentence, save word, open vocabulary.
- [ ] Add end-to-end error cases for broken images and failed translation.

### Exit criteria

The core user journey and the most important security boundaries are covered by automated tests.

## Stage 14 — Stable database delivery

- [ ] Keep migrations versioned and validated in CI.
- [ ] Add a manual GitHub Actions workflow for remote migration deployment.
- [ ] Store Supabase deployment credentials in GitHub Secrets.
- [ ] Avoid fully automatic production migrations until schema changes are predictable.

### Exit criteria

Application deployment is automatic and database deployment is explicit, repeatable, and auditable.

## Stage 15 — Portfolio packaging

- [ ] Add live demo and Figma links.
- [ ] Add screenshots or short product media.
- [ ] Document local setup from an empty machine.
- [ ] Add architecture and database diagrams.
- [ ] Document known limitations.
- [ ] Review commit and pull-request history for clarity.
- [ ] Explain AI-assisted development and manual verification.

### Exit criteria

A reviewer can understand the product, architecture, trade-offs, security model, and engineering process without additional explanation.

## Recommended pull request sequence

1. Project foundation
2. CI and Vercel setup
3. Supabase schema and RLS
4. Authentication
5. Documents CRUD
6. Reader text processing
7. Translation-provider abstraction
8. Sentence translation and cache
9. Vocabulary-card creation
10. Saved-word reader states
11. Vocabulary dashboard
12. Production behavior and accessibility
13. End-to-end tests
14. Stable database delivery
15. Portfolio documentation

## Working rule

Do not begin a later stage merely because its UI is attractive. Complete the exit criteria and required tests for the current dependency first.
