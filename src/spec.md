# Specification

## Summary
**Goal:** Build SkillSwap, a skill-sharing video platform where authenticated users can upload and watch videos using a points system, with profiles and watch history.

**Planned changes:**
- Add Internet Identity sign-in/sign-out and create/load a persistent user profile with an initial 100-point balance on first login.
- Implement backend stable-storage models and APIs for users, videos (metadata + content), and append-only watch history.
- Enforce watch points transfer: watching costs 10 points (blocked if <10), credits 10 points to the video creator, and records a timestamped watch entry; handle self-watch behavior with clear English messaging.
- Build frontend pages and routing: Home (responsive card grid, search, category filter), Upload (authenticated form + validation), Profile (authenticated dashboard with points, uploaded videos, watched history).
- Implement video playback from Home and video detail views; update balances and watch history in the UI after a successful watch without full refresh; show friendly English errors.
- Apply a clean, modern, mobile-friendly theme with consistent components and a primary palette that avoids blue/purple.
- Add minimal generated brand assets (logo + favicon) and display them in the app shell/navigation.

**User-visible outcome:** Users can sign in with Internet Identity, start with 100 points, upload and play skill videos, browse/search/filter the Home feed, watch videos while spending/earning points under enforced rules, and view their points, uploads, and watch history from their Profile page.
