import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import PremiumCard from '../../src/components/ui/Card';
import PremiumBadge from '../../src/components/ui/Badge';
import Colors from '../../src/theme/colors';
import Typography from '../../src/theme/typography';
import Radius from '../../src/theme/radius';
import Shadows from '../../src/theme/shadows';
import { formatTime, formatDate } from '../../src/utils/formatters';
import useAuthStore from '../../src/store/authStore';
import api from '../../src/utils/api';

const statusMap = {
  validated: 'present',
  present: 'present',
  late: 'late',
  rejected: 'absent',
  absent: 'absent',
};

function formatMinutes(min) {
  if (!min || min <= 0) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0) return `${h}h${m > 0 ? ` ${m}min` : ''}`;
  return `${m}min`;
}

export default function HistoryScreen() {
  const { employee, user, fetchEmployee } = useAuthStore();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = useCallback(async () => {
    const empId = employee?.id;
    if (!empId) {
      // Try to fetch employee if missing
      const emp = await fetchEmployee();
      if (!emp?.id) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await api.get(`/pointage/attendances/employee/${emp.id}`);
        const data = response.data?.data ?? response.data;
        setHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('[History] Failed:', err.message);
      }
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get(`/pointage/attendances/employee/${empId}`);
      const data = response.data?.data ?? response.data;
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[History] Failed:', err.message);
    }
    setIsLoading(false);
  }, [employee?.id]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  }, [fetchHistory]);

  // Stats
  const totalCount = history.length;
  const lateCount = history.filter(a => a.late_minutes > 0).length;
  const onTimeCount = totalCount - lateCount;

  const renderItem = ({ item, index }) => {
    const dateObj = item.checked_in_at ? new Date(item.checked_in_at) : new Date(item.work_date);
    const badgeStatus = statusMap[item.status] || 'present';
    const lateFormatted = formatMinutes(item.late_minutes);
    const durationFormatted = formatMinutes(item.work_minutes);

    return (
      <PremiumCard style={styles.card}>
        {/* Top row */}
        <View style={styles.cardTop}>
          <View style={styles.cardDateBlock}>
            <Text style={styles.cardDay}>
              {dateObj.toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase()}
            </Text>
            <Text style={styles.cardDateNum}>
              {dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
            </Text>
          </View>
          <PremiumBadge status={badgeStatus} label={item.status_label || item.status} />
        </View>

        {/* Time detail */}
        <View style={styles.cardBody}>
          <View style={styles.timeBlock}>
            <View style={styles.timeRow}>
              <View style={[styles.timeDot, { backgroundColor: Colors.status.success.vibrant }]} />
              <Text style={styles.timeLabel}>Entree</Text>
              <Text style={styles.timeValue}>
                {item.checked_in_at ? formatTime(new Date(item.checked_in_at)) : '--:--'}
              </Text>
            </View>
            <View style={styles.timeLine} />
            <View style={styles.timeRow}>
              <View style={[styles.timeDot, { backgroundColor: Colors.status.error.vibrant }]} />
              <Text style={styles.timeLabel}>Sortie</Text>
              <Text style={styles.timeValue}>
                {item.checked_out_at ? formatTime(new Date(item.checked_out_at)) : '--:--'}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer pills */}
        <View style={styles.cardFooter}>
          {durationFormatted && (
            <View style={styles.pill}>
              <Ionicons name="timer-outline" size={13} color={Colors.on_surface_variant} />
              <Text style={styles.pillText}>{durationFormatted}</Text>
            </View>
          )}
          {lateFormatted && (
            <View style={[styles.pill, styles.pillWarning]}>
              <Ionicons name="alert-circle-outline" size={13} color={Colors.status.warning.text} />
              <Text style={[styles.pillText, { color: Colors.status.warning.text }]}>{lateFormatted} retard</Text>
            </View>
          )}
          <View style={styles.pill}>
            <Ionicons name="location-outline" size={13} color={Colors.on_surface_variant} />
            <Text style={styles.pillText}>
              {item.channel === 'qr_location' ? 'QR' : item.channel || 'Site'}
            </Text>
          </View>
        </View>
      </PremiumCard>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={Colors.primary_vibrant} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Historique</Text>
        <Text style={styles.subtitle}>{totalCount} pointage{totalCount !== 1 ? 's' : ''}</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.primary_light }]}>
            <Ionicons name="finger-print" size={18} color={Colors.primary_vibrant} />
          </View>
          <Text style={styles.statValue}>{totalCount}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.status.success.bg }]}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.status.success.vibrant} />
          </View>
          <Text style={styles.statValue}>{onTimeCount}</Text>
          <Text style={styles.statLabel}>A l'heure</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.status.warning.bg }]}>
            <Ionicons name="alert-circle" size={18} color={Colors.status.warning.vibrant} />
          </View>
          <Text style={styles.statValue}>{lateCount}</Text>
          <Text style={styles.statLabel}>Retards</Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={item => item.id?.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary_vibrant}
            colors={[Colors.primary_vibrant]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="calendar-outline" size={48} color={Colors.surface_container_highest} />
            </View>
            <Text style={styles.emptyTitle}>Aucun pointage</Text>
            <Text style={styles.emptySub}>Vos pointages apparaitront ici</Text>
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
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 20,
  },
  title: {
    ...Typography.h1,
    fontSize: 30,
    color: Colors.on_surface,
  },
  subtitle: {
    ...Typography.body_md,
    color: Colors.on_surface_muted,
    marginTop: 4,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface_container_lowest,
    borderRadius: Radius.xl,
    padding: 14,
    alignItems: 'center',
    ...Shadows.sm,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    ...Typography.h2,
    fontSize: 20,
    color: Colors.on_surface,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.on_surface_muted,
    marginTop: 2,
  },

  // List
  list: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },

  // Card
  card: {
    marginBottom: 12,
    padding: 16,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardDateBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  cardDay: {
    ...Typography.label,
    fontSize: 10,
    color: Colors.primary_vibrant,
    letterSpacing: 1.2,
  },
  cardDateNum: {
    ...Typography.body_md,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.on_surface,
  },
  cardBody: {
    marginBottom: 14,
  },
  timeBlock: {
    paddingLeft: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timeLabel: {
    ...Typography.caption,
    color: Colors.on_surface_muted,
    marginLeft: 10,
    width: 50,
  },
  timeValue: {
    ...Typography.body_md,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.on_surface,
    marginLeft: 8,
  },
  timeLine: {
    width: 1,
    height: 14,
    backgroundColor: Colors.surface_container,
    marginLeft: 3,
    marginVertical: 3,
  },

  // Footer pills
  cardFooter: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface_container_low,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  pillWarning: {
    backgroundColor: Colors.status.warning.bg,
  },
  pillText: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.on_surface_variant,
    fontFamily: 'Inter_500Medium',
  },

  // Empty
  empty: {
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface_container_low,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    ...Typography.title,
    color: Colors.on_surface,
  },
  emptySub: {
    ...Typography.body_md,
    color: Colors.on_surface_muted,
    marginTop: 6,
  },
});
