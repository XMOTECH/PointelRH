import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import PremiumCard from '../../src/components/ui/Card';
import PremiumButton from '../../src/components/ui/Button';
import PremiumBadge from '../../src/components/ui/Badge';
import Colors from '../../src/theme/colors';
import Typography from '../../src/theme/typography';
import Radius from '../../src/theme/radius';
import Shadows from '../../src/theme/shadows';
import useAuthStore from '../../src/store/authStore';
import api from '../../src/utils/api';

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>
        <Ionicons name={icon} size={16} color={Colors.on_surface_muted} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || '--'}</Text>
      </View>
    </View>
  );
}

function MenuItem({ icon, label, subtitle, onPress, isLast, color }) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, !isLast && styles.menuBorder]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={[styles.menuIconWrap, color && { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={18} color={color || Colors.on_surface_variant} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuText}>{label}</Text>
        {subtitle && <Text style={styles.menuSub}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={14} color={Colors.surface_container_highest} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, employee, setEmployee, logout, fetchEmployee } = useAuthStore();
  const [isLoading, setIsLoading] = useState(!employee);

  useEffect(() => {
    const loadProfile = async () => {
      if (employee) {
        setIsLoading(false);
        return;
      }
      const emp = await fetchEmployee();
      setIsLoading(false);
    };
    loadProfile();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Deconnexion',
      'Voulez-vous vraiment vous deconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se deconnecter',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={Colors.primary_vibrant} size="large" />
      </View>
    );
  }

  const emp = employee || {};
  const fullName = emp.first_name
    ? `${emp.first_name} ${emp.last_name || ''}`
    : user?.name || 'Collaborateur';
  const initials = fullName
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarOuter}>
            {emp.id ? (
              <Image
                source={{ uri: `https://i.pravatar.cc/200?u=${emp.id}` }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
          </View>
          <Text style={styles.profileName}>{fullName}</Text>
          <Text style={styles.profileRole}>{emp.position || 'Collaborateur'}</Text>
          <View style={styles.badgeRow}>
            {emp.registration_number && (
              <PremiumBadge status="info" label={emp.registration_number} />
            )}
            {emp.status === 'active' && (
              <PremiumBadge status="present" label="Actif" />
            )}
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <PremiumCard style={styles.infoCard}>
            <InfoRow icon="mail-outline" label="Email" value={emp.email || user?.email} />
            <InfoRow icon="call-outline" label="Telephone" value={emp.phone} />
            <InfoRow icon="business-outline" label="Departement" value={emp.department?.name} />
            <InfoRow icon="document-text-outline" label="Contrat" value={emp.contract_type} />
            <InfoRow icon="calendar-outline" label="Embauche" value={emp.hire_date} />
          </PremiumCard>
        </View>

        {/* Schedule Card */}
        {emp.schedule && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Planning</Text>
            <PremiumCard style={styles.scheduleCard}>
              <View style={styles.scheduleRow}>
                <View style={styles.scheduleIcon}>
                  <Ionicons name="time-outline" size={20} color={Colors.primary_vibrant} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.scheduleName}>{emp.schedule.name}</Text>
                  <Text style={styles.scheduleTime}>
                    {emp.schedule.start_time} — {emp.schedule.end_time}
                  </Text>
                </View>
              </View>
            </PremiumCard>
          </View>
        )}

        {/* Settings Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reglages</Text>
          <PremiumCard style={styles.menuCard}>
            <MenuItem
              icon="notifications-outline"
              label="Notifications"
              subtitle="Push et rappels"
              color={Colors.primary_vibrant}
            />
            <MenuItem
              icon="shield-checkmark-outline"
              label="Securite"
              subtitle="Mot de passe et biometrie"
              color={Colors.status.success.vibrant}
            />
            <MenuItem
              icon="language-outline"
              label="Langue"
              subtitle="Francais"
              color={Colors.status.info.vibrant}
            />
            <MenuItem
              icon="help-circle-outline"
              label="Aide"
              subtitle="Support et FAQ"
              color={Colors.status.warning.vibrant}
              isLast
            />
          </PremiumCard>
        </View>

        {/* Logout */}
        <View style={styles.logoutSection}>
          <PremiumButton
            title="Se deconnecter"
            variant="outline"
            onPress={handleLogout}
            style={styles.logoutBtn}
            icon={<Ionicons name="log-out-outline" size={20} color={Colors.primary} />}
          />
          <Text style={styles.version}>Pointel Go v2.5.0</Text>
        </View>
      </ScrollView>
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
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 120,
  },

  // Profile Header
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarOuter: {
    padding: 4,
    backgroundColor: Colors.surface_container_lowest,
    borderRadius: Radius.full,
    marginBottom: 16,
    ...Shadows.md,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.surface_container_low,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary_light,
  },
  avatarInitials: {
    ...Typography.h1,
    fontSize: 32,
    color: Colors.primary_vibrant,
  },
  profileName: {
    ...Typography.h1,
    fontSize: 24,
    color: Colors.on_surface,
    textAlign: 'center',
  },
  profileRole: {
    ...Typography.body_md,
    color: Colors.on_surface_variant,
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...Typography.label,
    fontSize: 11,
    color: Colors.on_surface_muted,
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 1.2,
  },

  // Info Card
  infoCard: {
    padding: 0,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface_container_low,
  },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface_container_low,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...Typography.caption,
    color: Colors.on_surface_muted,
    fontSize: 11,
  },
  infoValue: {
    ...Typography.body_md,
    fontFamily: 'Inter_500Medium',
    color: Colors.on_surface,
    marginTop: 1,
  },

  // Schedule Card
  scheduleCard: {
    padding: 16,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary_light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  scheduleName: {
    ...Typography.body_lg,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.on_surface,
  },
  scheduleTime: {
    ...Typography.body_md,
    color: Colors.on_surface_variant,
    marginTop: 2,
  },

  // Menu Card
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface_container_low,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface_container_low,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuText: {
    ...Typography.body_md,
    fontFamily: 'Inter_500Medium',
    color: Colors.on_surface,
  },
  menuSub: {
    ...Typography.caption,
    color: Colors.on_surface_muted,
    marginTop: 1,
    fontSize: 11,
  },

  // Logout
  logoutSection: {
    alignItems: 'center',
    marginTop: 8,
  },
  logoutBtn: {
    width: '100%',
  },
  version: {
    ...Typography.caption,
    color: Colors.on_surface_muted,
    marginTop: 20,
    opacity: 0.5,
  },
});
