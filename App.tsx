import { Stack } from 'expo-router';
import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

export default function App() {
  return <ExpoRoot context={require.context('./', true, /\.(js|jsx|ts|tsx)$/)} />;
}

registerRootComponent(App); 