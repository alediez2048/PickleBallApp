import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, ActivityIndicator, View } from 'react-native';
import { clsx } from 'clsx';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  disabled,
  loading,
  icon,
  ...props
}) => {
  return (
    <TouchableOpacity
      style={{
        width: '100%',
        height: size === 'sm' ? 40 : size === 'md' ? 48 : 52,
        backgroundColor: variant === 'primary' ? '#000' : '#fff',
        borderRadius: 6,
        borderWidth: variant === 'secondary' ? 1 : 0,
        borderColor: variant === 'secondary' ? '#e5e7eb' : undefined,
        opacity: disabled ? 0.5 : 1,
      }}
      disabled={disabled || loading}
      {...props}
    >
      <View style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
      }}>
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? 'white' : 'black'} />
        ) : (
          <>
            {icon && (
              <View style={{ marginRight: 8 }}>
                {icon}
              </View>
            )}
            <Text style={{
              fontSize: 15,
              fontWeight: '500',
              color: variant === 'primary' ? '#fff' : '#111',
              textAlign: 'center',
            }}>
              {children}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}; 