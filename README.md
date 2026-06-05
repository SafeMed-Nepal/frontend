# SafeMed Frontend

## Overview

This frontend is a Vite-powered React app with Supabase authentication and an Express backend API integration. It is built to support:
- public remedy browsing
- bilingual data display (English / Nepali)
- reviewer dashboard workflows
- offline reviewer queue sync

## Key folders

- `src/pages/` - route-based pages such as `Home`, `Admin`, `Login`, and `RemedyDetail`.
- `src/lib/` - reusable modules for API calls, auth context, offline review queue, Supabase client, and toast notifications.
- `src/components/` - UI building blocks like `Navbar`, `ProtectedRoute`, `Toast`, and `VerifiedBadge`.

## Frontend API flow

### API wrapper `src/lib/api.js`
- `getRemedies(symptom, { forAdmin })` -> `GET /api/remedies`
- `getRemedyById(id)` -> `GET /api/remedies/:id`
- `postReview(remedyId, payload)` -> `POST /api/remedies/:id/reviews`
- `getReviews(remedyId)` -> `GET /api/remedies/:id/reviews`
- `updateRemedyStatus(id, status, reviewerName)` -> `PATCH /api/remedies/:id/status`
- `createRemedy(remedy)` -> `POST /api/remedies`

### Authentication
- `src/lib/supabase.js` initializes Supabase with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- `src/lib/AuthContext.jsx` manages session state, profile loading, and exposes `signIn` / `signOut`.
- Auth state is stored in Supabase session storage.

### Page flows

`Home.jsx`
- loads remedies via `api.getRemedies()`
- supports symptom filters and client-side search over cached remedies
- links to `RemedyDetail` pages

`RemedyDetail.jsx`
- loads a single remedy via `api.getRemedyById(id)`
- falls back to offline localStorage cache if network fails
- supports saving remedy details to offline storage

`Admin.jsx`
- loads all remedies for staff with `api.getRemedies(null, { forAdmin: true })`
- loads selected remedy review counts via `api.getReviews(remedyId)`
- supports review submission with optional comments
- supports reviewer/admin actions and status updates
- maintains an offline review queue in `src/lib/offlineReviews.js`

## Offline review flow

When offline, review submissions are queued in localStorage:
- `enqueueReview()` saves review items locally
- `flushQueue()` retries when back online
- queued items are submitted via `api.postReview(remedyId, { decision, comment })`

## Network layer diagram

Browser / React App
  ├─> Supabase Auth SDK (`src/lib/supabase.js`)
  |    └─> Supabase Auth endpoints for sign-in/session
  └─> Express backend API via `src/lib/api.js`
       ├─> `GET /api/remedies`
       ├─> `GET /api/remedies/:id`
       ├─> `POST /api/remedies/:id/reviews`
       ├─> `GET /api/remedies/:id/reviews`
       ├─> `PATCH /api/remedies/:id/status`
       └─> `POST /api/remedies`

ASCII flow:

[Browser] -> [React pages] -> [api.js] -> [Backend Express API] -> [Supabase Postgres]
                                 |
                                 +-> [Supabase Auth SDK]

## Recommended UI improvement plan

The current reviewer dashboard is overcrowded. A clean redesign should be split into two main screens:
1. **Reviewer list page**
   - A compact list of remedies with status pills, counts, and search/filter controls.
   - Each remedy row opens a detail panel or navigates to a separate detail page.
2. **Review detail page**
   - Focused page for one remedy with clear sections: summary, ingredients, steps, reviewer history, and action controls.
   - Add whitespace, card groups, and separate review history from action buttons.

Suggested improvements:
- move recent review history into its own panel below the remedy summary
- replace inline count/status blocks with small chips and a clean summary card
- use a dedicated reviewer decision modal or sidebar rather than one long scroll panel
- keep action buttons grouped and visually separated from the content

## How to run

```bash
cd frontend
npm install
npm run dev
```

Environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL`

## Notes

- The frontend already supports optional reviewer comments.
- The current API wrapper uses `credentials: 'include'` to preserve cookies with the backend express server.
- The app should be refactored so admin/reviewer dashboard state is cleaner and less congested.
