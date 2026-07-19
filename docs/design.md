# Sheet2Vow UX & UI Design System

## Design Philosophy
The application utilizes a **Retro/Pixel Art** aesthetic combined with modern, responsive layouts. The goal is to provide a premium, nostalgic, yet highly functional experience. It features high-contrast borders, blocky elements, and a distinct separation between interactive components and background data.

## Typography
- **Primary Header Font:** `'Press Start 2P', cursive` - Used for main titles, module headers, and key callouts to enforce the retro theme.
- **Body Font:** `'Inter', sans-serif` - Used for readability in data tables, lists, and general body copy.
- **Alternative Fonts (Legacy/Contextual):** `Playfair Display`, `Roboto Mono`.

## Color Palette
The color scheme revolves around a soothing Sage Green contrasted with harsh blacks and whites for the retro feel.

- **Backgrounds:**
  - `var(--background)`: `#f4f4f4` (Light off-white)
  - `var(--surface)`: `#ffffff` (Pure white for cards/modules)
- **Accents (Sage):**
  - `var(--primary-sage)`: `#8CA391`
  - `var(--accent-sage)`: `#7A917F`
- **Text & Borders:**
  - `var(--text-primary)`: `#1a1a1a` (Near black)
  - `var(--text-secondary)`: `#4a4a4a` (Dark gray)
  - `var(--border-color)`: `#000000` (Solid black for pixel-art borders)
- **Status Colors:**
  - `var(--status-pending)`: Yellow/Orange hues
  - `var(--status-confirmed)`: Green hues
  - `var(--status-declined)`: Red hues

## UI Components & Patterns
- **Buttons:** Styled with sharp corners, thick black borders (`2px solid #000`), and a box-shadow that mimics a 3D pixel button. On hover, the box-shadow is reduced and the button translates down to simulate a physical press.
- **Cards & Modules:** Wrapped in solid black borders with slight box-shadows. Mobile view utilizes 100% width, while desktop scales to a max-width layout.
- **Navigation:**
  - **Mobile:** Fixed bottom navigation bar with pixel-styled icons or text, ensuring thumb-reachability. Active tabs are highlighted with a contrasting color (Sage) and bold text.
  - **Desktop:** Top-aligned header navigation.
- **Data Views:** Modules with heavy data (like Budget or Vendors) feature a toggle between **Card View** (optimized for mobile) and **Table View** (optimized for desktop).

## Responsiveness
- `globals.css` uses strict media queries (`@media (max-width: 768px)`) to shift layouts from CSS Grids to block-level stacking.
- Global `overflow-x: hidden` prevents horizontal scrolling issues on mobile devices.
