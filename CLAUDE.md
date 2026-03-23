# GYG Challenge Hub - Claude Code Instructions

## Project Overview
React PWA for post-workshop participant engagement at Guzman y Gomez (GYG). Participants scan a QR code, register, order lunch, then complete weekly challenges over 4 weeks. Includes an admin dashboard for managing participants, challenges, lunch orders, and exports.

## Tech Stack
- **Framework**: React (Vite)
- **Hosting**: Firebase Hosting
- **Database**: Firestore (australia-southeast1)
- **Auth**: Custom (localStorage session, no Firebase Auth)
- **Fonts**: 3 embedded base64 fonts (Helvetica Neue 77 Bold Condensed, Helvetica Neue 107 Extra Black, Guzman Bold Caps)
- **Icons/Images**: All embedded as base64 WebP/SVG in App.jsx
- **PWA**: Service worker + manifest in /public

## Firebase Project
- Project ID: `gyg-challenge-hub`
- Live URL: https://gyg-challenge-hub.web.app
- Firestore region: australia-southeast1
- Plan: Spark (free)

## File Structure
```
src/
  App.jsx      - Entire UI (all components, styles, embedded images, challenge data)
  db.js        - Firestore CRUD operations (users, completions, challenges, lunchConfig, session)
  firebase.js  - Firebase config and initialization
  main.jsx     - React entry point
public/
  manifest.json, sw.js, icon-192.png, icon-512.png
firebase.json, firestore.rules, .firebaserc
functions/index.js - Cloud Functions (email reminders, requires Blaze plan)
```

## Key Architecture Decisions
- **Single-file UI**: All components live in App.jsx. This is intentional - do NOT split into separate files.
- **Base64 assets**: All images, fonts, and icons are embedded as base64 strings in App.jsx. No external image files.
- **No Firebase Auth**: Session is stored in localStorage. Users table in Firestore holds passwords directly.
- **ES module**: Uses `import`/`export` syntax throughout.

## Setup Commands
```bash
npm install
npm run build          # Verify build passes
npx vite --host        # Local dev server
```

## Deploy Commands
```bash
npm run build && firebase deploy --only hosting
firebase deploy --only firestore:rules    # If rules changed
```

## Firestore Collections
- `users` - One doc per participant (id, name, email, username, password, position, program, restaurant, batch, lunchType, lunchFilling, createdAt)
- `completions` - One doc per challenge submission (id, userId, challengeId, program, batch, submission, points, bonusClaimed, bonusApproved, bonusPoints, submittedAt)
- `config/challenges` - Challenge definitions per program
- `config/lunchConfig` - Per-program lunch menu config (enabled, types[], fillings[])

## 4 Programs
- `lse` - Leading Shift Excellence (Crew & Cooks)
- `essentials` - Leadership Essentials (Shift Leaders & Senior Cooks)
- `nextgen` - NextGen Leaders (Assistant Restaurant Managers)
- `elite` - Elite Leaders (Restaurant Managers)

## App Flow
1. **Splash** - GET STARTED / SIGN IN
2. **Register Step 1** - Name, email, username, password
3. **Register Step 2** - Position, program, restaurant (auto-generates batch code)
4. **Register Step 3** - Lunch order (burrito/bowl + filling) - skipped if lunch disabled for that program via admin config
5. **Dashboard** - Shows 4 weekly challenges, progress, points
6. **Challenge View** - Description, deliverable, tip, file upload, text submission
7. **Leaderboard** - Filterable by program and batch
8. **Profile** - User info, lunch order, logout
9. **Admin** - Tabs: Overview, Participants, Submissions, Lunch (with config + export), Challenges, Schedule

## Admin Lunch Config
Stored in Firestore at `config/lunchConfig`. Structure:
```json
{
  "lse": { "enabled": true, "types": ["burrito", "bowl"], "fillings": ["grilled_chicken", "pulled_pork"] },
  "nextgen": { "enabled": false }
}
```
- `enabled: false` = lunch screen skipped entirely for that program
- `types` array controls which meal types appear (burrito, bowl)
- `fillings` array controls which fillings appear

## Critical Rules
1. **Do NOT redesign** - Match the existing GYG design language exactly (Helvetica Neue, #FFD300 yellow, black, #f5f5f0 background, 12-14px border-radius)
2. **Do NOT split App.jsx** into multiple files
3. **Do NOT remove or modify base64 assets** unless specifically asked
4. **Always run `npx vite build`** after changes to verify the build passes before deploying
5. **Minimal changes only** - Fix what's asked, don't touch what's working
6. **No em dashes** - Use hyphens (-) instead of em dashes throughout

## Known Patterns
- State variables use short names: `st` (step), `sF` (setForm), `u` (update field), `fl` (filling), `co` (completions)
- Toast notifications: `flash("message", true/false)` - true = green/success, false = red/error
- Bottom nav: `BNav` component with home/leaderboard/profile tabs
- CSV export: Built into admin with proper escaping and BOM for Excel compatibility
- Batch codes: Auto-generated as `GYG-{PROGRAM_SHORT}-WK{WEEK}-{YEAR}` (e.g. GYG-LSE-WK12-26)
- Challenge submissions support file attachments (base64 encoded, max 20MB per file)
- Submit button shows "SUBMITTING..." state while uploading
