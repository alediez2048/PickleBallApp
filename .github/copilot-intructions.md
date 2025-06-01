# Copilot Instructions for This Project

1. All code, documentation, and comments must be written in English.

   - If Spanish is detected, automatically convert it to English.

2. This project is built with:

   - Expo + React Native
   - Supabase as backend
   - Web support (React Native Web enabled)

   => If any code (e.g., DateTimePicker) does not work on web, provide a fallback or compatible alternative using platform detection.

3. Code Structure:

   - All **types** must be defined in `src/types`. Do not define them inline or outside this directory.
   - All **constants** must be defined in `src/constants`. Do not define them inline or outside this directory.
   - If a type or constant is missing, stop the process and indicate that the corresponding file must be created first.

4. Components:

   - All components must use:
     - `src/components/common/ThemedView.tsx`
     - `src/components/common/ThemedText.tsx`
   - Do not use raw `View` or `Text` unless wrapped or extended via these themed components.

5. Backend:

   - Supabase is the only backend.
   - Database access and logic must be defined in `src/services`.
   - Each service file maps to a specific table or feature connected to Supabase.

6. Styling:

   - Tailwind CSS is fully enabled and available globally.
   - Use Tailwind classes wherever appropriate for styling.

7. Path Aliases:
   - The following path aliases are available and must be used whenever possible for imports:
     - `@/*` → `src/*`
     - `@components/*` → `src/components/*`
     - `@hooks/*` → `src/hooks/*`
     - `@services/*` → `src/services/*`
     - `@contexts/*` → `src/contexts/*`
     - `@constants/*` → `src/constants/*`
     - `@types/*` → `src/types/*`
     - `@utils/*` → `src/utils/*`
