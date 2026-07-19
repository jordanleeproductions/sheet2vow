# Sheet2Vow Technical Specification

## 1. Introduction
Sheet2Vow is a localized wedding management dashboard that allows users to track guests, budget, tasks, vendors, and schedules. It provides role-based access (Admin vs. Guest) to restrict sensitive planning modules.

## 2. Features & Modules
### 2.1 Navigation & Shell
- **Role Toggle:** Users log in as Admin via a passcode (`Emery2026`). Guests have a restricted view (e.g., only seeing the Schedule/Itinerary and Music).
- **Responsive Navigation:** Bottom tab bar for mobile, top header for desktop. Active states are clearly demarcated via color contrast.

### 2.2 Dashboard
- **Overview:** Provides a high-level summary of tasks, budget spent vs. remaining, and recent RSVP updates.
- **Layout:** Implements a responsive CSS Grid that stacks on mobile and expands into columns on desktop.

### 2.3 Guest List
- **Functionality:** Tracks RSVPs, dietary requirements, and plus-ones.
- **Data Structure:** Interacts with `/api/guests`.

### 2.4 Budget
- **Functionality:** Tracks expenses, categories, and payment statuses.
- **UI:** Features a Card/Table view toggle to handle complex ledger data on small screens.

### 2.5 Tasks
- **Functionality:** Kanban-style or list-style task management.
- **Filtering:** Users can filter tasks by status (e.g., To Do, In Progress, Done).

### 2.6 Vendors
- **Functionality:** Directory of hired vendors (caterers, photographers, etc.) with contact details and contract statuses.

### 2.7 Schedule & Itinerary
- **Functionality:** Timeline of events for the wedding day(s). Visible to both Admins and Guests.

### 2.8 Music
- **Functionality:** Song requests and playlist management.

## 3. Data Flow
1. **Initialization:** On load, `src/app/page.js` checks `localStorage` for the auth token.
2. **Hydration:** Based on the selected tab and auth role, the corresponding module is dynamically imported.
3. **Data Fetching:** The module fires a `useEffect` hook to fetch data from its respective `/api/` endpoint.
4. **Rendering:** Data is rendered using the centralized UI components and CSS variables defined in `globals.css`.

## 4. Security
- **Authentication:** Extremely lightweight. Not suitable for highly sensitive PII beyond basic wedding planning, as the passcode is client-side validated and data is easily accessible if the endpoints are known.

## 5. Future Enhancements
- Migration to a robust database (e.g., PostgreSQL or Firebase) instead of local JSON/CSV.
- True JWT-based authentication via NextAuth.js.
- PWA (Progressive Web App) support for offline capabilities and app-like installation on mobile.
