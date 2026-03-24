import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

import PremiumButton from '../../src/components/ui/Button';
import PremiumCard from '../../src/components/ui/Card';
import PremiumBadge from '../../src/components/ui/Badge';
import Colors from '../../src/theme/colors';
import Typography from '../../src/theme/typography';
import Radius from '../../src/theme/radius';
import Shadows from '../../src/theme/shadows';
import { formatTime, formatDate } from '../../src/utils/formatters';
import api from '../../src/utils/api';
import useAuthStore from '../../src/store/authStore';

const { width } = Dimensions.get('window');

export default function ClockInScreen() {
  const router = useRouter();
  const { employee } = useAuthStore();
  const [status, setStatus] = useState('idle'); // idle | scanning | loading | confirmed
  const [clockedAt, setClockedAt] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [locationPermission, setLocationPermission] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
    })();
  }, []);

  const handleClockIn = async (locationToken = 'manual-default') => {
    if (status === 'loading') return;
    setStatus('loading');
    setErrorMsg(null);

    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const response = await api.post('/pointage/clock-in', {
        channel: 'qr_location',
        payload: {
          location_token: locationToken,
          latitude,
          longitude,
        }
      });

      if (response.data.success) {
        setClockedAt(new Date());
        setStatus('confirmed');
      } else {
        setErrorMsg(response.data.error || 'Erreur lors du pointage');
        setStatus('idle');
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Erreur réseau ou localisation';
      setErrorMsg(msg);
      setStatus('idle');
      Alert.alert('Erreur', msg);
    }
  };

  const handleBarcodeScanned = ({ data }) => {
    if (status !== 'scanning') return;
    handleClockIn(data);
  };

  const handleReset = () => {
    setStatus('idle');
    setClockedAt(null);
    setErrorMsg(null);
  };

  // Profile Data (with fallback)
  const userProfile = employee || {
    first_name: 'Collaborateur',
    last_name: 'Pointel',
    position: 'Chargement...',
  };

  if (status === 'confirmed') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.content}>
          <View style={styles.confirmationHeader}>
            <View style={styles.successIconOuter}>
              <View style={styles.successIconInner}>
                <Ionicons name="checkmark" size={40} color={Colors.on_primary} />
              </View>
            </View>
            <Text style={styles.confirmTitle}>Pointage Réussi</Text>
            <Text style={styles.confirmSubtitle}>Bonne journée de travail !</Text>
          </View>

          <PremiumCard style={styles.confirmCard}>
            <Text style={styles.confirmTime}>{formatTime(clockedAt)}</Text>
            <Text style={styles.confirmDate}>{formatDate(clockedAt)}</Text>
            <View style={styles.confirmBadgeRow}>
              <PremiumBadge status="present" label="En poste" />
            </View>
          </PremiumCard>

          <View style={styles.footer}>
            <PremiumButton
              title="C'est noté"
              onPress={handleReset}
              size="lg"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={status === 'scanning' ? 'light' : 'dark'} />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandTitle}>Pointel<Text style={{color: Colors.primary_vibrant}}>RH</Text></Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => router.push('/profile')}
          activeOpacity={0.7}
        >
          <View style={styles.avatarMini}>
            <Ionicons name="person" size={20} color={Colors.primary_vibrant} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        {status === 'scanning' ? (
          <View style={styles.fullScanner}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={handleBarcodeScanned}
            />
            {/* World-class Viewfinder Overlay */}
            <View style={styles.overlay}>
              <View style={styles.unfocusedContainer}></View>
              <View style={styles.middleRow}>
                <View style={styles.unfocusedContainer}></View>
                <View style={styles.focusedContainer}>
                  {/* Corner markers */}
                  <View style={[styles.corner, styles.topLeft]} />
                  <View style={[styles.corner, styles.topRight]} />
                  <View style={[styles.corner, styles.bottomLeft]} />
                  <View style={[styles.corner, styles.bottomRight]} />
                </View>
                <View style={styles.unfocusedContainer}></View>
              </View>
              <View style={styles.unfocusedContainer}>
                 <Text style={styles.scanInstruction}>Placez le QR Code dans le cadre</Text>
                 <TouchableOpacity 
                   style={styles.cancelScan}
                   onPress={() => setStatus('idle')}
                 >
                   <Text style={styles.cancelScanText}>Annuler</Text>
                 </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.idleView}>
            <View style={styles.greetingSection}>
              <Text style={styles.greetingHeader}>Bonjour, {userProfile.first_name}</Text>
              <Text style={styles.greetingSub}>Il est {formatTime(new Date())}</Text>
            </View>

            {/* Central Status Illustration/Card */}
            <View style={styles.centerIllustration}>
               <View style={styles.outerCircle}>
                  <View style={styles.innerCircle}>
                     <Ionicons name="time-outline" size={64} color={Colors.primary_vibrant} />
                  </View>
               </View>
               <Text style={styles.statusLabel}>Vous n'avez pas encore pointé</Text>
            </View>

            {/* Centered Actions */}
            <View style={styles.actionContainer}>
              <PremiumButton 
                title={status === 'loading' ? 'Connexion...' : 'Pointer mon arrivée'} 
                onPress={() => setStatus('scanning')}
                isLoading={status === 'loading'}
                size="lg"
                style={styles.mainAction}
                icon={<Ionicons name="qr-code-outline" size={24} color={Colors.on_primary} />}
              />
              
              <Text style={styles.locationInfo}>
                <Ionicons name="location-outline" size={12} /> Proche du site de production
              </Text>
            </View>
          </View>
        )}
      </View>

      {errorMsg && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
  },
  brandTitle: {
    ...Typography.h1,
    fontSize: 22,
    color: Colors.on_surface,
  },
  profileButton: {
    ...Shadows.sm,
  },
  avatarMini: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface_container_lowest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.surface_container,
  },
  mainContent: {
    flex: 1,
  },
  idleView: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 100, // Above tab bar
  },
  greetingSection: {
    marginTop: 20,
  },
  greetingHeader: {
    ...Typography.h1,
    fontSize: 32,
    color: Colors.on_surface,
  },
  greetingSub: {
    ...Typography.body_lg,
    color: Colors.on_surface_variant,
    marginTop: 4,
  },
  centerIllustration: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.surface_container_low,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.surface_container_lowest,
    ...Shadows.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusLabel: {
    ...Typography.body_md,
    color: Colors.on_surface_variant,
    marginTop: 32,
    textAlign: 'center',
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
  },
  mainAction: {
    width: '100%',
    ...Shadows.lg,
  },
  locationInfo: {
    ...Typography.caption,
    color: Colors.on_surface_variant,
    marginTop: 16,
    opacity: 0.7,
  },
  fullScanner: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    flex: 1,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleRow: {
    flexDirection: 'row',
    height: 250,
  },
  focusedContainer: {
    width: 250,
    height: 250,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: Colors.on_primary,
    borderWidth: 4,
  },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 24 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 24 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 24 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 24 },
  scanInstruction: {
    ...Typography.body_md,
    color: Colors.on_primary,
    marginBottom: 40,
  },
  cancelScan: {
    padding: 16,
  },
  cancelScanText: {
    ...Typography.body_md,
    color: Colors.on_primary,
    textDecorationLine: 'underline',
  },
  confirmationHeader: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  successIconOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.status.success.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successIconInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.status.success.vibrant,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  confirmTitle: {
    ...Typography.h1,
    fontSize: 28,
    color: Colors.on_surface,
  },
  confirmSubtitle: {
    ...Typography.body_lg,
    color: Colors.on_surface_variant,
    marginTop: 4,
  },
  confirmCard: {
    alignItems: 'center',
    marginHorizontal: 16,
    paddingVertical: 40,
  },
  confirmTime: {
    ...Typography.h1,
    fontSize: 64,
    color: Colors.primary_vibrant,
    letterSpacing: -2,
  },
  confirmDate: {
    ...Typography.body_lg,
    color: Colors.on_surface_variant,
    marginTop: 4,
  },
  confirmBadgeRow: {
    marginTop: 32,
  },
  footer: {
    padding: 24,
    marginBottom: 40,
  },
  errorBanner: {
    position: 'absolute',
    bottom: 120,
    left: 24,
    right: 24,
    backgroundColor: Colors.status.error.bg,
    padding: 16,
    borderRadius: Radius.lg,
    ...Shadows.md,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.status.error.text,
    textAlign: 'center',
    fontFamily: 'Inter_600SemiBold',
  }
});

