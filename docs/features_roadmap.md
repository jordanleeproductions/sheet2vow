# Sheet2Vow Features and Roadmap

## Implemented Features

### 1. Guest Registry (`GuestListManager`)
- **View Switcher:** Navigate seamlessly between Grid, Seating, and Party Group views.
- **Grouping & Summaries:** Organized view of Table and Party groupings with automatic headcount summaries.
- **Export & Print:** Native support for interactive CSV exports and clean Print/PDF layouts.

### 2. Day-Of Schedule (`TimelineManager`)
- **"UP NEXT" Banner:** Featured banner highlighting the immediate next event with integrated navigation controls.
- **Search & Filtering:** Real-time search combined with role-based filtering (e.g., *Catering*, *Photography*).
- **Intelligent Late-Night Handling:** Automatic detection for late-night events (12:00 AM – 4:00 AM) including a confirmation UI prompt to ensure accurate date-tracking and chronological sorting (displays `🌙 +1 DAY` badge).
- **Export & Print:** Native support for interactive CSV exports and clean Print/PDF layouts.

### 3. Global Enhancements
- **Print Styles:** Optimized `@media print` rules implemented to hide UI chrome and ensure clean paper exports across the app.

---

## Roadmap

### Up Next
1. **Budget Ledger Tracking (`BudgetLedgerManager`)**
   - Track estimated vs. actual costs.
   - Categorize expenses and monitor payment schedules.
   
2. **Quick Preset Packs**
   - Provide templates for common wedding timelines and budget breakdowns to speed up onboarding.

### Future Enhancements
| Feature | Description |
|---|---|
| Vendor Management Expansion | Finalize Vendor directory views, contact cards, and contract linking. |
| UI/UX Aesthetics | Continue refinement of modern visual aesthetics and micro-animations. |
| Advanced Syncing | Improve resilience and error handling for the two-way sync with Google Sheets. |
| Google Auth Integration | Add Google authentication to allow users to sync data to their Google Drive. |
| Template Google Sheet | Keep a template Google Sheet in the repo for schema auditing and synchronization. |
### Suggested Micro‑Animations

| Animation | Where to Use | Description |
|---|---|---|
| **Fade‑In on Load** | Page & component entrance | Softly fades elements into view, creating a gentle entry experience. |
| **Slide‑Up Staggered List** | Guest list, timeline events | Items appear sequentially from bottom to top, emphasizing order and improving readability. |
| **Hover Scale + Shadow** | Buttons, cards, vendor tiles | Slight scaling (1.05×) and shadow on hover to indicate interactivity. |
| **Ripple Click Effect** | Action buttons (Add Guest, Save, Export) | Material‑style ripple providing tactile feedback. |
| **Badge Pulse** | Late‑night "🌙 +1 DAY" badge | Subtle pulse to draw attention to special‑time events without being obtrusive. |
| **Progress Bar Fill** | CSV export / sync operations | Animated fill indicating progress, enhancing perceived performance. |
| **Slide‑In Modal** | Edit dialogs, auth login | Modal slides from the right with a dimmed backdrop, keeping context. |
| **Icon Spin on Refresh** | Data sync button | Small spin animation signaling refresh action. |
| **Toast Slide‑Down** | Success / error notifications | Toast slides down from top, stays briefly, then fades out. |

These micro‑animations are lightweight, CSS‑only (or with minimal JS) and align with the modern premium aesthetic we’re targeting. Implement them using `@keyframes` in `globals.css` and apply via utility classes for consistency.
