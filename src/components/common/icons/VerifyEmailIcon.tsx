import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface VerifyEmailIconProps {
  size?: number;
  color?: string;
}

export const VerifyEmailIcon: React.FC<VerifyEmailIconProps> = ({ 
  size = 80,
  color = '#2E7D32' // Using our primary green color
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Envelope base */}
      <Path
        d="M4 7.8C4 6.80589 4.80589 4 7.8 4H16.2C19.1941 4 20 6.80589 20 7.8V16.2C20 19.1941 17.1941 20 16.2 20H7.8C4.80589 20 4 17.1941 4 16.2V7.8Z"
        fill={color}
        fillOpacity={0.1}
      />
      {/* Envelope top flap */}
      <Path
        d="M4 8L10.2 12.65C11.2667 13.45 12.7333 13.45 13.8 12.65L20 8"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Envelope outline */}
      <Path
        d="M4 7.8C4 6.80589 4.80589 4 7.8 4H16.2C19.1941 4 20 6.80589 20 7.8V16.2C20 19.1941 17.1941 20 16.2 20H7.8C4.80589 20 4 17.1941 4 16.2V7.8Z"
        stroke={color}
        strokeWidth={1.5}
      />
      {/* Checkmark circle */}
      <Circle
        cx="18"
        cy="18"
        r="6"
        fill={color}
      />
      {/* Checkmark */}
      <Path
        d="M15.5 18L17.5 20L20.5 16"
        stroke="white"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}; 