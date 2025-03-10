import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AuthTest from './AuthTest';
import CourtsTest from './CourtsTest';

export default function SupabaseTest() {
  const [activeTab, setActiveTab] = useState<'auth' | 'courts'>('auth');
  
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'auth' && styles.activeTab]} 
          onPress={() => setActiveTab('auth')}
        >
          <Text style={[styles.tabText, activeTab === 'auth' && styles.activeTabText]}>
            Authentication
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'courts' && styles.activeTab]} 
          onPress={() => setActiveTab('courts')}
        >
          <Text style={[styles.tabText, activeTab === 'courts' && styles.activeTabText]}>
            Courts
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {activeTab === 'auth' ? <AuthTest /> : <CourtsTest />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196f3',
  },
  tabText: {
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2196f3',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
}); 