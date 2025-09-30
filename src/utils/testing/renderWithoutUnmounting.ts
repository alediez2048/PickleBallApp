/**
 * Simple test renderer utilities for React Native that prevent the
 * "Can't access .root on unmounted test renderer" error
 */
import React from 'react';
import TestRenderer, { ReactTestInstance, ReactTestRenderer } from 'react-test-renderer';
import { fireEvent, waitFor } from '@testing-library/react-native';

// Global store for active renderers to prevent them from being unmounted
const activeRenderers: ReactTestRenderer[] = [];

/**
 * Renders a component safely without the risk of unmounting during test assertions
 */
export function render(component: React.ReactElement): {
  renderer: ReactTestRenderer;
  getByTestId: (testId: string) => ReactTestInstance;
  getByText: (text: string) => ReactTestInstance;
  getAllByTestId: (testId: string) => ReactTestInstance[];
  queryByTestId: (testId: string) => ReactTestInstance | null;
  unmount: () => void;
} {
  // Create the renderer
  const renderer = TestRenderer.create(component);
  
  // Store it to prevent auto-unmounting
  activeRenderers.push(renderer);
  
  // Helper to find elements by testID
  const getByTestId = (testId: string): ReactTestInstance => {
    const element = renderer.root.findByProps({ testID: testId });
    if (!element) {
      throw new Error(`Could not find element with testID: ${testId}`);
    }
    return element;
  };
  
  // Helper to find elements by text content
  const getByText = (text: string): ReactTestInstance => {
    const elements = findAllWithText(renderer.root, text);
    if (elements.length === 0) {
      throw new Error(`Could not find element with text: ${text}`);
    }
    return elements[0];
  };
  
  // Helper to find all elements by testID
  const getAllByTestId = (testId: string): ReactTestInstance[] => {
    const elements = renderer.root.findAllByProps({ testID: testId });
    if (elements.length === 0) {
      throw new Error(`Could not find elements with testID: ${testId}`);
    }
    return elements;
  };
  
  // Helper to optionally find an element by testID
  const queryByTestId = (testId: string): ReactTestInstance | null => {
    try {
      return getByTestId(testId);
    } catch {
      return null;
    }
  };
  
  // Custom unmount function that removes from activeRenderers
  const unmount = () => {
    const index = activeRenderers.indexOf(renderer);
    if (index !== -1) {
      activeRenderers.splice(index, 1);
    }
    renderer.unmount();
  };
  
  return {
    renderer,
    getByTestId,
    getByText,
    getAllByTestId,
    queryByTestId,
    unmount
  };
}

/**
 * Helper to find all elements with a specific text content
 */
function findAllWithText(root: ReactTestInstance, text: string): ReactTestInstance[] {
  const results: ReactTestInstance[] = [];
  
  function traverse(instance: ReactTestInstance) {
    // Check if this is a text element
    const type = instance.type as any;
    const typeStr = String(type);
    
    // Check if it's a text component by checking the type name
    const isTextComponent = 
      typeof type === 'string' && 
      (typeStr.includes('Text') || typeStr === 'Text' || typeStr === 'RCTText');
      
    if (isTextComponent) {
      const children = instance.props.children;
      if (typeof children === 'string' && children.includes(text)) {
        results.push(instance);
      }
    }
    
    // Check children
    instance.children.forEach(child => {
      if (typeof child !== 'string' && child !== null) {
        traverse(child as ReactTestInstance);
      }
    });
  }
  
  traverse(root);
  return results;
}

/**
 * Clean up all active renderers at the end of testing
 */
export function cleanup() {
  activeRenderers.forEach(renderer => {
    try {
      renderer.unmount();
    } catch (e) {
      // Ignore errors during cleanup
    }
  });
  activeRenderers.length = 0;
}

/**
 * Set up global cleanup after all tests
 */
export function setupTestingLibrary() {
  afterAll(() => {
    cleanup();
  });
}

// Re-export useful functions from @testing-library/react-native
export { fireEvent, waitFor }; 