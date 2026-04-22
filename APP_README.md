# Expense Tracker Mobile App

A modern, user-friendly personal finance app built with React Native and Expo that helps you track income and expenses with ease.

## Features

### Core Functionality

- **Income & Expense Logging**: Quickly log transactions with type (income/expense), amount, category, and optional description
- **Smart Categorization**: Pre-configured categories for common transaction types with custom icons and colors
- **Monthly Summary**: Visual breakdown of your finances by month with category-wise expense analysis
- **Transaction History**: Complete list of all transactions with search and filtering capabilities
- **Local Data Storage**: All data is stored securely on your device using AsyncStorage

### User Interface

- **Responsive Design**: Optimized for mobile devices with portrait orientation and one-handed usage
- **Dark Mode Support**: Automatic theme switching based on device settings
- **Intuitive Navigation**: Bottom tab bar for easy access to Home, Transactions, Summary, and Settings
- **Real-time Updates**: Instant reflection of changes across all screens
- **Empty States**: Helpful messages when no data is available

## Screens

### 1. Home Screen
- Quick stats showing current month's income, expenses, and net balance
- Recent transactions list (last 5 transactions)
- Floating action button for quick transaction addition
- "View All" link to access full transaction list

### 2. Transactions Screen
- Complete list of all transactions sorted by date
- Search functionality to find transactions by description
- Filter options: All, Income, Expense
- Color-coded amounts (green for income, red for expense)
- Category icons for quick visual identification

### 3. Monthly Summary Screen
- Month navigation to view any month's data
- Summary cards for total income, expenses, and net balance
- Category-wise breakdown with visual progress bars
- Percentage distribution of expenses by category
- Color-coded categories for easy identification

### 4. Add Transaction Screen
- Toggle between Income and Expense types
- Amount input with currency formatting
- Category selection with modal picker
- Date selection (defaults to today)
- Optional description field
- Save and Cancel buttons

### 5. Settings Screen
- App version and total transaction count
- Data export functionality (CSV format)
- Clear all data option with confirmation
- Transaction statistics (total, income, expense counts)
- App information and privacy notice

## Data Structure

### Transaction
```typescript
{
  id: string;              // Unique identifier
  type: "income" | "expense";
  amount: number;          // Transaction amount
  category: string;        // Category ID
  date: Date;             // Transaction date
  description: string;    // Optional notes
  createdAt: Date;        // Creation timestamp
}
```

### Category
```typescript
{
  id: string;
  name: string;           // Display name
  icon: string;           // Emoji icon
  color: string;          // Hex color code
  type: "income" | "expense" | "both";
}
```

## Default Categories

### Expense Categories
- Food & Dining (🍔)
- Transport (🚗)
- Utilities (💡)
- Entertainment (🎬)
- Shopping (🛍️)
- Health & Fitness (💪)
- Other (📌)

### Income Categories
- Salary (💰)
- Freelance (💻)
- Other Income (⭐)

## Color Scheme

- **Primary**: #0a7ea4 (Teal Blue) - Buttons and highlights
- **Income**: #22C55E (Green) - Income transactions
- **Expense**: #EF4444 (Red) - Expense transactions
- **Background**: #ffffff (Light) / #151718 (Dark)
- **Surface**: #f5f5f5 (Light) / #1e2022 (Dark)

## Technical Stack

- **Framework**: React Native 0.81 with Expo 54
- **Language**: TypeScript 5.9
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: React Context + AsyncStorage
- **Navigation**: Expo Router 6
- **Testing**: Vitest

## Getting Started

### Installation

1. Clone the project
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open the app in Expo Go on your device or in a web browser

### Development

- Edit screens in `app/(tabs)/` directory
- Modify transaction logic in `lib/transaction-context.tsx`
- Update styles in `tailwind.config.js` and `theme.config.js`
- Add new categories in `lib/types.ts`

## Data Persistence

All transaction data is stored locally using React Native's AsyncStorage. Data persists across app sessions and is not synced to any server. To backup your data, use the Export feature in Settings.

## Privacy & Security

- All data is stored locally on your device
- No data is sent to external servers
- No user tracking or analytics
- Complete control over your financial information

## Testing

Run the test suite:
```bash
pnpm test
```

Tests cover:
- Monthly stats calculations
- Category breakdown logic
- Transaction filtering
- Data validation

## Future Enhancements

Potential features for future versions:
- Budget setting and tracking
- Recurring transaction templates
- Multi-currency support
- Data backup to cloud storage
- Transaction attachments (receipts)
- Advanced analytics and reports
- Custom date ranges for analysis
- Transaction tags and notes
- Expense splitting between categories

## Troubleshooting

### Transactions not saving
- Check if AsyncStorage is properly initialized
- Ensure the app has storage permissions
- Try clearing app cache and restarting

### Dark mode not working
- Verify device settings allow app to follow system theme
- Check theme provider is properly wrapped in app layout

### Calculations incorrect
- Ensure transaction dates are set correctly
- Verify all amounts are positive numbers
- Check category assignments are correct

## Support

For issues or feature requests, please refer to the app's Settings screen for more information.

## License

Personal use only. All rights reserved.
