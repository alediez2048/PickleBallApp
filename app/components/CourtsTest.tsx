import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { useCourts, useCreateCourt } from '../hooks/useSupabaseQuery';
import { useAuth } from '../context/AuthContext';
import { Court } from '../services/courtService';

export default function CourtsTest() {
  const { data, isLoading, error, refetch } = useCourts();
  const courts = Array.isArray(data) ? data : [];
  
  const createCourtMutation = useCreateCourt();
  const { user } = useAuth();
  
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [isIndoor, setIsIndoor] = useState(false);
  
  const handleCreateCourt = () => {
    if (!name || !location) {
      alert('Please enter both name and location');
      return;
    }
    
    createCourtMutation.mutate({
      name,
      location,
      indoor: isIndoor,
      available: true
    }, {
      onSuccess: () => {
        alert('Court created successfully!');
        setName('');
        setLocation('');
        setIsIndoor(false);
        refetch();
      },
      onError: (error: Error) => {
        alert(`Error creating court: ${error.message}`);
      }
    });
  };
  
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error loading courts: {error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pickleball Courts</Text>
      
      <FlatList
        data={courts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.courtItem}>
            <Text style={styles.courtName}>{item.name}</Text>
            <Text style={styles.courtLocation}>{item.location}</Text>
            <Text style={styles.courtDetails}>
              {item.indoor ? 'Indoor' : 'Outdoor'} • 
              {item.available ? ' Available' : ' Not Available'}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No courts available. Add one below!</Text>
        }
      />
      
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Add New Court</Text>
        <TextInput
          style={styles.input}
          placeholder="Court Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Location"
          value={location}
          onChangeText={setLocation}
        />
        <TouchableOpacity 
          style={styles.toggleButton} 
          onPress={() => setIsIndoor(!isIndoor)}
        >
          <Text style={styles.toggleText}>
            {isIndoor ? '✓ Indoor' : '○ Outdoor'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreateCourt}
          disabled={createCourtMutation.isPending}
        >
          {createCourtMutation.isPending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.buttonText}>Create Court</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  courtItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  courtName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  courtLocation: {
    color: '#666',
    marginVertical: 4,
  },
  courtDetails: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  toggleButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
  },
  toggleText: {
    color: '#444',
  },
  createButton: {
    backgroundColor: '#2196f3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: '#c62828',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
}); 