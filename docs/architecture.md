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
- reading curated public sample documents without a session
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

## Configuration ownership

Application configuration belongs to the feature that defines its meaning. Related public settings are exported as a single typed configuration object, while implementation constants used by only one module remain private to that module.

Data catalogs, environment configuration, and algorithm-specific patterns remain separate from feature configuration objects. A value should be extracted into a named constant only when it is reused or represents an explicit product policy that should have one source of truth.

## Interface internationalization

`next-intl` provides locale-aware routing and message formatting for the application interface. English is the canonical default locale and uses unprefixed URLs. Russian, French, Spanish, and Arabic use `/ru`, `/fr`, `/es`, and `/ar`. Locale selection follows this priority: an explicit URL prefix, the saved `NEXT_LOCALE` device cookie, browser language preferences, then English.

Interface localization and document languages are separate domains. Switching the interface locale translates navigation, forms, validation, route states, metadata, and accessibility labels; it never translates a sample or user document. The supported-language catalog and translation-provider discovery remain independent, while language display names are formatted for the active interface locale with `Intl.DisplayNames`.

The active interface locale sets `<html lang>` and its writing direction. Arabic uses RTL for the application chrome. Reader content sets its own `lang` and `dir` from the source document, so an English document remains LTR inside Arabic UI and an Arabic document remains RTL in every interface locale.

## Accessible interaction primitives

`react-aria-components` is the default foundation for complex client-side controls whose correctness depends on coordinated keyboard, focus, touch, overlay, and screen-reader behavior. Current uses include the theme and interface-language menus, searchable document-language comboboxes, the custom-text translation dialog, and sentence disclosures. Appropriate future uses include translation popovers and vocabulary search or filters.

The library owns interaction semantics: ARIA relationships, keyboard navigation, focus management, overlay dismissal and positioning, and cross-input behavior. Application code continues to own domain state, Server Actions, validation, authentication and authorization, cookies and persistence, translation selection and caching, Tailwind styling, and design tokens.

Prefer React Aria Components over its lower-level hooks. Use a hook only when the component API cannot express a required interaction. Keep native HTML for simple links, buttons, inputs, forms, and selects when native behavior is sufficient; do not wrap every element or build a universal UI kit around the library. Avoid introducing a second headless component library for the same primitives without a concrete unmet requirement.

## Action feedback and notifications

Toasts are client-side presentation, not something a Server Action renders or triggers directly. A Server Action returns a typed, serializable result; the initiating Client Component interprets that result and asks the shared toast system to display safe feedback.

```text
Client interaction
→ Server Action validates and performs the operation
→ action returns success or a public AppErrorPayload
→ Client Component updates local UI
→ client toast system announces background feedback when appropriate
```

Technical errors, stack traces, provider responses, and internal error details stay on the server. Action results reuse safe application error codes and payloads rather than passing arbitrary exception messages to the browser. Redirect-based flows may use an explicitly bounded status mechanism, but must not turn arbitrary URL values into notifications.

Toasts are reserved for results without a natural persistent location, such as saving a device preference, copying content, or completing a background action. Field validation remains next to the field, form or dialog errors remain inside their owning surface, and route failures remain route-level error states. A toast must not be the only place for information the user needs in order to recover. The shared system owns queueing, dismissal, timeout, focus-safe behavior, and accessible live announcements; feature code owns the message and the action result that caused it.

## Public demo and authentication flow

```text
Visitor opens the public demo
→ application reads a curated sample and its language pair through the anon role
→ visitor translates sentences, fragments, or words with the safe demo provider
→ an action that requires persistence prompts the visitor to sign in
```

The explicit sign-in flow remains available:

```text
User chooses Google or email/password authentication
→ Supabase redirects through /auth/callback when required
→ a durable authenticated session is established
→ user accesses private documents and vocabulary
```

Google OAuth redirect URLs must be configured for both local `127.0.0.1` and Vercel deployments.
Local development uses `http://127.0.0.1:3000` for Next.js and
`http://127.0.0.1:54321` for Supabase. `localhost` must not be mixed into local
environment variables, application redirects, or OAuth configuration.

## Translation flow

```text
User selects text or expands a sentence in a private or curated sample document
→ client sends text and only the document ID or sample slug to the translation route
→ server validates input, authorizes private access, and reloads the stored language pair
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
  readonly id: "mock" | "google";

  translate(input: {
    text: string;
    sourceLanguage: string;
    targetLanguage: string;
  }): Promise<{
    translatedText: string;
    provider: string;
  }>;

  getSupportedLanguages(input?: { displayLanguage?: string }): Promise<
    readonly {
      code: string;
      direction: "ltr" | "rtl";
      name: string;
    }[]
  >;
}
```

Initial implementations:

- `MockTranslationProvider`
- `GoogleTranslationProvider`

The active implementation is selected through `TRANSLATION_PROVIDER`.

`mock` is the default for local development, CI, and the public deployment. It
uses the deterministic four-language catalog and makes no network requests. The
Google adapter targets the documented Cloud Translation Basic v2
[`translate`](https://docs.cloud.google.com/translate/docs/reference/rest/v2/translate)
and
[`languages`](https://docs.cloud.google.com/translate/docs/reference/rest/v2/languages)
resources through native server-side `fetch`. Its API key is sent through the
`X-goog-api-key` header and never enters a URL or client bundle.

Both providers share product-level validation: nonblank input, distinct source
and target languages, a maximum of 5,000 Unicode code points, and a 10-second
timeout without automatic retry. Provider failures are mapped to internal
categories rather than exposing upstream messages. At the server/UI boundary,
those categories become safe `AppErrorCode` values and the existing error
catalog produces an `AppErrorPayload` in the active interface locale. The Google
implementation is contract-tested with mocked HTTP responses; live credentials,
billing, quotas, and production activation are deferred to Stage 14.

Supported-language discovery belongs to document creation and editing. A user
selects the source and target languages once, and their canonical codes are
stored with the document. Reader translation requests identify the document or
public sample and submit text, but do not supply or override its language pair;
the server reads that pair from the authorized stored record before calling the
provider. This keeps the reader consistent and prevents a client from bypassing
the language choices validated when the document was saved.

The document form obtains this catalog on the server and renders localized
searchable React Aria comboboxes. `Intl.DisplayNames` formats provider language
names in the active interface locale, while provider names and uppercase codes
remain fallbacks. The interface locale changes only this presentation: canonical
language codes and the document content are not translated. The Server Action
reloads the active catalog after authentication and validates both submitted
codes against it before persisting the document.

## Cache strategy

The short-lived cache exists to:

- avoid duplicate provider calls
- reduce translation cost
- remove repeated network latency
- improve responsiveness during an active reading session

The implementation keeps at most 500 entries for 60 seconds in module-local server memory. Concurrent requests for the same key share one provider promise. Vercel serverless instances do not share this memory, may be recreated at any time, and may therefore repeat a provider call that another instance already completed. The cache is an optimization rather than a correctness or persistence boundary.

A distributed cache should be introduced only if real usage proves it necessary.

## Text processing

Private documents store the original text in `documents.content`. Curated public samples store it in `sample_documents.content`.

Paragraphs, sentences, and word tokens are derived at runtime. They are not separate database entities in the MVP.

Pure functions should handle:

- paragraph splitting
- sentence splitting
- word tokenization
- word normalization

These functions should preserve punctuation and spacing required for correct rendering.

The initial reader uses `Intl.Segmenter` with the document's source language for sentence and word boundaries. Text processing runs on the server and the resulting serializable structure is passed to the interactive client component, avoiding server/browser segmentation differences during hydration.

Paragraph separators and raw token text remain available so the original content can be reconstructed exactly. Word normalization applies Unicode compatibility normalization, locale-aware lowercase conversion, canonical apostrophes, and removal of surrounding punctuation while preserving internal punctuation and diacritics.

Reader prose remains semantic selectable text: paragraphs, sentences, and tokens are identifiable text rather than controls. Native pointer or keyboard selection prepares an exact word or arbitrary fragment, but selecting text alone does not create a provider request.

Complete sentence translation uses a separate disclosure button with its result rendered directly below the source sentence. This avoids nested controls and preserves ordinary screen-reader document navigation. An accessible custom-text dialog provides the keyboard and screen-reader path for arbitrary fragments without implementing a custom range-selection widget. Word controls are introduced only for saved vocabulary and remain separate from sentence disclosure controls.

Vocabulary saving is offered only when a native selection matches one complete derived word token. The client sends the resource reference and deterministic token identifier to a Server Action, which authenticates the user, reloads the owned document or public sample, derives the token and language pair again, and then creates or updates the private card. Client-provided word text, language identifiers, and ownership are never trusted. Repeated saves merge new meanings into the existing card without duplicate localized values; optional context, note, and external HTTP(S) image metadata remain attached to the persistent card.

The System, Light, or Dark preference applies to the entire application. The root layout reads a validated `app-theme` cookie before rendering, sets `data-theme` on the document element, and supplies the initial value to the client theme provider. System mode follows `prefers-color-scheme` in CSS, so the first server-rendered frame uses the correct palette without a hydration flash. The preference is device-local and is not synchronized through the user profile.

## Security principles

- RLS is enabled for every user-owned table.
- Public sample documents are read-only to `anon` and `authenticated` roles.
- Public samples are stored separately from private user documents.
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
