# Worship Scheduler Web App

React 18, TypeScript, Vite, and Tailwind frontend for worship schedules,
workers, meetings, requests, lineups, and notifications.

## Local setup

Requires Node.js 20+. Copy `.env.example` to `.env.local`, then run:

```bash
npm ci
npm run dev
```

Authentication uses short-lived access tokens held in memory and a rotating
HttpOnly refresh cookie. Existing local-storage sessions are read only for a
one-time migration and are removed as soon as a new session is received.

## Verification

```bash
npm run lint
npm test
npm run build
```

Vitest and Testing Library cover browser behavior and utilities. GitHub Actions
runs all three checks for pushes and pull requests.

Route-level code splitting keeps the initial application bundle small. Main
editor dialogs support initial focus, focus trapping, Escape-to-close, and
focus restoration.
