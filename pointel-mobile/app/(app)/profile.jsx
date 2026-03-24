import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../src/theme/colors';
import Card from '../../src/components/ui/Card';
import Button from '../../src/components/ui/Button';
import useAuthStore from '../../src/store/authStore';
import api from '../../src/utils/api';

export default function ProfileScreen() {
  const { user, setEmployee } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/employees/by-user/${user.id}`);
        setProfile(response.data);
        setEmployee(response.data); // Persist in store
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
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  const employee = profile || {
    first_name: 'Utilisateur',
    last_name: 'Pointel',
    job_title: 'Collaborateur',
    registration_number: '#N/A',
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Asymmetric */}
        <View style={styles.header}>
          <View style={styles.avatarPlaceholder} />
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{employee.first_name} {employee.last_name}</Text>
            <Text style={styles.role}>{employee.job_title}</Text>
            <View style={styles.badgeLabel}>
              <Text style={styles.matricule}>{employee.registration_number}</Text>
            </View>
          </View>
        </View>

        {/* Tonal Section: Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>24</Text>
            <Text style={styles.summaryLabel}>Missions</Text>
          </View>
          <View style={styles.summarySpacer} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>98%</Text>
            <Text style={styles.summaryLabel}>Ponctualité</Text>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres</Text>
          <Card style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="notifications-outline" size={22} color={Colors.primary} />
              <Text style={styles.menuText}>Notifications</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.on_surface_variant} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="lock-closed-outline" size={22} color={Colors.primary} />
              <Text style={styles.menuText}>Sécurité & PIN</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.on_surface_variant} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]}>
              <Ionicons name="language-outline" size={22} color={Colors.primary} />
              <Text style={styles.menuText}>Langue</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.on_surface_variant} />
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.logoutContainer}>
          <Button 
            title="Déconnexion" 
            variant="secondary" 
            onPress={() => {}} 
          />
          <Text style={styles.version}>Pointel Go v2.4.1 • Propulsé par Pointel Group</Text>
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
    paddingTop: 40,
    paddingBottom: 100, // Space for tab bar
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.surface_container_highest,
    marginRight: 20,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 24,
    color: Colors.on_surface,
    letterSpacing: -0.5,
  },
  role: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.on_surface_variant,
    marginTop: 4,
  },
  badgeLabel: {
    marginTop: 8,
    backgroundColor: Colors.surface_container_low,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  matricule: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: Colors.primary,
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface_container_low,
    borderRadius: 24,
    padding: 24,
    marginBottom: 40,
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
    color: Colors.on_surface,
  },
  summaryLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.on_surface_variant,
    marginTop: 4,
  },
  summarySpacer: {
    width: 2,
    height: 40,
    backgroundColor: Colors.surface_container,
    borderRadius: 1,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 18,
    color: Colors.on_surface,
    marginBottom: 16,
    marginLeft: 4,
  },
  menuCard: {
    padding: 0, // Let items handle padding
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'transparent',
  },
  menuText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: Colors.on_surface,
    marginLeft: 16,
  },
  logoutContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  version: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.on_surface_variant,
    marginTop: 24,
    opacity: 0.6,
  }
});
