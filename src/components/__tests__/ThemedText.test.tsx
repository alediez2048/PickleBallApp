import React from 'react';
import renderer from 'react-test-renderer';
import { ThemedText } from '@/components/common/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';

// Mock the ColorScheme hook
jest.mock('@/hooks/useColorScheme');
const mockUseColorScheme = useColorScheme as jest.MockedFunction<typeof useColorScheme>;

// Mock the UIProvider context
jest.mock('@/contexts/UIContext', () => ({
  UIProvider: ({ children }: { children: React.ReactNode }) => children,
  useUIState: () => ({
    colorScheme: mockUseColorScheme(),
    theme: 'default'
  }),
  useThemedColor: () => ({
    text: mockUseColorScheme() === 'dark' ? '#ECEDEE' : '#11181C',
    background: mockUseColorScheme() === 'dark' ? '#1E1E1E' : '#FFFFFF'
  })
}));

describe('ThemedText', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly in light mode', () => {
    mockUseColorScheme.mockReturnValue('light');
    
    const tree = renderer
      .create(<ThemedText>Test Content</ThemedText>)
      .toJSON();
    
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly in dark mode', () => {
    mockUseColorScheme.mockReturnValue('dark');
    
    const tree = renderer
      .create(<ThemedText>Test Content</ThemedText>)
      .toJSON();
    
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly with custom styles', () => {
    mockUseColorScheme.mockReturnValue('light');
    
    const customStyle = { fontSize: 20, fontWeight: '600' as const, marginTop: 10 };
    
    const tree = renderer
      .create(<ThemedText style={customStyle}>Test Content</ThemedText>)
      .toJSON();
    
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly with different types', () => {
    mockUseColorScheme.mockReturnValue('light');
    
    const titleTree = renderer
      .create(<ThemedText type="title">Title Text</ThemedText>)
      .toJSON();
    
    const subtitleTree = renderer
      .create(<ThemedText type="subtitle">Subtitle Text</ThemedText>)
      .toJSON();
    
    const defaultTree = renderer
      .create(<ThemedText type="default">Default Text</ThemedText>)
      .toJSON();
    
    const linkTree = renderer
      .create(<ThemedText type="link">Link Text</ThemedText>)
      .toJSON();
    
    expect(titleTree).toMatchSnapshot('title type');
    expect(subtitleTree).toMatchSnapshot('subtitle type');
    expect(defaultTree).toMatchSnapshot('default type');
    expect(linkTree).toMatchSnapshot('link type');
  });
}); 