# PicklePass Project Structure

## Directory Structure

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
│   │   └── _layout.tsx        # Tabs layout
│   ├── _layout.tsx            # Root layout
│   └── +not-found.tsx         # 404 page
├── src/                       # Source code
│   ├── components/           # React Components
│   │   ├── common/          # Shared Components
│   │   │   ├── buttons/     # Button components
│   │   │   ├── forms/       # Form components
│   │   │   ├── layout/      # Layout components
│   │   │   └── ui/          # UI components
│   │   ├── screens/         # Screen Components
│   │   │   ├── auth/        # Authentication screens
│   │   │   ├── home/        # Home screen components
│   │   │   ├── explore/     # Explore screen components
│   │   │   └── profile/     # Profile screen components
│   │   ├── ui/              # Shared UI elements
│   │   └── __tests__/       # Component tests
│   ├── constants/           # App Constants
│   │   ├── colors.ts       # Color definitions
│   │   ├── config.ts       # App configuration
│   │   └── theme.ts        # Theme constants
│   ├── hooks/              # Custom React Hooks
│   │   ├── useAuth.ts      # Authentication hooks
│   │   ├── useGames.ts     # Game-related hooks
│   │   └── useProfile.ts   # Profile hooks
│   ├── navigation/         # Navigation Configuration
│   │   └── types.ts        # Navigation type definitions
│   ├── services/          # External Services
│   │   ├── api/           # API clients
│   │   ├── auth/          # Auth services
│   │   └── storage/       # Local storage
│   ├── store/            # State Management
│   │   ├── auth/         # Authentication state
│   │   ├── games/        # Games state
│   │   └── index.ts      # Store configuration
│   ├── types/           # TypeScript Types
│   │   ├── api.ts       # API interfaces
│   │   ├── game.ts      # Game types
│   │   └── user.ts      # User interfaces
│   └── utils/          # Utility Functions
│       ├── formatting.ts # Data formatting
│       ├── validation.ts # Form validation
│       └── location.ts   # Location utilities
├── assets/             # Static Assets
│   ├── fonts/         # Custom fonts
│   └── images/        # Image assets
└── [Configuration]
    ├── app.json       # Expo configuration
    ├── package.json   # Dependencies
    ├── tsconfig.json  # TypeScript config
    └── babel.config.js # Babel configuration
```

## Key Directories Explained

### `app/` Directory
- Uses Expo Router for file-based routing
- Organized by features (auth, tabs)
- Each route maps to a screen component in `src/components/screens`

### `src/components/`
- **common/**: Reusable components organized by type
  - `buttons/`: Button variants and styles
  - `forms/`: Form inputs and controls
  - `layout/`: Layout containers and grids
  - `ui/`: Basic UI elements
- **screens/**: Feature-specific screen components
  - Organized by feature domain
  - Contains screen-specific logic
  - Uses components from common/
- **ui/**: Shared UI elements
- **__tests__/**: Component test files

### `src/services/`
- API integration and external services
- Authentication and authorization
- Local storage and data persistence
- Third-party service integrations

### `src/store/`
- State management implementation
- Feature-based store organization
- Actions, reducers, and selectors

### `src/hooks/`
- Custom React hooks for shared logic
- Feature-specific hooks
- Reusable functionality

### `src/navigation/`
- Navigation configuration
- Route definitions
- Navigation types

### `src/types/`
- TypeScript interfaces and types
- Organized by domain
- Shared type definitions

### `src/utils/`
- Helper functions and utilities
- Data formatting and validation
- Location and date utilities

## Best Practices

1. **Component Organization**
   - Keep components focused and single-purpose
   - Use common components for shared UI elements
   - Organize screens by feature domain

2. **State Management**
   - Use local state for component-specific data
   - Implement global state for shared data
   - Follow feature-based store organization

3. **Type Safety**
   - Define comprehensive types
   - Use strict TypeScript settings
   - Maintain type consistency

4. **Testing**
   - Co-locate tests with components
   - Write unit tests for utilities
   - Implement integration tests for features

5. **Performance**
   - Implement lazy loading
   - Optimize asset loading
   - Use proper memoization

6. **Code Style**
   - Follow ESLint configuration
   - Maintain consistent formatting
   - Write clear documentation

## Development Guidelines

1. **Adding New Features**
   - Create feature directory in appropriate location
   - Include necessary types and tests
   - Follow existing patterns

2. **Component Development**
   - Start with screen-specific components
   - Extract common patterns to shared components
   - Document props and usage

3. **State Management**
   - Begin with local state
   - Move to global state when needed
   - Document state shape and updates

4. **Testing Strategy**
   - Write tests alongside components
   - Cover critical user paths
   - Maintain test coverage

5. **Documentation**
   - Document complex logic
   - Include usage examples
   - Keep documentation updated 