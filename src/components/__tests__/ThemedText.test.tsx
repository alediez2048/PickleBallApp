import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';

// Mock the useColorScheme hook
jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: jest.fn(),
}));

describe('ThemedText', () => {
  beforeEach(() => {
    // Reset mock before each test
    (useColorScheme as jest.Mock).mockReset();
  });

  it('renders text content correctly', () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');
    const { getByText } = render(<ThemedText>Test Content</ThemedText>);
    expect(getByText('Test Content')).toBeTruthy();
  });

  it('applies light theme styles by default', () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');
    const { getByText } = render(<ThemedText>Test Content</ThemedText>);
    const textElement = getByText('Test Content');
    expect(textElement.props.style).toContainEqual(
      expect.objectContaining({ color: '#000000' })
    );
  });

  it('applies dark theme styles when in dark mode', () => {
    (useColorScheme as jest.Mock).mockReturnValue('dark');
    const { getByText } = render(<ThemedText>Test Content</ThemedText>);
    const textElement = getByText('Test Content');
    expect(textElement.props.style).toContainEqual(
      expect.objectContaining({ color: '#ffffff' })
    );
  });

  it('merges custom styles with theme styles', () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');
    const customStyle = { fontSize: 20, fontWeight: 'bold' as const };
    const { getByText } = render(
      <ThemedText style={customStyle}>Test Content</ThemedText>
    );
    const textElement = getByText('Test Content');
    expect(textElement.props.style).toContainEqual(
      expect.objectContaining(customStyle)
    );
    expect(textElement.props.style).toContainEqual(
      expect.objectContaining({ color: '#000000' })
    );
  });

  it('handles array of styles correctly', () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');
    const styles = [
      { fontSize: 20 },
      { fontWeight: 'bold' as const },
      { marginTop: 10 },
    ];
    const { getByText } = render(
      <ThemedText style={styles}>Test Content</ThemedText>
    );
    const textElement = getByText('Test Content');
    styles.forEach(style => {
      expect(textElement.props.style).toContainEqual(
        expect.objectContaining(style)
      );
    });
  });

  it('forwards additional Text props correctly', () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');
    const { getByText } = render(
      <ThemedText 
        numberOfLines={2}
        ellipsizeMode="tail"
        accessibilityLabel="Test label"
      >
        Test Content
      </ThemedText>
    );
    const textElement = getByText('Test Content');
    expect(textElement.props.numberOfLines).toBe(2);
    expect(textElement.props.ellipsizeMode).toBe('tail');
    expect(textElement.props.accessibilityLabel).toBe('Test label');
  });

  it('handles undefined style prop', () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');
    const { getByText } = render(
      <ThemedText style={undefined}>Test Content</ThemedText>
    );
    const textElement = getByText('Test Content');
    expect(textElement.props.style).toContainEqual(
      expect.objectContaining({ color: '#000000' })
    );
  });

  it('handles style changes through updates', () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');
    const { getByText, rerender } = render(
      <ThemedText style={{ fontSize: 14 }}>Test Content</ThemedText>
    );
    
    let textElement = getByText('Test Content');
    expect(textElement.props.style).toContainEqual(
      expect.objectContaining({ fontSize: 14 })
    );

    rerender(
      <ThemedText style={{ fontSize: 18 }}>Test Content</ThemedText>
    );

    textElement = getByText('Test Content');
    expect(textElement.props.style).toContainEqual(
      expect.objectContaining({ fontSize: 18 })
    );
  });

  it('handles theme changes', () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');
    const { getByText, rerender } = render(
      <ThemedText>Test Content</ThemedText>
    );
    
    let textElement = getByText('Test Content');
    expect(textElement.props.style).toContainEqual(
      expect.objectContaining({ color: '#000000' })
    );

    (useColorScheme as jest.Mock).mockReturnValue('dark');
    rerender(<ThemedText>Test Content</ThemedText>);

    textElement = getByText('Test Content');
    expect(textElement.props.style).toContainEqual(
      expect.objectContaining({ color: '#ffffff' })
    );
  });
}); 