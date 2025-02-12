import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { Button } from '@components/common/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/contexts/selectors/authSelectors';

export default function TabHomeScreen() {
  const { signOut } = useAuth();
  const user = useUserProfile();
  
  useEffect(() => {
    console.log('Current user data:', user);
  }, [user]);
  
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View style={{ backgroundColor: '#000000', padding: 20, paddingTop: 60 }}>
        <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: 'bold' }}>
          Hi {user?.name || 'User'}, Welcome to PicklePass
        </Text>
      </View>

      <View style={{ padding: 16 }}>
        <Text style={{ color: '#000000', fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
          Welcome to PicklePass
        </Text>
        <Text style={{ color: '#000000', textAlign: 'center', marginBottom: 32 }}>
          Find and join pickleball games near you
        </Text>
        
        <View style={{ width: '100%', gap: 16 }}>
          <Button onPress={() => console.log('Primary pressed')} size="lg">
            Find Games
          </Button>

          <View style={{ 
            backgroundColor: '#f5f5f5', 
            padding: 16, 
            borderRadius: 8,
            marginVertical: 16 
          }}>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              color: '#000000',
              marginBottom: 8 
            }}>
              Upcoming Games
            </Text>
            <Text style={{ color: '#666666' }}>
              No upcoming games scheduled. Find a game to join!
            </Text>
          </View>

          <Button 
            variant="secondary" 
            onPress={signOut}
            size="md"
          >
            Sign Out
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
