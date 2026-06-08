import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TransactionDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  let item: any = null;
  try {
    if (params.item) {
      item = JSON.parse(params.item as string);
    }
  } catch (error) {
    console.error('Error parsing transaction item:', error);
  }

  if (!item) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No transaction details found.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isRide = item.type === 'ride';
  const original = item.originalItem || {};

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Receipt Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Receipt Header Card */}
        <View style={styles.receiptCard}>
          <View style={styles.iconContainer}>
            <Ionicons name={item.icon} size={36} color="#1E40AF" />
          </View>
          <Text style={styles.priceText}>{item.price}</Text>
          <Text style={styles.titleText}>{item.title}</Text>
          <Text style={styles.dateText}>{item.date}</Text>

          <View style={[
            styles.statusBadge,
            item.status === 'Completed' ? styles.completedBadge : styles.canceledBadge
          ]}>
            <Text style={[
              styles.statusText,
              item.status === 'Completed' ? styles.completedText : styles.canceledText
            ]}>
              {item.status}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Location details */}
          <View style={styles.section}>
            <View style={styles.locationRow}>
              <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationLabel}>Pickup Location</Text>
                <Text style={styles.locationValue}>{original.pickupLocation || original.delivery?.pickupAddress || 'Pickup address not available'}</Text>
              </View>
            </View>

            <View style={styles.verticalLine} />

            <View style={styles.locationRow}>
              <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationLabel}>Dropoff Location</Text>
                <Text style={styles.locationValue}>{original.dropoffLocation || original.delivery?.dropoffAddress || 'Dropoff address not available'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Transaction Info</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction Type</Text>
            <Text style={styles.detailValue}>{isRide ? 'Ride Service' : 'Delivery Service'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reference ID</Text>
            <Text style={styles.detailValue}>{item.id.substring(0, 8).toUpperCase()}</Text>
          </View>

          {isRide && original.vehicleType && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Vehicle Category</Text>
              <Text style={styles.detailValue}>{original.vehicleType}</Text>
            </View>
          )}

          {!isRide && original.paymentMethod && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Method</Text>
              <Text style={styles.detailValue}>{original.paymentMethod}</Text>
            </View>
          )}
        </View>

        {/* Driver/Cyclist Info if available */}
        {(original.driverName || original.delivery?.driver?.name) && (
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>{isRide ? 'Driver Details' : 'Cyclist Details'}</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Name</Text>
              <Text style={styles.detailValue}>{original.driverName || original.delivery?.driver?.name}</Text>
            </View>

            {(original.driverPhoneNumber || original.delivery?.driver?.phoneNumber) && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone Number</Text>
                <Text style={styles.detailValue}>{original.driverPhoneNumber || original.delivery?.driver?.phoneNumber}</Text>
              </View>
            )}

            {isRide && original.driverLicensePlate && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>License Plate</Text>
                <Text style={styles.detailValue}>{original.driverLicensePlate}</Text>
              </View>
            )}

            {isRide && original.driverVehicleInfo && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Vehicle Information</Text>
                <Text style={styles.detailValue}>{original.driverVehicleInfo}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#1E40AF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '700',
  },
  receiptCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1E40AF',
    marginBottom: 8,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 24,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  completedBadge: {
    backgroundColor: '#DCFCE7',
  },
  completedText: {
    color: '#166534',
  },
  canceledBadge: {
    backgroundColor: '#FEE2E2',
  },
  canceledText: {
    color: '#991B1B',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 20,
  },
  section: {
    width: '100%',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  verticalLine: {
    width: 2,
    height: 24,
    backgroundColor: '#CBD5E1',
    marginLeft: 5,
    marginVertical: 4,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  locationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 20,
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
});
