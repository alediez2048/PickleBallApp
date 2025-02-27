# PickleBall App

A React Native app for booking pickleball games and managing player schedules.

## Features

- Game discovery and reservation
- Player profiles
- Payment processing
- Real-time game updates
- Location-based court finding
- Skill level matching

## Testing

We've implemented a robust testing strategy for the app. See the [TESTING.md](TESTING.md) file for details on our approach to testing React Native components.

### Key Testing Files

- Snapshot tests for components:
  - `src/components/__tests__/SimpleGameRegistration.test.tsx`
  - `src/components/__tests__/GameRegistration.test.tsx`
  - `src/components/payment/__tests__/PaymentMethodForm.test.tsx`
  - `src/components/payment/__tests__/PaymentMethodModal.test.tsx`

- Testing utilities:
  - `src/utils/testing/renderWithoutUnmounting.ts` - Utilities to prevent unmounted test renderer errors

### Running Tests

```bash
# Run all tests
npm test

# Run specific component tests
npx jest src/components/__tests__/SimpleGameRegistration.test.tsx

# Update snapshots
npx jest -u
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npx expo start
   ```

3. Run on your preferred platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

## Project Structure

The project follows a feature-based architecture. See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed documentation.

```
PicklePass/
├── app/                    # Expo Router (File-based Routing)
├── src/                    # Source code
│   ├── components/        # React Components
│   ├── constants/        # App Constants
│   ├── hooks/           # Custom React Hooks
│   ├── services/       # External Services
│   ├── store/         # State Management
│   ├── types/        # TypeScript Types
│   └── utils/       # Utility Functions
└── assets/        # Static Assets
```

## Development

- **TypeScript**: The project uses TypeScript for type safety
- **Expo Router**: File-based routing for seamless navigation
- **Theme System**: Consistent styling with theme support
- **State Management**: Organized by features
- **Testing**: Component and integration tests

## Contributing

1. Create a feature branch from `develop`
2. Follow the project structure guidelines
3. Add necessary tests
4. Submit a pull request

## Environment Setup

1. Node.js 18 or higher
2. Expo CLI: `npm install -g expo-cli`
3. iOS Simulator or Android Emulator
4. Expo Go app for physical device testing

## Scripts

- `npm start`: Start the development server
- `npm test`: Run tests
- `npm run build`: Build for production
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier

## License

This project is private and confidential. All rights reserved.