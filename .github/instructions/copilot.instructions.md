---
applyTo: "**"
---

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
   - To import ThemedView, use:
     `import { ThemedView } from "@/components/common/ThemedView";`
   - To import ThemedText, use:
     `import { ThemedText } from "@/components/common/ThemedText";`

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

8. **Component Styles:**

   - All component styles must be defined at the end of the file in a `const styles = StyleSheet.create({ ... })` block for better readability and maintainability.

9. **Color Management:**
   - All color values must be defined in `src/constants/theme.ts` under the `colors` object or the `Colors` object.
   - Do not use hardcoded color values in components or styles.
   - If a new color is needed, add it to both the `light` and `dark` objects in `const Colors = { light: {}, dark: {} }` in `theme.ts`.
   - Always reference colors from the theme constants.
   - If you add or update any color, ensure it is present in both the `light` and `dark` theme objects for consistency.
