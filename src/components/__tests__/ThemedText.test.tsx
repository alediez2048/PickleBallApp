import React from 'react';
import { render } from '@testing-library/react-native';
import { UIProvider } from '@/contexts/UIContext';
import { ThemedText } from '@/components/common/ThemedText';
import type { TextStyle } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

jest.mock('@/hooks/useColorScheme');
const mockUseColorScheme = useColorScheme as jest.MockedFunction<typeof useColorScheme>;

const THEME_COLORS = {
  light: {
    text: '#11181C',
  },
  dark: {
    text: '#ECEDEE',
  },
};

describe('ThemedText', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('applies dark theme styles when in dark mode', () => {
    mockUseColorScheme.mockReturnValue('dark');
    
    const { getByText } = render(
      <UIProvider>
        <ThemedText>Test Content</ThemedText>
      </UIProvider>
    );
    const textElement = getByText('Test Content');
    const styles = textElement.props.style;
    expect(styles).toContainEqual(
      expect.objectContaining({ color: THEME_COLORS.dark.text })
    );
  });

  it('applies light theme styles when in light mode', () => {
    mockUseColorScheme.mockReturnValue('light');
    
    const { getByText } = render(
      <UIProvider>
        <ThemedText>Test Content</ThemedText>
      </UIProvider>
    );
    const textElement = getByText('Test Content');
    const styles = textElement.props.style;
    expect(styles).toContainEqual(
      expect.objectContaining({ color: THEME_COLORS.light.text })
    );
  });

  it('handles array of styles correctly', () => {
    mockUseColorScheme.mockReturnValue('light');
    
    const customStyles: TextStyle[] = [
      { fontSize: 20 },
      { fontWeight: '600' },
      { marginTop: 10 }
    ];
    
    const { getByText } = render(
      <UIProvider>
        <ThemedText style={customStyles}>Test Content</ThemedText>
      </UIProvider>
    );
    
    const textElement = getByText('Test Content');
    const styles = textElement.props.style;
    
    // Check if base theme style is applied
    expect(styles).toContainEqual(
      expect.objectContaining({ color: THEME_COLORS.light.text })
    );
    
    // Check if custom styles array is applied as the last item
    expect(styles[styles.length - 1]).toEqual(customStyles);
  });

  it('handles theme changes', () => {
    mockUseColorScheme.mockReturnValue('light');
    
    const { getByText, rerender } = render(
      <UIProvider>
        <ThemedText>Test Content</ThemedText>
      </UIProvider>
    );

    let textElement = getByText('Test Content');
    let styles = textElement.props.style;
    expect(styles).toContainEqual(
      expect.objectContaining({ color: THEME_COLORS.light.text })
    );

    // Change to dark theme
    mockUseColorScheme.mockReturnValue('dark');
    
    rerender(
      <UIProvider>
        <ThemedText>Test Content</ThemedText>
      </UIProvider>
    );

    textElement = getByText('Test Content');
    styles = textElement.props.style;
    expect(styles).toContainEqual(
      expect.objectContaining({ color: THEME_COLORS.dark.text })
    );
  });
}); 