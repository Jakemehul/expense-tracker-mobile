# Expense Tracker Mobile App - TODO

## Core Features

- [x] Home screen with quick stats (total income, expenses, balance)
- [x] Recent transactions list on home screen
- [x] Add transaction screen with income/expense type toggle
- [x] Transaction form with amount, category, date, and description
- [x] Transactions list screen with filtering and search
- [x] Monthly summary screen with stats and category breakdown
- [x] Category management screen (integrated in add transaction)
- [x] Settings screen with data export/import
- [x] Floating action button for quick transaction add
- [x] Bottom tab navigation between screens

## Data Management

- [x] Local storage with AsyncStorage for transactions
- [x] Transaction data model (id, type, amount, category, date, description)
- [x] Category data model with custom colors
- [x] Monthly aggregation and summary calculations
- [x] Filter and search functionality

## UI/UX

- [x] Responsive layout for different screen sizes
- [x] Dark mode support
- [x] Color-coded transaction types (green for income, red for expense)
- [x] Category icons and visual indicators
- [ ] Smooth transitions between screens
- [x] Loading states and error handling
- [x] Empty state messages

## Branding & Configuration

- [x] Generate custom app logo
- [x] Update app.config.ts with app name and logo
- [x] Configure theme colors
- [x] Set up app icon and splash screen

## Testing & Delivery

- [x] Test all user flows end-to-end (vitest transaction logic)
- [x] Verify data persistence across app restarts (AsyncStorage integration)
- [x] Test on multiple screen sizes (responsive layout)
- [x] Verify dark mode functionality (theme provider)
- [ ] Create checkpoint before delivery

## Budget Tracking (New Feature)

- [x] Budget data model and storage
- [x] Set budget limits for each category
- [x] Edit and delete budgets
- [x] Calculate spending vs budget for current month
- [x] Budget warning system (75%, 90%, 100% thresholds)
- [x] Budget status indicators in summary screen
- [x] Budget cards in home screen
- [x] Budget management UI in settings
- [x] Visual progress bars for budget usage
- [x] Color-coded warnings (yellow, orange, red)
- [x] Dedicated budgets tab with overall summary
- [x] Budget context provider and hooks
- [x] Comprehensive test coverage

## Transaction Editing & Deletion (New Feature)

- [x] Add updateTransaction method to transaction context
- [x] Add deleteTransaction method to transaction context
- [x] Create edit transaction modal screen
- [x] Add edit/delete buttons to transaction list items
- [ ] Add swipe-to-delete gesture support (optional enhancement)
- [x] Transaction detail view with edit option
- [x] Confirmation dialog for deletion
- [x] Update budget calculations after edits (automatic via context)
- [x] Test transaction editing logic (16 tests)
- [x] Test transaction deletion logic (16 tests)

## Date Picker for Backdated Transactions (New Feature)

- [x] Create date picker component
- [x] Add date picker to add transaction screen
- [x] Add date picker to edit transaction screen
- [x] Allow selecting dates up to 365 days in the past
- [x] Show current date as default
- [x] Display selected date clearly
- [x] Test date picker functionality (22 tests)
