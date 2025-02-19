// This file is a fallback for using MaterialIcons on Android and web.

import React from 'react';
import { Platform, StyleProp, TextStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Only import SFSymbols on iOS
let SFSymbol: any;
if (Platform.OS === 'ios') {
  SFSymbol = require('react-native-sfsymbols').SFSymbol;
}

// Icon name mapping between SF Symbols and Material Icons
const ICON_MAPPING = {
  'house.fill': 'home',
  'gamecontroller.fill': 'games',
  'person.fill.badge.plus': 'person-add',
  'exclamationmark.triangle.fill': 'warning',
  'trophy.fill': 'emoji-events',
  'person.fill': 'person',
  'pencil': 'edit',
  'xmark': 'close',
  'checkmark': 'check',
  'location.fill': 'location-on',
  'calendar': 'calendar-today',
  'person.2.fill': 'people',
  'star.fill': 'star',
  'chevron.down': 'keyboard-arrow-down',
  'safari.fill': 'explore',
} as const;

type IconName = keyof typeof ICON_MAPPING;

interface IconSymbolProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export function IconSymbol({ name, size = 24, color = '#000000', style }: IconSymbolProps) {
  // Use SF Symbols on iOS, Material Icons elsewhere
  if (Platform.OS === 'ios' && SFSymbol) {
    return <SFSymbol name={name} size={size} color={color} style={style} />;
  }

  return (
    <MaterialIcons
      name={ICON_MAPPING[name]}
      size={size}
      color={color}
      style={style}
    />
  );
}
