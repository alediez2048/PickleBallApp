/**
 * Custom transformer for React Native CSS Interop modules
 * This transformer will replace any CSS interop imports with standardized mocks
 */

// Helper to determine if a file is a CSS interop file
const isCssInteropFile = (filename) => {
  return filename.includes('react-native-css-interop') ||
         filename.includes('@expo/stylesheets');
};

// Standard mock implementation
const createMockImplementation = () => {
  return `
    module.exports = {
      // Core API functions
      css: function() { return function() { return {}; }; },
      withStyleSheet: function(styles) { return function(component) { return component; }; },
      cssInterop: function() { return {}; },
      createTokens: function() { return {}; },
      
      // Appearance observables functions
      getColorScheme: function() { return 'light'; },
      addAppearanceListener: function() { return { remove: function() {} }; },
      removeAppearanceListener: function() {},
      addEventListener: function() { return { remove: function() {} }; },
      resetAppearanceListeners: function() {},
      
      // StyleSheet API
      StyleSheet: {
        create: function(styles) { return styles; }
      },
      
      // Native API
      resolveVariables: function() { return {}; },
      processCssProperties: function() { return {}; },
      getVariableValue: function() { return '#000000'; },
      
      // Support for direct JSX usage
      jsx: function() { return function() { return {}; }; },
    };
  `;
};

module.exports = {
  process(sourceText, sourcePath) {
    if (isCssInteropFile(sourcePath)) {
      return {
        code: createMockImplementation(),
      };
    }
    return {
      code: sourceText,
    };
  },
}; 