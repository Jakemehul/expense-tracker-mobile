# Expense Tracker Mobile App - Interface Design

## Screen List

1. **Home Screen** - Dashboard with recent transactions and quick summary
2. **Add Transaction Screen** - Form to log income or expense with category
3. **Transactions List Screen** - View all transactions with filtering options
4. **Monthly Summary Screen** - Visual breakdown of income/expenses by category
5. **Categories Screen** - Manage and customize transaction categories
6. **Settings Screen** - App preferences and data management

## Primary Content and Functionality

### Home Screen
- **Quick Stats Card**: Display current month's total income, total expenses, and net balance
- **Recent Transactions List**: Show last 5-10 transactions with date, category, amount, and type (income/expense)
- **Quick Add Button**: Floating action button to add new transaction
- **Navigation Tabs**: Bottom tab bar for easy access to main sections

### Add Transaction Screen
- **Transaction Type Toggle**: Switch between "Income" and "Expense"
- **Amount Input**: Numeric field for transaction amount
- **Category Dropdown**: Select from predefined categories (Food, Transport, Salary, etc.)
- **Date Picker**: Select transaction date (defaults to today)
- **Description Field**: Optional notes about the transaction
- **Save Button**: Submit and return to home screen

### Transactions List Screen
- **Filter Options**: Filter by date range, category, or transaction type
- **Transaction Items**: Each item shows date, category icon, description, amount (color-coded: green for income, red for expense)
- **Swipe Actions**: Swipe to delete or edit transactions (optional)
- **Search Bar**: Quick search by description or category

### Monthly Summary Screen
- **Month Selector**: Navigate between months
- **Summary Cards**: Total income, total expenses, net savings for the selected month
- **Category Breakdown Chart**: Pie or bar chart showing expense distribution by category
- **Category List**: Detailed breakdown with amounts and percentages for each category
- **Income vs Expense Comparison**: Visual comparison of income vs expenses

### Categories Screen
- **Category List**: Display all available categories with color indicators
- **Add Category Button**: Create custom categories
- **Edit/Delete Options**: Modify or remove categories
- **Category Details**: Show total spent/earned in each category

### Settings Screen
- **Data Export**: Export transactions as CSV
- **Data Import**: Import transactions from CSV
- **Clear Data**: Option to reset all transactions
- **Theme Toggle**: Switch between light and dark mode
- **About**: App version and information

## Key User Flows

### Flow 1: Adding an Expense
1. User taps "+" button on Home Screen
2. Add Transaction Screen opens
3. User selects "Expense" type
4. User enters amount (e.g., 50)
5. User selects category (e.g., "Food")
6. User optionally adds description
7. User taps "Save"
8. Transaction is saved and Home Screen updates with new entry

### Flow 2: Viewing Monthly Summary
1. User navigates to Monthly Summary tab
2. Summary screen displays current month's stats
3. User can swipe left/right to view previous/next months
4. User taps on a category in the chart to see detailed breakdown
5. User can export the summary

### Flow 3: Managing Transactions
1. User navigates to Transactions List
2. User can filter by date range or category
3. User can search for specific transactions
4. User can tap a transaction to edit or swipe to delete
5. Changes are saved immediately

## Color Choices

- **Primary Color**: #0a7ea4 (Teal Blue) - Used for buttons, highlights, and active states
- **Income Color**: #22C55E (Green) - Represents money coming in
- **Expense Color**: #EF4444 (Red) - Represents money going out
- **Background**: #ffffff (Light) / #151718 (Dark) - Main app background
- **Surface**: #f5f5f5 (Light) / #1e2022 (Dark) - Cards and elevated surfaces
- **Text Primary**: #11181C (Light) / #ECEDEE (Dark) - Main text
- **Text Secondary**: #687076 (Light) / #9BA1A6 (Dark) - Secondary text and labels
- **Border**: #E5E7EB (Light) / #334155 (Dark) - Dividers and borders

## Category Icons & Colors

- **Food & Dining**: 🍔 #FF6B6B (Red)
- **Transport**: 🚗 #4ECDC4 (Teal)
- **Utilities**: 💡 #FFE66D (Yellow)
- **Entertainment**: 🎬 #A8E6CF (Green)
- **Shopping**: 🛍️ #FF8B94 (Pink)
- **Health & Fitness**: 💪 #C7CEEA (Purple)
- **Salary**: 💰 #22C55E (Green)
- **Freelance**: 💻 #60A5FA (Blue)
- **Other Income**: ⭐ #FBBF24 (Amber)
- **Other**: 📌 #9BA1A6 (Gray)
