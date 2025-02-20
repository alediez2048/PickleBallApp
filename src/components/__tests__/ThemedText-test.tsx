import React from "react";
import { render } from "@testing-library/react-native";
import { ThemedText } from "../ThemedText";

describe("ThemedText", () => {
  it("renders with default props", () => {
    const { getByText } = render(<ThemedText>Test text</ThemedText>);
    const text = getByText("Test text");
    expect(text).toBeTruthy();
    expect(text.props.style).toContainEqual({ color: "#000000" });
    expect(text.props.style).toContainEqual({
      fontSize: 16,
      lineHeight: 24,
    });
  });

  it("applies variant styles correctly", () => {
    const variants = ["body", "title", "subtitle", "caption"] as const;
    variants.forEach((variant) => {
      const { getByText } = render(
        <ThemedText variant={variant}>Test text</ThemedText>,
      );
      const text = getByText("Test text");
      expect(text.props.style).toContainEqual(
        expect.objectContaining({
          fontSize: expect.any(Number),
          lineHeight: expect.any(Number),
        }),
      );
    });
  });

  it("applies custom color", () => {
    const { getByText } = render(
      <ThemedText color="#FF0000">Test text</ThemedText>,
    );
    const text = getByText("Test text");
    expect(text.props.style).toContainEqual({ color: "#FF0000" });
  });

  it("merges custom styles with theme styles", () => {
    const customStyle = { marginTop: 10 };
    const { getByText } = render(
      <ThemedText style={customStyle}>Test text</ThemedText>,
    );
    const text = getByText("Test text");
    expect(text.props.style).toContainEqual(customStyle);
    expect(text.props.style).toContainEqual({ color: "#000000" });
  });

  it("passes through additional Text props", () => {
    const { getByText } = render(
      <ThemedText numberOfLines={2} ellipsizeMode="tail">
        Test text
      </ThemedText>,
    );
    const text = getByText("Test text");
    expect(text.props.numberOfLines).toBe(2);
    expect(text.props.ellipsizeMode).toBe("tail");
  });

  it("renders title variant with correct styles", () => {
    const { getByText } = render(
      <ThemedText variant="title">Title text</ThemedText>,
    );
    const text = getByText("Title text");
    expect(text.props.style).toContainEqual({
      fontSize: 24,
      lineHeight: 32,
      fontWeight: "bold",
    });
  });

  it("renders subtitle variant with correct styles", () => {
    const { getByText } = render(
      <ThemedText variant="subtitle">Subtitle text</ThemedText>,
    );
    const text = getByText("Subtitle text");
    expect(text.props.style).toContainEqual({
      fontSize: 18,
      lineHeight: 26,
      fontWeight: "500",
    });
  });

  it("renders caption variant with correct styles", () => {
    const { getByText } = render(
      <ThemedText variant="caption">Caption text</ThemedText>,
    );
    const text = getByText("Caption text");
    expect(text.props.style).toContainEqual({
      fontSize: 14,
      lineHeight: 20,
      color: "#666666",
    });
  });
});
