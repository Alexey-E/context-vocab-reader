# Product Scope

## Product summary

Context Vocab Reader is a language-learning reader that helps users understand texts and build a personal vocabulary from real reading context.

The application allows a visitor to open a curated sample text without signing in. A user can also add a private text, read it in the browser, translate sentences or paragraphs on demand, and save useful words as private vocabulary cards.

## Primary user flow

```text
Open a public sample without signing in
→ open the reader
→ translate a sentence or paragraph
→ select a word
→ create an anonymous Supabase session when persistence is first needed
→ save a vocabulary card
→ open and manage saved vocabulary
```

Registered users can also sign in explicitly, create private documents, and return to their persistent vocabulary on another device.

## MVP goals

The MVP must prove the complete learning flow from reading to building a personal vocabulary from context.

### Included in MVP

- Google OAuth through Supabase Auth
- Email/password authentication fallback
- Anonymous Supabase authentication for a low-friction demo
- Curated public sample documents in three or four source languages
- User-owned documents
- Document creation by pasting text
- Documents dashboard
- Reader view
- Sentence or paragraph translation on demand
- Word translation on demand
- Vocabulary card creation
- Usage context for saved words
- Optional note on a vocabulary card
- Optional external image URL
- Highlighting of words already saved to vocabulary
- Vocabulary dashboard
- Light and dark themes
- Supabase Row Level Security
- Mock and Google translation providers
- Vercel deployment
- GitHub-based CI

## Persistent data

The following data is stored persistently:

- user profile settings
- curated public sample documents
- documents created by the user
- vocabulary cards explicitly saved by the user

## Temporary data

The following data is temporary and is not stored as permanent user content:

- sentence translations
- paragraph translations
- active reader selection
- temporary translation errors
- short-lived translation cache entries

## Vocabulary card model

A vocabulary card can contain:

- normalized word
- source language
- target language
- one or more translations
- optional usage context
- optional note
- optional external image URL

Usage context is not the source of truth for the translation. It is a sentence or fragment that helps the user remember how the word appeared in real reading.

## Explicitly excluded from MVP

- PDF, EPUB, DOCX, or advanced file import
- image uploads or Supabase Storage
- payments
- teams and shared workspaces
- user-published or user-shared documents
- public vocabulary cards, likes, and recommendations
- browser extension
- native mobile application
- offline mode
- long-term sentence translation history
- vocabulary review scheduling, review states, and review history
- spaced-repetition algorithms such as SM-2
- advanced analytics
- admin panel
- collaborative vocabulary lists

## Success criteria

The MVP is complete when a visitor can:

1. Open a curated sample without signing in.
2. Read it and request a safe demo translation.
3. Start an anonymous session when saving their first vocabulary card.
4. Access only the vocabulary created by that anonymous account.

The authenticated flow is complete when a new user can:

1. Sign in.
2. Create a text document.
3. Open it in the reader.
4. Translate a sentence or paragraph.
5. Select a word and save a vocabulary card.
6. See the saved word highlighted in the reader.
7. Open the vocabulary dashboard and manage the card.
8. Access only their own data.

## Scope rule

A feature should not be added to the MVP unless it directly supports the primary user flow or protects its reliability, security, or usability.
