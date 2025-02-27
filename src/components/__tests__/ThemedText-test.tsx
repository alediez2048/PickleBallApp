import React from "react";
import renderer from "react-test-renderer";
import { ThemedText } from "@/components/common/ThemedText";

// Mock the UIContext
jest.mock('@/contexts/UIContext', () => ({
  UIProvider: ({ children }: { children: React.ReactNode }) => children,
  useUIState: () => ({
    colorScheme: 'light',
    theme: 'default'
  }),
  useThemedColor: () => ({
    text: '#000000',
    background: '#FFFFFF'
  })
}));

describe("ThemedText", () => {
  it("renders with default props", () => {
    const tree = renderer
      .create(<ThemedText>Test text</ThemedText>)
      .toJSON();
    
    expect(tree).toMatchSnapshot('default props');
  });

  it("renders with different types", () => {
    const titleTree = renderer
      .create(<ThemedText type="title">Title text</ThemedText>)
      .toJSON();
    
    const subtitleTree = renderer
      .create(<ThemedText type="subtitle">Subtitle text</ThemedText>)
      .toJSON();
    
    const defaultSemiBoldTree = renderer
      .create(<ThemedText type="defaultSemiBold">Semi Bold text</ThemedText>)
      .toJSON();
    
    expect(titleTree).toMatchSnapshot('title type');
    expect(subtitleTree).toMatchSnapshot('subtitle type');
    expect(defaultSemiBoldTree).toMatchSnapshot('defaultSemiBold type');
  });

  it("renders with custom color", () => {
    const tree = renderer
      .create(<ThemedText style={{ color: "#FF0000" }}>Test text</ThemedText>)
      .toJSON();
    
    expect(tree).toMatchSnapshot('custom color');
  });

  it("renders with custom styles", () => {
    const customStyle = { marginTop: 10, fontSize: 18 };
    
    const tree = renderer
      .create(<ThemedText style={customStyle}>Test text</ThemedText>)
      .toJSON();
    
    expect(tree).toMatchSnapshot('custom styles');
  });

  it("renders with additional props", () => {
    const tree = renderer
      .create(
        <ThemedText 
          numberOfLines={2} 
          ellipsizeMode="tail"
        >
          Test text that might be too long and needs to be truncated
        </ThemedText>
      )
      .toJSON();
    
    expect(tree).toMatchSnapshot('with additional props');
  });
});
