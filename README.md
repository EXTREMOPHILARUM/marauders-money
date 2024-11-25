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

## GitHub Actions Release

The project includes a GitHub Actions workflow that automatically builds and releases the app when you push a new version tag. Here's how to set it up:

1. Encode your keystore for GitHub secrets:
   ```bash
   npm run android:encode-keystore
   ```
   This will output your keystore and signing information in the correct format for GitHub secrets.

2. Add the following secrets to your GitHub repository:
   - `RELEASE_KEYSTORE`: The base64-encoded keystore file
   - `ANDROID_STORE_PASSWORD`: Your keystore password
   - `ANDROID_KEY_ALIAS`: Your key alias
   - `ANDROID_KEY_PASSWORD`: Your key password

   To add these secrets:
   1. Go to your repository settings
   2. Navigate to Secrets and Variables > Actions
   3. Click "New repository secret"
   4. Add each secret with its corresponding value

3. Create and push a new version tag to trigger a release:
   ```bash
   git tag v1.0.0  # Use appropriate version number
   git push origin v1.0.0
   ```

The workflow will:
- Build both APK and AAB files
- Create a new GitHub release
- Attach the built files to the release

The APK can be downloaded and installed directly on Android devices, while the AAB is for Play Store submission.

## Building Release APK

### Creating a Release Keystore

Before building a release APK, you need to create a keystore file to sign your app. This is required for publishing to the Google Play Store and for installing release builds on Android devices.

1. Run the interactive keystore creation script:
   ```bash
   npm run android:create-keystore
   ```

   The script will prompt you for:
   - Keystore password
   - Key alias (typically your app name)
   - Key password
   - Your name (CN)
   - Organizational unit (OU)
   - Organization (O)
   - City/Locality (L)
   - State/Province (ST)
   - Country code (C)

   The script will:
   - Create the keystore file at `android/app/release.keystore`
   - Generate a `.env` file with the necessary credentials
   - Display the credentials for your records

2. Keep the following information safe:
   - Keystore file (`release.keystore`)
   - Keystore password
   - Key alias
   - Key password

   **Important**: You'll need these same credentials to sign all future updates of your app. If you lose them, you won't be able to publish updates to the Play Store under the same app listing.

### Building the APK

1. Make sure your `.env` file contains the correct keystore credentials and the `release.keystore` file is in the `android/app/` directory.

2. Build the release APK using npm script:
   ```bash
   npm run android:release
   ```

   This command will:
   - Load your environment variables
   - Navigate to the Android directory
   - Build the release APK
   - Return to the project root

3. The signed APK will be generated at:
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

**Note**: Keep your `.env` file and `release.keystore` secure and never commit them to version control. The same keystore must be used for all future updates of your app.

### Additional Commands

- Clean Android build:
  ```bash
  npm run clean:android
  ```

- Create an Android App Bundle (for Play Store submission):
  ```bash
  npm run android:bundle
  ```

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
