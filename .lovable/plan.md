

# SMC Trading Bot Configurator — Full Build Plan

## Design & Theme
- **Dark theme** as default with deep navy/charcoal backgrounds
- Neon green/cyan accents for buy-side elements, red/orange for sell-side
- TradingView-inspired aesthetic throughout
- Smooth animations and transitions between pages and steps
- Dark/Light theme toggle in settings
- Fully mobile responsive

## Layout & Navigation
- **Sidebar navigation** with icons (Lucide) for: Dashboard, Strategy Builder, My Strategies, Backtest (placeholder), Settings
- Collapsible sidebar with mini-icon mode
- Active route highlighting

## Pages

### 1. Dashboard
- Summary cards: total strategies, active strategies, win rate (placeholder), recent activity
- List of recently created/modified strategies with quick actions
- Placeholder chart area for future performance metrics (using Recharts)

### 2. Strategy Builder (Multi-Step Form)
A 5-step wizard with progress indicator:

**Step 1 — Basic Info:** Strategy name, description, market type (Forex/Crypto/Stocks), searchable trading pair dropdown, multi-select timeframes (primary + confirmation)

**Step 2 — Entry Conditions:** Add/remove condition cards from all 11 SMC concept types:
- Liquidity Sweep, Order Block, Fair Value Gap, Break of Structure, Change of Character, Market Structure Shift, Supply/Demand Zone, Equal Highs/Lows, Optimal Trade Entry (Fibonacci), Session Filter, Indicator Confluence
- Each card is collapsible/expandable with its own configuration fields
- AND/OR logic toggle between conditions
- Drag-and-drop reordering of condition cards
- **Visual summary** showing the entry logic as a readable flow sentence (e.g., "IF Liquidity Sweep (sell-side) AND Price taps Bullish OB AND Session = London → ENTER LONG")

**Step 3 — Exit Rules:** Stop loss options (fixed, OB-based, swing-based, ATR-based), take profit options (fixed, R:R ratio, opposite liquidity, partial TP), trailing stop config, break-even trigger

**Step 4 — Risk Management:** Risk per trade %, max concurrent trades, daily loss limit, max drawdown, auto position size calculator

**Step 5 — Review & Save:** Full strategy summary in card layout, save to database, export as JSON, activate/deactivate toggle

### 3. My Strategies
- Card/table view of all saved strategies
- Each entry shows: name, market, status (active/inactive toggle), entry conditions summary
- Actions: edit (opens Strategy Builder), duplicate, delete
- Search and filter capabilities

### 4. Strategy Templates
- Pre-built SMC strategies: "London Killzone OB + FVG", "Liquidity Sweep Reversal", "BOS + OTE Sniper Entry", and more
- One-click clone to customize in the Strategy Builder

### 5. Backtest Page (Placeholder)
- Placeholder UI showing where backtesting results will appear
- Mock layout for future integration

### 6. Settings
- Placeholder for API key input (exchange connection)
- Default risk settings
- Notification preferences
- Theme toggle (dark/light)

## Backend (Supabase)
- **Authentication:** Email + Google OAuth sign-in
- **Database tables:**
  - `profiles` — user profile data linked to auth
  - `user_roles` — role management (admin/user)
  - `strategies` — stores full strategy config as JSON, with name, status, market type, timestamps
  - `strategy_templates` — pre-built template strategies
  - `backtest_results` — placeholder table for future use
- **Row Level Security** on all tables so users only access their own data
- **Edge functions** for any server-side logic needed

## Key UX Details
- Toast notifications for save, delete, duplicate actions
- Form validation using React Hook Form + Zod throughout the builder
- Drag-and-drop via dnd-kit for entry condition reordering
- Collapsible condition cards with smooth expand/collapse animations
- Strategy logic rendered as a visual flow/diagram summary

