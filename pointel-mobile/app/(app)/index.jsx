import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
  ActivityIndicator, Alert, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

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
const SCANNER_SIZE = width * 0.65;

export default function ClockInScreen() {
  const { user, employee } = useAuthStore();
  const [status, setStatus] = useState('idle'); // idle | scanning | loading | confirmed | error
  const [clockedAt, setClockedAt] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Pulse animation for scanner
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Success scale animation
  const successScale = useRef(new Animated.Value(0)).current;

  // Update clock every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  // Scanner pulse animation
  useEffect(() => {
    if (status === 'scanning') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [status]);

  // Success animation
  useEffect(() => {
    if (status === 'confirmed') {
      Animated.spring(successScale, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      successScale.setValue(0);
    }
  }, [status]);

  const handleStartScan = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission requise', 'Activez la camera pour scanner le QR code.');
        return;
      }
    }
    setErrorMsg(null);
    setStatus('scanning');
  };

  const handleClockIn = async (locationToken = 'manual-default') => {
    if (status === 'loading') return;
    setStatus('loading');
    setErrorMsg(null);

    try {
      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      let latitude = 0, longitude = 0;
      if (locStatus === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        latitude = location.coords.latitude;
        longitude = location.coords.longitude;
      }

      const response = await api.post('/pointage/clock-in', {
        channel: 'qr_location',
        payload: { location_token: locationToken, latitude, longitude },
      });

      if (response.data?.success !== false) {
        setClockedAt(new Date());
        setStatus('confirmed');
      } else {
        setErrorMsg(response.data?.error || 'Erreur lors du pointage');
        setStatus('idle');
      }
    } catch (err) {
      const msg = err.response?.data?.error
        || err.response?.data?.message
        || 'Erreur reseau ou localisation';
      setErrorMsg(msg);
      setStatus('idle');
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

  const userName = employee?.first_name || user?.name?.split(' ')[0] || 'Collaborateur';
  const greeting = currentTime.getHours() < 12 ? 'Bonjour' : currentTime.getHours() < 18 ? 'Bon apres-midi' : 'Bonsoir';

  // ── CONFIRMED STATE ──
  if (status === 'confirmed') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.confirmedContainer}>
          <Animated.View style={[styles.successCircleOuter, { transform: [{ scale: successScale }] }]}>
            <View style={styles.successCircleInner}>
              <Ionicons name="checkmark" size={44} color={Colors.on_primary} />
            </View>
          </Animated.View>

          <Text style={styles.confirmedTitle}>Pointage enregistre !</Text>
          <Text style={styles.confirmedSub}>Bonne journee de travail</Text>

          <PremiumCard style={styles.confirmedCard}>
            <Text style={styles.confirmedTime}>{formatTime(clockedAt)}</Text>
            <Text style={styles.confirmedDate}>{formatDate(clockedAt)}</Text>
            <View style={styles.confirmedBadge}>
              <PremiumBadge status="present" label="En poste" />
            </View>
          </PremiumCard>

          <View style={styles.confirmedFooter}>
            <PremiumButton title="Compris" onPress={handleReset} size="lg" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── SCANNER STATE ──
  if (status === 'scanning') {
    return (
      <View style={styles.scannerFull}>
        <StatusBar style="light" />
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={handleBarcodeScanned}
        />

        {/* Dark overlay with cutout */}
        <View style={styles.scanOverlay}>
          {/* Top dark section */}
          <View style={styles.scanDarkSection}>
            <SafeAreaView>
              <View style={styles.scanHeader}>
                <TouchableOpacity
                  style={styles.scanBackBtn}
                  onPress={() => setStatus('idle')}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.scanTitle}>Scanner le QR</Text>
                <View style={{ width: 44 }} />
              </View>
            </SafeAreaView>
          </View>

          {/* Middle: dark | transparent | dark */}
          <View style={styles.scanMiddle}>
            <View style={styles.scanDarkSide} />
            <Animated.View style={[styles.scanFrame, { transform: [{ scale: pulseAnim }] }]}>
              {/* Corner markers */}
              <View style={[styles.corner, styles.cTL]} />
              <View style={[styles.corner, styles.cTR]} />
              <View style={[styles.corner, styles.cBL]} />
              <View style={[styles.corner, styles.cBR]} />
              {/* Scan line */}
              <View style={styles.scanLine} />
            </Animated.View>
            <View style={styles.scanDarkSide} />
          </View>

          {/* Bottom dark section */}
          <View style={[styles.scanDarkSection, styles.scanBottom]}>
            <Text style={styles.scanInstruction}>
              Placez le QR Code du site dans le cadre
            </Text>
            <TouchableOpacity style={styles.scanCancelBtn} onPress={() => setStatus('idle')}>
              <Text style={styles.scanCancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading overlay */}
        {status === 'loading' && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Pointage en cours...</Text>
          </View>
        )}
      </View>
    );
  }

  // ── IDLE STATE ──
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>{greeting},</Text>
          <Text style={styles.headerName}>{userName}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.liveDot} />
          <Text style={styles.liveTime}>{formatTime(currentTime)}</Text>
        </View>
      </View>

      <View style={styles.body}>
        {/* Status Illustration */}
        <View style={styles.statusSection}>
          <View style={styles.outerRing}>
            <View style={styles.middleRing}>
              <View style={styles.innerCircle}>
                <Ionicons name="finger-print-outline" size={52} color={Colors.primary_vibrant} />
              </View>
            </View>
          </View>
          <Text style={styles.statusText}>Vous n'avez pas encore pointe</Text>
          <Text style={styles.statusHint}>Scannez le QR code sur site pour pointer</Text>
        </View>

        {/* Action Area */}
        <View style={styles.actionArea}>
          {errorMsg && (
            <View style={styles.errorBanner}>
              <Ionicons name="warning-outline" size={16} color={Colors.status.error.text} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          <PremiumButton
            title="Scanner le QR Code"
            onPress={handleStartScan}
            size="lg"
            style={styles.mainBtn}
            icon={<Ionicons name="qr-code-outline" size={22} color={Colors.on_primary} />}
          />

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={Colors.on_surface_muted} />
            <Text style={styles.locationText}>Localisation active</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },

  // ── HEADER ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerGreeting: {
    ...Typography.body_lg,
    color: Colors.on_surface_variant,
  },
  headerName: {
    ...Typography.h1,
    fontSize: 28,
    color: Colors.on_surface,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface_container_lowest,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    ...Shadows.sm,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.status.success.vibrant,
    marginRight: 8,
  },
  liveTime: {
    ...Typography.body_md,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.on_surface,
  },

  // ── BODY ──
  body: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 100,
  },

  // ── STATUS SECTION ──
  statusSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  outerRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: Colors.primary_light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleRing: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: Colors.surface_container_low,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface_container_lowest,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  statusText: {
    ...Typography.body_lg,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.on_surface,
    marginTop: 28,
    textAlign: 'center',
  },
  statusHint: {
    ...Typography.body_md,
    color: Colors.on_surface_muted,
    marginTop: 6,
    textAlign: 'center',
  },

  // ── ACTION AREA ──
  actionArea: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  mainBtn: {
    width: '100%',
    ...Shadows.lg,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  locationText: {
    ...Typography.caption,
    color: Colors.on_surface_muted,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.status.error.bg,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: Radius.lg,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    ...Typography.caption,
    color: Colors.status.error.text,
    fontFamily: 'Inter_500Medium',
    flex: 1,
  },

  // ── SCANNER ──
  scannerFull: {
    flex: 1,
    backgroundColor: '#000',
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  scanDarkSection: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  scanBottom: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  scanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  scanBackBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanTitle: {
    ...Typography.title,
    color: '#fff',
  },
  scanMiddle: {
    flexDirection: 'row',
    height: SCANNER_SIZE,
  },
  scanDarkSide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  scanFrame: {
    width: SCANNER_SIZE,
    height: SCANNER_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderColor: Colors.primary_vibrant,
    borderWidth: 4,
  },
  cTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 20 },
  cTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 20 },
  cBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 20 },
  cBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 20 },
  scanLine: {
    position: 'absolute',
    top: '48%',
    left: 12,
    right: 12,
    height: 2,
    backgroundColor: Colors.primary_vibrant,
    borderRadius: 1,
    opacity: 0.6,
  },
  scanInstruction: {
    ...Typography.body_md,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  scanCancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  scanCancelText: {
    ...Typography.body_md,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...Typography.body_lg,
    color: '#fff',
    marginTop: 16,
  },

  // ── CONFIRMED ──
  confirmedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  successCircleOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.status.success.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  successCircleInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.status.success.vibrant,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  confirmedTitle: {
    ...Typography.h1,
    fontSize: 26,
    color: Colors.on_surface,
    textAlign: 'center',
  },
  confirmedSub: {
    ...Typography.body_lg,
    color: Colors.on_surface_variant,
    marginTop: 6,
  },
  confirmedCard: {
    alignItems: 'center',
    marginTop: 32,
    paddingVertical: 32,
    width: '100%',
  },
  confirmedTime: {
    ...Typography.display,
    fontSize: 56,
    color: Colors.primary_vibrant,
    letterSpacing: -2,
  },
  confirmedDate: {
    ...Typography.body_lg,
    color: Colors.on_surface_variant,
    marginTop: 4,
  },
  confirmedBadge: {
    marginTop: 24,
  },
  confirmedFooter: {
    width: '100%',
    marginTop: 40,
  },
});
