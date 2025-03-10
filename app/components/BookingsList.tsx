import React from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useUserBookings, useCancelBooking } from '../hooks/useSupabaseQuery';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

type BookingItemProps = {
  booking: any;
  onCancel: (id: string) => void;
  onPress: (id: string) => void;
};

const BookingItem = ({ booking, onCancel, onPress }: BookingItemProps) => {
  const startTime = new Date(booking.start_time);
  const endTime = new Date(booking.end_time);
  
  return (
    <TouchableOpacity 
      style={styles.bookingItem}
      onPress={() => onPress(booking.id)}
    >
      <View style={styles.bookingHeader}>
        <Text style={styles.courtName}>{booking.courts.name}</Text>
        <Text style={[
          styles.statusBadge,
          booking.status === 'confirmed' ? styles.confirmedStatus :
          booking.status === 'cancelled' ? styles.cancelledStatus :
          styles.pendingStatus
        ]}>
          {booking.status.toUpperCase()}
        </Text>
      </View>
      
      <Text style={styles.location}>{booking.courts.location}</Text>
      
      <View style={styles.timeContainer}>
        <Text style={styles.timeLabel}>Date:</Text>
        <Text style={styles.timeValue}>{format(startTime, 'MMMM d, yyyy')}</Text>
      </View>
      
      <View style={styles.timeContainer}>
        <Text style={styles.timeLabel}>Time:</Text>
        <Text style={styles.timeValue}>
          {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
        </Text>
      </View>
      
      {booking.games && booking.games.length > 0 && (
        <View style={styles.gameInfo}>
          <Text style={styles.gameType}>
            {booking.games[0].game_type.charAt(0).toUpperCase() + booking.games[0].game_type.slice(1)}
          </Text>
          <Text style={styles.playerCount}>
            {booking.games[0].current_players}/{booking.games[0].max_players} players
          </Text>
        </View>
      )}
      
      {booking.status !== 'cancelled' && (
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => onCancel(booking.id)}
        >
          <Text style={styles.cancelButtonText}>Cancel Booking</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default function BookingsList({ navigation }: { navigation: any }) {
  const { user } = useAuth();
  const { 
    data: bookings = [], 
    isLoading, 
    error, 
    refetch 
  } = useUserBookings(user?.id || '');
  
  const cancelBookingMutation = useCancelBooking();
  
  const handleCancelBooking = (id: string) => {
    cancelBookingMutation.mutate(id, {
      onSuccess: () => {
        // Show success message
        alert('Booking cancelled successfully');
      },
      onError: (error) => {
        // Show error message
        alert(`Error cancelling booking: ${error.message}`);
      }
    });
  };
  
  const handleBookingPress = (id: string) => {
    navigation.navigate('BookingDetails', { bookingId: id });
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
        <Text style={styles.errorText}>Error loading bookings: {error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <FlatList
        data={bookings || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BookingItem 
            booking={item} 
            onCancel={handleCancelBooking}
            onPress={handleBookingPress}
          />
        )}
        refreshing={cancelBookingMutation.isPending}
        onRefresh={refetch}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You don't have any bookings yet.</Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => navigation.navigate('CreateBooking')}
            >
              <Text style={styles.createButtonText}>Create a Booking</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  bookingItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courtName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  confirmedStatus: {
    backgroundColor: '#e6f7e6',
    color: '#2e7d32',
  },
  pendingStatus: {
    backgroundColor: '#fff9e6',
    color: '#f57c00',
  },
  cancelledStatus: {
    backgroundColor: '#ffebee',
    color: '#c62828',
  },
  location: {
    color: '#666',
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timeLabel: {
    width: 50,
    color: '#666',
  },
  timeValue: {
    fontWeight: '500',
  },
  gameInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#e3f2fd',
    padding: 8,
    borderRadius: 4,
    marginTop: 12,
  },
  gameType: {
    fontWeight: '500',
    color: '#1565c0',
  },
  playerCount: {
    color: '#1565c0',
  },
  cancelButton: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    color: '#c62828',
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 4,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
}); 