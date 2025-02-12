// This file is a fallback for using MaterialIcons on Android and web.

import React from 'react';
import { SFSymbol } from 'react-native-sfsymbols';
import { StyleProp, ViewStyle } from 'react-native';

type IconName =
  | 'house.fill'
  | 'gamecontroller.fill'
  | 'person.fill.badge.plus'
  | 'exclamationmark.triangle.fill'
  | 'trophy.fill'
  | 'person.fill'
  | 'pencil'
  | 'xmark'
  | 'checkmark';

interface IconSymbolProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function IconSymbol({ name, size = 24, color = '#000000', style }: IconSymbolProps) {
  return <SFSymbol name={name} size={size} color={color} style={style} />;
}
