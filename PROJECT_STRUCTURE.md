# PicklePass Project Structure

```
PicklePass/
├── app/                        # Expo Router (File-based Routing)
│   ├── (auth)/                # Authentication routes
│   │   ├── login.tsx          # Login screen
│   │   ├── register.tsx       # Registration screen
│   │   └── _layout.tsx        # Auth layout
│   ├── (tabs)/                # Main app tabs
│   │   ├── index.tsx          # Home tab
│   │   ├── explore.tsx        # Game exploration
│   │   ├── create.tsx         # Create game
│   │   ├── profile.tsx        # User profile
│   │   └── _layout.tsx        # Tabs layout
│   ├── _layout.tsx            # Root layout
│   └── +not-found.tsx         # 404 page
├── src/
│   ├── components/            # React Components
│   │   ├── common/            # Shared Components
│   │   │   ├── buttons/       # Button components
│   │   │   ├── forms/         # Form components
│   │   │   ├── layout/        # Layout components
│   │   │   └── ui/            # UI components
│   │   └── screens/           # Screen Components
│   │       ├── auth/          # Auth screens
│   │       ├── home/          # Home screens
│   │       ├── explore/       # Explore screens
│   │       └── profile/       # Profile screens
│   ├── constants/             # App Constants
│   │   ├── colors.ts         # Color definitions
│   │   ├── config.ts         # App configuration
│   │   └── theme.ts          # Theme constants
│   ├── hooks/                # Custom React Hooks
│   │   ├── useAuth.ts        # Authentication hooks
│   │   ├── useGames.ts       # Game-related hooks
│   │   └── useProfile.ts     # Profile hooks
│   ├── services/             # External Services
│   │   ├── api/              # API clients
│   │   ├── auth/             # Auth services
│   │   └── storage/          # Local storage
│   ├── store/                # State Management
│   │   ├── auth/             # Auth state
│   │   ├── games/            # Games state
│   │   └── index.ts          # Store configuration
│   ├── types/                # TypeScript Types
│   │   ├── api.ts            # API types
│   │   ├── game.ts           # Game types
│   │   └── user.ts           # User types
│   └── utils/                # Utility Functions
│       ├── formatting.ts     # Data formatting
│       ├── validation.ts     # Form validation
│       └── location.ts       # Location utilities
├── assets/                   # Static Assets
│   ├── fonts/               # Custom fonts
│   └── images/              # Image assets
└── [Configuration Files]
    ├── app.json             # Expo config
    ├── package.json         # Dependencies
    ├── tsconfig.json        # TypeScript config
    └── babel.config.js      # Babel config
```

## Directory Structure Explanation

### `app/` Directory
- Uses Expo Router for file-based routing
- Organized by features (auth, tabs)
- Each route corresponds to a screen component

### `src/components/`
- **common/**: Reusable components organized by type
  - buttons/: Button variants
  - forms/: Form elements
  - layout/: Layout components
  - ui/: Basic UI elements
- **screens/**: Feature-specific screen components
  - Organized by feature area
  - Contains screen-specific logic and layout

### `src/services/`
- API integration
- Authentication services
- Local storage handling
- External service integrations

### `src/store/`
- State management (Redux/Context)
- Organized by feature domains
- Includes actions, reducers, and selectors

### `src/hooks/`
- Custom React hooks
- Feature-specific hooks
- Shared functionality hooks

### `src/utils/`
- Helper functions
- Data formatting
- Validation logic
- Location utilities

### `src/types/`
- TypeScript type definitions
- Organized by domain
- Shared interfaces

### `assets/`
- Static files
- Organized by type (fonts, images)
- Optimized for mobile

## Best Practices

1. **Component Organization**
   - Common components are highly reusable
   - Screen components are feature-specific
   - Clear separation of concerns

2. **State Management**
   - Centralized store for global state
   - Local state for component-specific data
   - Context for theme/auth state

3. **Code Organization**
   - Feature-first organization
   - Clear separation of business logic
   - Reusable utilities and hooks

4. **Type Safety**
   - Comprehensive type definitions
   - Strict TypeScript configuration
   - Type-safe API calls

5. **Testing**
   - Components have dedicated tests
   - Integration tests for features
   - E2E tests for critical flows

6. **Performance**
   - Lazy loading for routes
   - Optimized assets
   - Memoization where needed

7. **Security**
   - Secure authentication flow
   - Protected routes
   - Sanitized inputs

## Development Guidelines

1. **New Features**
   - Create in appropriate feature directory
   - Include necessary types
   - Add relevant tests

2. **Component Creation**
   - Start in screen-specific
   - Move to common if reused
   - Document props and usage

3. **State Management**
   - Use local state first
   - Move to global if needed
   - Document state shape

4. **Code Style**
   - Follow ESLint rules
   - Use Prettier formatting
   - Write clear comments 