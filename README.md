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

# Supabase Setup Guide

This guide will help you install Supabase CLI, configure your environment, apply migrations, and create new tables for your project.

---

## 🚀 Prerequisites

- Node.js v18 or higher
- PostgreSQL installed (for local shadow DB if needed)
- Git (optional)
- Supabase CLI installed

---

## 📆 Install Supabase CLI

Install globally via npm:

```bash
npm install -g supabase
```

Alternatively, you can install using Homebrew (Mac):

```bash
brew install supabase/tap/supabase
```

Or download the latest binary from the official repo:
🔗 https://github.com/supabase/cli/releases

---

## ⚙️ Environment Setup

1. Copy the `.env.example` file:

```bash
cp .env.example .env
```

2. Open `.env` and fill in your Supabase project credentials.

You can find them in your Supabase dashboard:
🔗 https://supabase.com/dashboard/project/vmkvcvrmtwfiwsebywhw/settings/api

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (optional, if used)
SUPABASE_ACCESS_TOKEN=your-personal-access-token
```

You can generate your **Supabase Access Token** here:
🔗 https://supabase.com/account/tokens

Then, export it in your terminal before running Supabase CLI commands:

```bash
export SUPABASE_ACCESS_TOKEN=your-personal-access-token
```

---

## 🔧 Initialize and Start Supabase Project

From the root of your backend project, run:

```bash
npx supabase init
npx supabase start
```

This sets up a local Supabase environment.

---

## 🔐 Login and Link Supabase Project

First, log into Supabase CLI:

```bash
npx supabase login
```

Then, verify your project connection:

```bash
npx supabase projects list
```

Link your local project to your remote Supabase Cloud project using your project ref:

```bash
npx supabase link --project-ref vniumtsworxfxojbdbdl
```

You can find the project ref in your Supabase dashboard URL:
Example: `https://supabase.com/dashboard/project/vniumtsworxfxojbdbdl` → Project ref is `vniumtsworxfxojbdbdl`

---

## 🔄 Pull Remote Schema

If your Supabase Cloud project already has a schema and you want to sync it locally:

```bash
npx supabase db pull
```

This will download the current schema into your local environment.

---

## 🧱 Run Database Migration

If you need to create a migration:

```bash
npx supabase migration new create_games_and_booked_games_tables
```

Then edit the newly created `.sql` file under `supabase/migrations` and add your table schemas.

To apply the migration:

```bash
npx supabase db push
```

You can now view the updated schema in your Supabase dashboard.

---

## 📚 More Info

- Supabase Docs: https://supabase.com/docs
- Supabase CLI Guide: https://supabase.com/docs/guides/cli

---

Feel free to customize this README for your specific project structure and backend setup.
