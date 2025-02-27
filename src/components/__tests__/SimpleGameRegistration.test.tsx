import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import renderer from 'react-test-renderer';

// Simple sample component without any hooks or context
const SimpleGameRegistration = (props: { spotsLeft: number; isLoading: boolean; isFull: boolean }) => {
  const { spotsLeft, isLoading, isFull } = props;
  
  const formatSpotsMessage = () => {
    if (isLoading) return 'Loading...';
    if (isFull) return 'Game Full';
    return `${spotsLeft}/12 spots left`;
  };

  return (
    <View testID="game-registration">
      <Text testID="spots-message">{formatSpotsMessage()}</Text>
      {isLoading && <Text testID="loading-indicator">Loading...</Text>}
      {isFull && <Text testID="full-message">Game is full</Text>}
      <TouchableOpacity 
        testID="register-button"
        disabled={isFull}
        onPress={() => {}}
      >
        <Text>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

describe('SimpleGameRegistration', () => {
  it('renders correctly with various prop combinations', () => {
    // Available spots
    const availableSpotsTree = renderer
      .create(<SimpleGameRegistration spotsLeft={7} isLoading={false} isFull={false} />)
      .toJSON();
    expect(availableSpotsTree).toMatchSnapshot();
    
    // Loading state
    const loadingTree = renderer
      .create(<SimpleGameRegistration spotsLeft={0} isLoading={true} isFull={false} />)
      .toJSON();
    expect(loadingTree).toMatchSnapshot();
    
    // Full game
    const fullGameTree = renderer
      .create(<SimpleGameRegistration spotsLeft={0} isLoading={false} isFull={true} />)
      .toJSON();
    expect(fullGameTree).toMatchSnapshot();
  });
}); 