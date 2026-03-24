import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

export default function ProfileScreen() {
  const { user, setEmployee, logout } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/employees/by-user/${user.id}`);
        setProfile(response.data.data);
        setEmployee(response.data.data);
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (user?.id) fetchProfile();
  }, [user?.id]);

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator color={Colors.primary_vibrant} />
      </View>
    );
  }

  const employee = profile || {
    first_name: 'Utilisateur',
    last_name: 'Pointel',
    position: 'Collaborateur',
    registration_number: '#N/A',
  };

  const MenuItem = ({ icon, label, onPress, isLast }) => (
    <TouchableOpacity 
      style={[styles.menuItem, !isLast && styles.menuBorder]} 
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={styles.menuIconContainer}>
        <Ionicons name={icon} size={20} color={Colors.on_surface_variant} />
      </View>
      <Text style={styles.menuText}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={Colors.surface_container_highest} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
             <View style={styles.avatarOuter}>
               <Image 
                 source={{ uri: `https://i.pravatar.cc/150?u=${employee.id}` }} 
                 style={styles.avatar}
               />
             </View>
          </View>
          <Text style={styles.name}>{employee.first_name} {employee.last_name}</Text>
          <Text style={styles.role}>{employee.position || 'Collaborateur'}</Text>
          <View style={styles.badgeContainer}>
             <PremiumBadge status="info" label={employee.registration_number} />
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
           <PremiumCard style={styles.statCard}>
              <Text style={styles.statValue}>180h</Text>
              <Text style={styles.statLabel}>Mois cours</Text>
           </PremiumCard>
           <PremiumCard style={styles.statCard}>
              <Text style={styles.statValue}>12j</Text>
              <Text style={styles.statLabel}>Congés</Text>
           </PremiumCard>
        </View>

        {/* Menu Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres</Text>
          <PremiumCard style={styles.menuCard}>
            <MenuItem icon="notifications-outline" label="Notifications" />
            <MenuItem icon="shield-checkmark-outline" label="Sécurité & Confidentialité" />
            <MenuItem icon="language-outline" label="Langue de l'application" />
            <MenuItem icon="help-circle-outline" label="Assistance Technique" isLast />
          </PremiumCard>
        </View>

        <View style={styles.footer}>
          <PremiumButton 
            title="Déconnexion" 
            variant="outline" 
            onPress={logout} 
            style={styles.logoutBtn}
          />
          <Text style={styles.version}>Pointel Go v2.5.0 Premium</Text>
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    marginBottom: 20,
    ...Shadows.md,
  },
  avatarOuter: {
    padding: 4,
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface_container_low,
  },
  name: {
    ...Typography.h1,
    fontSize: 24,
    color: Colors.on_surface,
  },
  role: {
    ...Typography.body_md,
    color: Colors.on_surface_variant,
    marginTop: 4,
  },
  badgeContainer: {
    marginTop: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statValue: {
    ...Typography.h1,
    fontSize: 20,
    color: Colors.primary_vibrant,
  },
  statLabel: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.on_surface_variant,
    marginTop: 2,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...Typography.label,
    fontSize: 14,
    color: Colors.on_surface_variant,
    marginBottom: 16,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface_container,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface_container_low,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    ...Typography.body_md,
    color: Colors.on_surface,
    fontFamily: 'Inter_500Medium',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoutBtn: {
    width: '100%',
  },
  version: {
    ...Typography.caption,
    color: Colors.on_surface_variant,
    marginTop: 24,
    opacity: 0.5,
  }
});
