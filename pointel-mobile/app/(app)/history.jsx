import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import PremiumCard from '../../src/components/ui/Card';
import PremiumBadge from '../../src/components/ui/Badge';
import Colors from '../../src/theme/colors';
import Typography from '../../src/theme/typography';
import Radius from '../../src/theme/radius';
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
        <ActivityIndicator color={Colors.primary_vibrant} />
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const dateObj = new Date(item.checked_in_at);
    
    const statusMap = {
      'validated': 'present',
      'late': 'late',
      'rejected': 'absent',
    };
    const badgeStatus = statusMap[item.status] || 'present';

    return (
      <PremiumCard style={styles.historyCard}>
        <View style={styles.cardHeader}>
          <View style={styles.timeInfo}>
            <Text style={styles.timeText}>{formatTime(dateObj)}</Text>
            <Text style={styles.dateText}>{formatDate(dateObj)}</Text>
          </View>
          <PremiumBadge status={badgeStatus} />
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
             <Ionicons name="location-outline" size={14} color={Colors.on_surface_variant} />
             <Text style={styles.footerText}>{item.channel === 'qr_location' ? 'Scan Mural' : 'Badgeuse'}</Text>
          </View>
          <View style={styles.footerItem}>
             <Ionicons name="timer-outline" size={14} color={Colors.on_surface_variant} />
             <Text style={styles.footerText}>
               {item.late_minutes > 0 ? `${item.late_minutes} min retard` : 'À l\'heure'}
             </Text>
          </View>
        </View>
      </PremiumCard>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Historique</Text>
        <Text style={styles.subtitle}>Vos 30 derniers pointages</Text>
      </View>

      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={Colors.surface_container} />
            <Text style={styles.emptyText}>Aucun pointage trouvé</Text>
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
    paddingTop: 12,
    marginBottom: 24,
  },
  title: {
    ...Typography.h1,
    fontSize: 32,
    color: Colors.on_surface,
  },
  subtitle: {
    ...Typography.body_md,
    color: Colors.on_surface_variant,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 120, // Tab bar space
  },
  historyCard: {
    marginBottom: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeInfo: {
    flex: 1,
  },
  timeText: {
    ...Typography.h1,
    fontSize: 20,
    color: Colors.on_surface,
  },
  dateText: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.on_surface_variant,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.surface_container,
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    ...Typography.caption,
    color: Colors.on_surface_variant,
    marginLeft: 6,
    fontSize: 12,
  },
  emptyState: {
    paddingTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body_md,
    color: Colors.on_surface_variant,
    marginTop: 16,
  }
});
