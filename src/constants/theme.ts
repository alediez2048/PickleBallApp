export const colors = {
  primary: {
    light: '#4CAF50',
    main: '#2E7D32',
    dark: '#1B5E20',
  },
  secondary: {
    light: '#FF9800',
    main: '#F57C00',
    dark: '#E65100',
  },
  background: {
    light: '#FFFFFF',
    dark: '#121212',
  },
  text: {
    light: '#000000',
    dark: '#FFFFFF',
  },
  error: '#D32F2F',
  success: '#2E7D32',
  warning: '#ED6C02',
  info: '#0288D1',
  neutral: {
    light: '#F9FAFB',
    dark: '#18181b',
    mid: '#E0E0E0',
    midDark: '#27272a',
    border: '#cccccc',
    icon: '#bbb',
    modalOverlay: 'rgba(0, 0, 0, 0.7)',
    skillAll: '#666666',
    waitlist: '#FFA000',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System-Medium',
    bold: 'System-Bold',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  round: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
};

export const Colors = {
  light: {
    text: colors.text.light,
    background: colors.background.light,
    primary: colors.primary.light,
    secondary: colors.neutral.light,
    tint: colors.primary.light,
    tabIconDefault: colors.neutral.border,
    tabIconSelected: colors.primary.light,
    white: '#ffffff',
    black: '#000000',
    error: colors.error,
    success: colors.success,
    warning: colors.warning,
    info: colors.info,
    modalOverlay: colors.neutral.modalOverlay,
    skillAll: colors.neutral.skillAll,
    waitlist: colors.neutral.waitlist,
    icon: colors.neutral.icon,
  },
  dark: {
    text: colors.text.dark,
    background: colors.background.dark,
    primary: colors.primary.light,
    secondary: colors.neutral.midDark,
    tint: colors.primary.light,
    tabIconDefault: colors.neutral.border,
    tabIconSelected: '#ffffff',
    white: '#ffffff',
    black: '#000000',
    error: colors.error,
    success: colors.success,
    warning: colors.warning,
    info: colors.info,
    modalOverlay: colors.neutral.modalOverlay,
    skillAll: colors.neutral.skillAll,
    waitlist: colors.neutral.waitlist,
    icon: colors.neutral.icon,
  },
};