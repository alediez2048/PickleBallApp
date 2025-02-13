import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button } from '@components/common/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/contexts/selectors/authSelectors';
import { useRouter } from 'expo-router';

export default function TabHomeScreen() {
  const { signOut } = useAuth();
  const user = useUserProfile();
  const router = useRouter();
  
  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.banner}>
        <Text style={styles.welcomeText}>
          Hi {user?.name || 'User'}, Welcome to PicklePass
        </Text>
      </View>

      <View style={styles.container}>
        <Text style={styles.title}>
          Welcome to PicklePass
        </Text>
        <Text style={styles.subtitle}>
          Find and join pickleball games near you
        </Text>
        
        <View style={styles.buttonContainer}>
          <Button 
            onPress={() => router.push('/explore')} 
            size="lg"
            style={styles.button}
          >
            Find Games
          </Button>
          
          <View style={styles.upcomingGamesContainer}>
            <Text style={styles.sectionTitle}>
              Upcoming Games
            </Text>
            <Text style={styles.sectionContent}>
              No upcoming games scheduled. Find a game to join!
            </Text>
          </View>

          <Button 
            variant="secondary" 
            onPress={signOut}
            size="md"
            style={styles.button}
          >
            Sign Out
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  banner: {
    backgroundColor: '#000000',
    padding: 20,
    paddingTop: 60,
  },
  welcomeText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    marginBottom: 12,
  },
  upcomingGamesContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  sectionContent: {
    color: '#666666',
  },
});
