# Marauders Money - Personal Finance Tracker

A modern, offline-first personal finance management application built with React Native. Track your expenses, monitor your accounts, and visualize your financial journey with beautiful charts and intuitive interfaces.

## Features

- **Dashboard Overview**: Get a quick snapshot of your financial health with monthly comparisons and summaries
- **Multi-Account Management**: Track multiple financial accounts in one place
- **Financial Analytics**: Visualize your spending patterns with interactive charts
- **Offline-First**: All data is stored locally using RxDB for privacy and instant access
- **Cross-Platform**: Seamlessly works on both iOS and Android devices
- **Modern UI**: Beautiful, responsive interface built with NativeWind

## Tech Stack

- **Core Framework**: React Native 0.76.3
- **Language**: TypeScript
- **Database**: RxDB 14.17.1 for offline-first data storage
- **State Management**: React Context API
- **UI/Styling**: 
  - NativeWind 4.1.23 (Tailwind CSS for React Native)
  - React Native Vector Icons
  - React Native Chart Kit for data visualization
- **Navigation**: React Navigation 6.x
- **Testing**: Jest and React Native Testing Library

## Getting Started

### Prerequisites

- Node.js (>= 18)
- npm or yarn
- React Native development environment set up for iOS and Android
- Xcode (for iOS development, macOS only)
- Android Studio (for Android development)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/EXTREMOPHILARUM/marauders-money.git
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
├── components/     # Reusable UI components
│   ├── charts/    # Chart components for financial visualization
│   └── common/    # Shared UI components
├── context/       # Global state management
├── database/      # RxDB configuration and schemas
├── navigation/    # Navigation configuration
├── screens/       # Main application screens
├── types/         # TypeScript type definitions
└── utils/         # Utility functions and helpers
```

## Key Components

- **DashboardScreen**: Main overview screen with financial summaries and charts
- **AccountsScreen**: Manage and view all your financial accounts
- **MonthlyComparison**: Interactive chart component for expense analysis
- **SummaryCard**: Reusable component for displaying financial metrics

## Development

### State Management
The app uses React Context for global state management, providing a simple and efficient way to share data between components.

### Database
RxDB provides a robust offline-first database solution with:
- Real-time synchronization
- Reactive queries
- Schema validation
- Type safety with TypeScript

### Styling
All styling is implemented using NativeWind (Tailwind CSS for React Native), providing:
- Consistent design system
- Responsive layouts
- Easy theme customization
- Utility-first CSS approach

## Testing

Run the test suite:
```bash
npm test
```

For development with test watching:
```bash
npm test -- --watch
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
