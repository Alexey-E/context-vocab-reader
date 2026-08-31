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
- [x] Create the initial `src/` feature-oriented structure.
- [x] Verify local development and production build.

### Exit criteria

`pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` pass locally.

## Stage 2 — CI and Vercel deployment

- [x] Import the repository into Vercel.
- [x] Configure development, preview, and production environment variables.
- [x] Add GitHub Actions checks for lint, typecheck, tests, and build.
- [x] Verify preview deployments for pull requests.
- [x] Verify production deployment from `main`.
- [x] Add branch protection after CI is stable.

### Exit criteria

Every pull request has automated quality checks and a preview deployment.

## Stage 3 — Supabase foundation

- [x] Initialize Supabase local development.
- [x] Create the initial schema migration.
- [x] Create `profiles`, `documents`, and `vocabulary_cards`.
- [x] Create the read-only `sample_documents` table.
- [x] Add constraints and indexes.
- [x] Enable Row Level Security.
- [x] Add ownership policies for all user-owned tables.
- [x] Grant public read-only access to sample documents for `anon` and `authenticated`.
- [x] Add development seed data.
- [x] Add curated sample texts in three or four source languages.
- [x] Test anonymous sample reads and denied sample mutations.
- [x] Verify schema recreation with `supabase db reset`.
- [x] Link the remote project and apply migrations manually.

### Exit criteria

The database can be recreated from versioned migrations, public samples are read-only, and one user cannot access another user's data.

## Stage 4 — Authentication

- [x] Configure Supabase clients for browser and server usage.
- [x] Implement email/password registration and login.
- [x] Configure Google OAuth.
- [x] Implement the OAuth callback route.
- [x] Protect application routes.
- [x] Add logout.
- [x] Create or synchronize the user profile.
- [x] Handle loading, invalid credentials, cancelled OAuth, and expired sessions.

### Exit criteria

An unauthenticated visitor can access public routes. A user can register, sign in, refresh the application, access protected routes, and sign out locally and on Vercel. A profile is created automatically for every registered user.

## Stage 5 — Documents vertical slice

- [x] List curated sample documents without requiring a session.
- [x] Open a sample document in read-only mode.
- [x] Create the documents dashboard.
- [x] Create a document form with title, content, source language, and target language.
- [x] Store documents under the authenticated user.
- [x] List only the current user's documents.
- [x] Open a document by ID.
- [x] Delete a document with confirmation.
- [x] Add empty, loading, validation, and error states.
- [x] Verify the Stage 5 acceptance flow locally.
- [x] Verify the Stage 5 acceptance flow on Vercel.

### Exit criteria

A visitor can open a curated sample, while a signed-in user can create, list, open, refresh, and delete a private document.

## Stage 6 — Reader without translation

- [x] Render document content in a readable responsive layout.
- [x] Split content into paragraphs.
- [x] Split paragraphs into identifiable, non-interactive sentences.
- [x] Tokenize text while preserving whitespace and punctuation.
- [x] Implement `normalizeWord`.
- [x] Render sentences and tokens as semantic text without turning prose into controls.
- [x] Add global System, Light, and Dark themes.
- [x] Adopt React Aria Components for the accessible theme menu and document the library boundary.
- [x] Add unit tests for splitting, tokenization, normalization, reader markup, and theme cookies.
- [x] Verify the Stage 6 acceptance flow locally.
- [x] Verify the Stage 6 acceptance flow on Vercel.

### Exit criteria

Normal prose is rendered without losing punctuation or spacing, sentences and words remain identifiable deterministic text spans for the later translation and vocabulary stages, native text selection remains available, and the selected application theme persists on the current device.

## Stage 7 — Interface internationalization

- [x] Add `next-intl` and define typed `en`, `ru`, `fr`, `es`, and `ar` message catalogs.
- [x] Use English as the default locale with unprefixed URLs and Russian, French, Spanish, and Arabic under `/ru`, `/fr`, `/es`, and `/ar` via `localePrefix: "as-needed"`.
- [x] Detect locale from the explicit URL, saved locale cookie, browser preferences, then fall back to English.
- [x] Add a global language switcher with React Aria Components that preserves the current destination and saves the preference.
- [x] Localize navigation, forms, validation, authentication, document flows, route states, and accessibility labels.
- [x] Convert the centralized error catalog from fixed English messages to typed localization keys while preserving safe application error codes.
- [x] Localize page metadata and set the correct document `lang`.
- [x] Set the entire interface to RTL for Arabic while keeping reader content direction tied to the document language.
- [x] Format dates, numbers, and plurals using the active locale.
- [x] Keep user documents and sample contents separate from interface localization; keep language codes and capabilities in an independent catalog while formatting their display names for the active interface locale.
- [x] Add unit and Playwright coverage for locale validation, routing, switching, and persistence.
- [x] Verify the localization flow locally and on Vercel.

### Exit criteria

English pages use canonical unprefixed URLs, Russian, French, Spanish, and Arabic pages use their locale prefixes, language switching preserves the current flow, refresh keeps the selected locale, Arabic renders the interface in RTL, and all existing user-facing interface states are available in all five languages without translating user content.

## Stage 8 — Dependency supply-chain security

- [x] Upgrade to a verified pnpm release that supports release-age, trust, integrity, and exotic-source policies.
- [x] Pin the exact pnpm version in `packageManager` and use the same version locally and in CI.
- [x] Pin direct dependencies and dev dependencies to exact versions and enable `saveExact` for future additions.
- [x] Keep `pnpm-lock.yaml` committed and require `pnpm install --frozen-lockfile` in CI and deployment builds.
- [x] Reject tarballs whose integrity differs from the committed lockfile instead of updating checksums automatically.
- [x] Delay newly published direct and transitive dependency versions by seven days with `minimumReleaseAge`.
- [x] Enable `trustPolicy: no-downgrade` after validating the existing dependency graph and document any narrowly scoped exceptions.
- [x] Block exotic transitive dependency sources such as arbitrary Git repositories and tarball URLs.
- [x] Keep dependency lifecycle scripts disabled by default and explicitly allow only reviewed packages that require a build step.
- [x] Add weekly Dependabot updates for the pnpm/npm ecosystem and GitHub Actions.
- [x] Pin third-party GitHub Actions to full commit SHAs while retaining the release tag in a comment for maintenance.
- [x] Enable GitHub dependency alerts and define how known vulnerabilities block or expedite an update PR.
- [x] Document the dependency-update workflow: review the changelog and provenance, inspect lockfile changes, run CI, and merge through a pull request.

### Exit criteria

A clean install resolves only the reviewed dependency graph from the committed lockfile, newly published or lower-trust packages cannot enter through routine installation, lifecycle code runs only for explicitly reviewed packages, and dependency updates arrive as auditable pull requests.

## Stage 9 — Translation provider abstraction

- [x] Define the translation-provider contract.
- [x] Implement a deterministic mock provider.
- [x] Implement the Google Cloud Translation Basic v2 provider against the documented HTTP contract without live credentials.
- [x] Add supported-language discovery to the provider contract.
- [x] Support every source and target language reported by the active provider, including localized display names and text direction metadata.
- [x] Use the provider-backed language catalog in document creation with server-side allow-list validation.
- [x] Replace native language selects with accessible searchable React Aria comboboxes localized to the interface locale.
- [x] Keep the four-language Stage 5 catalog as the deterministic fallback for local development and the mock provider.
- [x] Select the provider through environment configuration, defaulting to `mock`.
- [x] Keep provider credentials server-side and send the Google API key through `X-goog-api-key` rather than the URL.
- [x] Add input validation, a 5,000-code-point limit, a 10-second timeout, no automatic retry, and controlled error mapping.

### Exit criteria

Feature code can request translations and supported languages without knowing which provider is active. Document creation uses the active provider catalog through localized searchable controls and validates the selected codes again on the server. The mock provider is operational without external services, and the dormant Google adapter conforms to mocked Basic v2 HTTP contracts. Live Google Cloud configuration remains explicitly unverified until Stage 14.

## Stage 10 — Reader translation and short-lived cache

- [x] Add a server action or route handler for translation.
- [x] Resolve source and target languages on the server from the stored document or sample; reader requests must not accept client-provided language overrides.
- [x] Generate a cache key from normalized text, languages, and provider.
- [x] Add a short-lived in-memory cache.
- [x] Translate an explicitly submitted native selection as a word or arbitrary fragment without making prose interactive.
- [x] Add an accessible custom-text dialog as the keyboard and screen-reader path for arbitrary fragments.
- [x] Add a separate disclosure button for each sentence and render its translation directly below the source sentence.
- [x] Allow multiple sentence translations to remain expanded independently.
- [x] Show selection translations in one dismissible responsive context card.
- [x] Add idle, loading, success, error, retry, and accessible live states.
- [x] Avoid duplicate provider requests during the cache lifetime.
- [x] Document the limits of instance-local serverless memory.

### Exit criteria

A word, arbitrary fragment, or complete sentence can be translated through an explicit accessible action. Sentence translations expand below their source text, and an immediate repeated request can reuse the cached response without creating persistent translation history.

## Stage 11 — Save vocabulary cards

- [x] Allow the user to select or activate a word.
- [x] Request or enter a word translation.
- [x] Store the document's normalized source and target languages on the card.
- [x] Capture optional `usage_context`.
- [x] Support an optional note.
- [x] Validate an optional external image URL.
- [x] Preview the image and handle broken URLs.
- [x] Show the existing card when the normalized word and language pair are already saved.
- [x] Store multiple meanings in the card's `translation` array without duplicate values.
- [x] Save or update the card under the authenticated user.
- [x] Offer `Save word` only when the translated selection matches exactly one word token; fragment and sentence translations remain temporary.

### Exit criteria

A card persists after refresh and remains inaccessible to other users.

## Stage 12 — Saved words in the reader

- [x] Load vocabulary cards matching the document's source and target languages.
- [x] Build a lookup structure keyed by language pair and normalized word.
- [ ] Highlight tokens with saved cards.
- [ ] Add hover, keyboard focus, click, and mobile tap interactions.
- [ ] Show the matching card in a popover.
- [ ] Update reader state after saving without a full reload.
- [ ] Keep saved-word controls separate from sentence disclosure controls and preserve native selection around them.

### Exit criteria

Saved words are visible and accessible in the reader across mouse, keyboard, and touch interaction models.

## Stage 13 — Vocabulary dashboard

- [ ] List vocabulary cards.
- [ ] Add search.
- [ ] Display and filter cards by language pair.
- [ ] Edit and delete cards.
- [ ] Show image fallbacks.

### Exit criteria

Vocabulary cards can be managed independently of the reader.

## Stage 14 — Production behavior and accessibility

- [ ] Add an `Edit` link to personal document cards and implement a prefilled document editing flow with the same validation and ownership checks as creation.
- [ ] Configure Cloud Translation Basic v2, billing, quotas, abuse protection, and a server-side API key restricted to the Translation API before enabling the Google provider.
- [ ] Run live smoke tests for Google translation and supported-language discovery locally and on Vercel without recording credentials or provider payloads in logs.
- [ ] Verify rate-limit, timeout, quota, and sanitized-logging behavior against the live Google integration.
- [ ] Reuse the Stage 9 provider-backed language combobox and validation in the document editing flow; the reader continues using the pair stored on the document or sample.
- [ ] Decide whether production should remain on the safe mock provider or enable Google based on cost controls and observed behavior.
- [ ] Add route-level error and not-found states.
- [ ] Handle expired authentication.
- [ ] Handle provider timeouts and rate limits.
- [ ] Add a shared accessible client-side toast system for transient action feedback using the already installed React Aria Components rather than adding another notification library.
- [ ] Hide React Aria toast primitives and the queue behind a local typed notification adapter such as `toast.success()`, `toast.error()`, and `toast.info()`; feature code must not import `UNSTABLE_Toast*` directly.
- [ ] Before implementation, upgrade or verify React Aria Components and prefer stable Toast exports when available; if the installed API is still `UNSTABLE_*`, contain that compatibility risk inside the notification adapter.
- [ ] Define a typed serializable Server Action result that carries safe `AppErrorPayload` values to the initiating client without exposing technical causes.
- [ ] Integrate toasts only for actions without a natural inline feedback surface, starting with failed theme persistence and other established background interactions.
- [ ] Keep field, form, dialog, and route errors in their owning UI instead of duplicating or replacing them with toasts.
- [ ] Audit keyboard navigation and focus visibility.
- [ ] Audit contrast in light and dark themes.
- [ ] Verify responsive behavior.
- [ ] Add safe optimistic updates where appropriate.

### Exit criteria

Personal documents can be edited safely, expected failures do not break the demo, transient action feedback is announced accessibly without exposing internal errors, and all primary flows are keyboard accessible.

## Stage 15 — Testing

- [ ] Unit-test text processing, URL validation, cache keys, and vocabulary normalization.
- [ ] Integration-test document and vocabulary operations.
- [ ] Verify authorization boundaries.
- [ ] Integration-test public sample reads and denied public mutations.
- [ ] Test that anonymous demo accounts cannot access each other's vocabulary.
- [ ] Add an end-to-end happy path: login, create document, translate sentence, save word, open vocabulary.
- [ ] Add end-to-end error cases for broken images and failed translation.

### Exit criteria

The core user journey and the most important security boundaries are covered by automated tests.

## Stage 16 — Stable database delivery

- [ ] Keep migrations versioned and validated in CI.
- [ ] Add a manual GitHub Actions workflow for remote migration deployment.
- [ ] Store Supabase deployment credentials in GitHub Secrets.
- [ ] Avoid fully automatic production migrations until schema changes are predictable.

### Exit criteria

Application deployment is automatic and database deployment is explicit, repeatable, and auditable.

## Stage 17 — Portfolio packaging

- [ ] Add live demo and Figma links.
- [ ] Add screenshots or short product media.
- [ ] Document local setup from an empty machine.
- [ ] Add architecture and database diagrams.
- [ ] Document known limitations.
- [ ] Review commit and pull-request history for clarity.
- [ ] Explain AI-assisted development and manual verification.

### Exit criteria

A reviewer can understand the product, architecture, trade-offs, security model, and engineering process without additional explanation.

## Stage 18 — Structured long documents and reading progress

- [ ] Separate document metadata from document body storage.
- [ ] Add ordered `document_sections` owned through their parent document.
- [ ] Migrate existing document content into an initial section without data loss.
- [ ] Split long text at stable paragraph or sentence boundaries instead of fixed character offsets.
- [ ] Load sections incrementally with keyset pagination rather than returning the entire document.
- [ ] Keep section identifiers and ordering stable across ordinary reads.
- [ ] Add per-user reading progress using a section identifier and an offset within that section.
- [ ] Restore the last saved position after refresh and across devices.
- [ ] Add RLS, constraints, indexes, and integration tests for sections and reading progress.
- [ ] Revisit the Stage 5 content limit based on measured parsing, rendering, and storage behavior.

### Exit criteria

A long document can be opened without loading its full content, navigation continues across ordered sections, and an authenticated reader resumes from a persisted position.

## Stage 19 — File and book import pipeline

- [ ] Define the supported import formats, starting with plain text and then EPUB; keep PDF and OCR out of the initial scope.
- [ ] Add a private Supabase Storage bucket with ownership policies for source files.
- [ ] Upload files directly to Storage and validate size, content type, and detected file format.
- [ ] Track document import states such as `uploaded`, `processing`, `ready`, and `failed`.
- [ ] Implement a bounded synchronous path for small plain-text files.
- [ ] Add idempotent background processing with retries for large files and EPUB books.
- [ ] Extract EPUB chapters and convert imported content into ordered document sections.
- [ ] Preserve paragraph boundaries and reject malformed or unsupported files safely.
- [ ] Surface processing progress and recoverable failures without exposing technical details.
- [ ] Delete source files and derived sections when their document is deleted.
- [ ] Test ownership isolation, duplicate job delivery, retry behavior, cleanup, and representative large imports.
- [ ] Document operational limits, background-worker deployment, and recovery procedures.

### Exit criteria

An authenticated user can upload a supported book, leave while it is processed, return to a clear ready or failed state, and read the result incrementally without accessing another user's files or derived content.

## Recommended pull request sequence

1. Project foundation
2. CI and Vercel setup
3. Supabase schema and RLS
4. Authentication
5. Documents CRUD
6. Reader text processing
7. Interface internationalization
8. Dependency supply-chain security
9. Translation-provider abstraction
10. Reader translation and cache
11. Vocabulary-card creation
12. Saved-word reader states
13. Vocabulary dashboard
14. Production behavior and accessibility
15. End-to-end tests
16. Stable database delivery
17. Portfolio documentation
18. Structured long documents and reading progress
19. File and book import pipeline

## Working rule

Do not begin a later stage merely because its UI is attractive. Complete the exit criteria and required tests for the current dependency first.
