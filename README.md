# SafeMed Frontend Client (PWA) 📱

This is the Progressive Web Application (PWA) client for SafeMed Nepal built with **React 19**, **Vite 8**, **Tailwind CSS v4**, and **i18next** for bilingual translation support.

---

## ✨ Key Frontend Features

### 1. Bilingual Support (EN/NE)
* Powered by `react-i18next`.
* Toggle instantly between **English** and **Nepali (नेपाली)** using the navbar language switcher.
* Language selection is persisted in `localStorage`.
* Translation keys are organized in `src/locales/en/translation.json` and `src/locales/ne/translation.json`.

### 2. Progressive Web App (PWA) Capabilities
* Fully responsive and optimized for mobile viewports.
* **Offline Caching**: Built using `vite-plugin-pwa` with custom service worker configurations. When offline, users can still search and read previously loaded remedies.
* **Add to Home Screen (A2HS)**: Supports browser installation prompts on Android, iOS, and desktop browsers.
* Includes generated standard medical PWA icons (`icon-192.png` and `icon-512.png`).

### 3. Offline Verification Queue Sync
* Reviewers can verify and submit remedy reviews even in remote locations of Nepal without cellular data.
* If the app is offline:
  * The review is captured and stored locally in the `safe-med-offline-reviews` array in `localStorage`.
  * An amber warning banner appears showing the number of pending syncs.
* When connection is recovered (`online` event listener):
  * The offline queue is automatically sent to the API server.
  * A success toast notification alerts the reviewer of the synchronization.

### 4. Admin & Reviewer Dashboard (`/admin`)
* Manage and filter remedy logs based on their approval state (`draft`, `pending`, `revision_required`, `rejected`, `published`).
* Modal overlay to create new remedies directly inside the dashboard.
* Sidebar listing recent reviews and audits for easy reference.
* Single review detail page (`/admin/remedy/:id`) showing complete control forms to approve, reject, or request revisions.

### 5. Onboarding Forms (`/about`)
* Join as a reviewer page featuring the new extended application inputs:
  * **NMC Registration Number** (Optional: accommodates alternative certificate IDs).
  * **Credential Link / Document URL** (Required: link to certificate, Google Drive, or portfolio).

---

## 🏗️ State Management & Contexts

* **`AuthContext` (`src/lib/AuthContext.jsx`)**:
  Manages login, signup, session tokens (persisted in `safemed-auth` local storage), profile updates, and role-based access checks (Staff vs Public).
* **`ToastContext` (`src/lib/ToastContext.jsx`)**:
  Global message banner system displaying custom notices for actions (success, errors, warnings, info) with sliding micro-animations.

---

## 🛠️ Styling & Design System
* Styled with **Tailwind CSS v4** (`@tailwindcss/vite` plugin).
* Features:
  * Glassmorphism highlights.
  * Premium color palettes (curated amber, emerald, and slate HSL tones).
  * Subtle hover transitions and active scales.
  * Customized horizontal scrolling scrollbar utilities for symptoms filter.

---

## ⚙️ Development Environment Variables

Create a `.env` file in `frontend/` with:

```properties
# Supabase Project Credentials
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Express API Gateway Location
VITE_API_BASE_URL=http://localhost:3001
```
