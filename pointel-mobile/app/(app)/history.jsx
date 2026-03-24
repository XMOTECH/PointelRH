import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../src/theme/colors';
import Badge from '../../src/components/ui/Badge';
import { formatTime, formatDate } from '../../src/utils/formatters';
import useAuthStore from '../../src/store/authStore';
import api from '../../src/utils/api';

export default function HistoryScreen() {
  const { employee } = useAuthStore();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!employee?.id) return;
      try {
        const response = await api.get(`/pointage/attendances/employee/${employee.id}`);
        setHistory(response.data.data);
      } catch (err) {
        console.error('Failed to fetch history', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [employee?.id]);

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  const renderItem = ({ item, index }) => {
    const isEven = index % 2 === 0;
    const dateObj = new Date(item.checked_in_at);
    
    // Status mapping
    // present (success), late (warning), absent (error)
    // Assuming backend status maps: 'validated' -> present, 'late' -> late, 'rejected' -> absent
    const statusMap = {
      'validated': 'present',
      'late': 'late',
      'rejected': 'absent',
    };
    const badgeStatus = statusMap[item.status] || 'present';

    return (
      <View style={[styles.item, { backgroundColor: isEven ? Colors.surface : Colors.surface_container_low }]}>
        <View style={styles.timeSection}>
          <Text style={styles.timeText}>{formatTime(dateObj)}</Text>
          <Text style={styles.dateText}>{formatDate(dateObj)}</Text>
        </View>
        <View style={styles.infoSection}>
          <Text style={styles.typeText}>{item.channel === 'qr_location' ? 'Scan Mural' : 'Badgeuse'}</Text>
          <Text style={styles.locationText}>{item.late_minutes > 0 ? `${item.late_minutes} min de retard` : 'À l\'heure'}</Text>
        </View>
        <View style={styles.statusSection}>
          <Badge status={badgeStatus} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historique</Text>
        <View style={styles.asymmetricStats}>
          <Text style={styles.statsLabel}>Pointages récents</Text>
          <Text style={styles.statsValue}>{history.length}</Text>
        </View>
      </View>

      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Inter_400Regular', color: Colors.on_surface_variant }}>Aucun pointage trouvé</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 40,
    marginBottom: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 32,
    color: Colors.on_surface,
    letterSpacing: -1,
  },
  asymmetricStats: {
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  statsLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.on_surface_variant,
  },
  statsValue: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 18,
    color: Colors.primary,
  },
  listContent: {
    paddingBottom: 100, // Space for tab bar
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  timeSection: {
    width: 80,
  },
  timeText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 18,
    color: Colors.on_surface,
  },
  dateText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.on_surface_variant,
    marginTop: 2,
  },
  infoSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  typeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.on_surface,
  },
  locationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.on_surface_variant,
    marginTop: 2,
  },
  statusSection: {
    width: 80,
    alignItems: 'flex-end',
  }
});
