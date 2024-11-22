# Marauders Money - Personal Finance App

A comprehensive, offline-first personal finance management application built with React Native.

## Features

- **Multi-Account Management**: Track multiple financial accounts in one place
- **Budget Tracking**: Set and monitor budgets by category
- **Investment Portfolio**: Track your investments and monitor performance
- **Financial Goals**: Set and track progress towards financial goals
- **Offline-First**: All data is stored locally using RxDB
- **Cross-Platform**: Works on both iOS and Android

## Tech Stack

- **Framework**: React Native (bare configuration)
- **State Management**: React Context
- **Database**: RxDB for offline-first functionality
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: React Navigation
- **Testing**: Jest and React Native Testing Library

## Getting Started

### Prerequisites

- Node.js (>= 18)
- npm or yarn
- React Native development environment set up for iOS and Android

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/marauders-money.git
   cd marauders-money
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install iOS dependencies (macOS only):
   ```bash
   cd ios && pod install && cd ..
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Run the app:
   - For iOS (macOS only):
     ```bash
     npm run ios
     ```
   - For Android:
     ```bash
     npm run android
     ```

## Project Structure

```
src/
├── context/        # Global state management
├── database/       # RxDB configuration and schemas
├── navigation/     # Navigation configuration
├── screens/        # Main app screens
└── components/     # Reusable components
```

## Development

- **State Management**: The app uses React Context for global state management, with the main context provider in `src/context/AppContext.tsx`
- **Database**: RxDB is configured in `src/database/config.ts` with schemas for accounts, transactions, budgets, investments, and goals
- **Navigation**: The app uses a bottom tab navigator for main navigation, defined in `src/navigation/AppNavigator.tsx`
- **Styling**: All styling is done using NativeWind (Tailwind CSS) classes

## Testing

Run the test suite:
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
