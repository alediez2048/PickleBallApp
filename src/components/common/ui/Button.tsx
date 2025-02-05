import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';
import { clsx } from 'clsx';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}) => {
  return (
    <TouchableOpacity
      className={clsx(
        'rounded-full items-center justify-center',
        {
          'bg-primary': variant === 'primary',
          'bg-white border-2 border-primary': variant === 'secondary',
          'px-4 py-2': size === 'sm',
          'px-6 py-3': size === 'md',
          'px-8 py-4': size === 'lg',
        },
        className
      )}
      {...props}
    >
      <Text
        className={clsx('font-sans-medium', {
          'text-white': variant === 'primary',
          'text-primary': variant === 'secondary',
          'text-sm': size === 'sm',
          'text-base': size === 'md',
          'text-lg': size === 'lg',
        })}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}; 