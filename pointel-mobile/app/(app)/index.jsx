import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/ui/Button';
import Card from '../../src/components/ui/Card';
import Badge from '../../src/components/ui/Badge';
import Colors from '../../src/theme/colors';
import { formatTime, formatDate } from '../../src/utils/formatters';
import api from '../../src/utils/api';

export default function ClockInScreen() {
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
      // 1. Get GPS
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // 2. Call API
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
    if (status !== 'idle') return;
    handleClockIn(data);
  };

  const handleReset = () => {
    setStatus('idle');
    setClockedAt(null);
    setErrorMsg(null);
  };

  if (status === 'confirmed') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.displayTitle}>Pointage</Text>
            <Text style={styles.displaySubtitle}>validé avec succès</Text>
          </View>

          <Card style={styles.confirmCard}>
            <View style={styles.confirmIcon}>
              <Ionicons name="checkmark-circle" size={48} color={Colors.status.success.text} />
            </View>
            <Text style={styles.confirmTime}>{formatTime(clockedAt)}</Text>
            <Text style={styles.confirmDate}>{formatDate(clockedAt)}</Text>
            <View style={{ marginTop: 24 }}>
              <Badge status="present" />
            </View>
          </Card>

          <View style={styles.footer}>
            <Button
              title="Terminer"
              onPress={handleReset}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Bonjour, User</Text>
          <View style={styles.asymmetricRow}>
             <Text style={styles.date}>Prêt à commencer votre journée ?</Text>
          </View>
        </View>

        <Card style={styles.qrCard}>
          {!permission || locationPermission === null ? (
            <ActivityIndicator color={Colors.primary} />
          ) : !permission.granted || !locationPermission ? (
            <View style={styles.qrPlaceholder}>
              <Ionicons name="alert-circle-outline" size={48} color={Colors.status.error.text} />
              <Text style={[styles.qrText, { marginTop: 16, textAlign: 'center' }]}>
                Autorisation caméra et localisation requise
              </Text>
              <Button title="Autoriser" onPress={requestPermission} style={{ marginTop: 16 }} />
            </View>
          ) : (
            <View style={styles.cameraContainer}>
              {status === 'idle' && (
                <CameraView
                  style={StyleSheet.absoluteFillObject}
                  facing="back"
                  barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                  onBarcodeScanned={handleBarcodeScanned}
                />
              )}
              {status === 'loading' && (
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }]}>
                  <ActivityIndicator size="large" color="#fff" />
                  <Text style={{ color: '#fff', marginTop: 16, fontFamily: 'Inter_500Medium' }}>Vérification...</Text>
                </View>
              )}
            </View>
          )}
        </Card>

        {errorMsg && (
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={18} color={Colors.status.error.text} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <Button
            title={status === 'loading' ? 'Enregistrement...' : 'Pointer mon arrivée'}
            onPress={() => handleClockIn()}
            isLoading={status === 'loading'}
            disabled={!locationPermission}
          />
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 40,
  },
  greeting: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 32,
    color: Colors.on_surface,
    letterSpacing: -1,
  },
  asymmetricRow: {
    marginTop: 8,
    marginLeft: 40, // Asymmetric offset
  },
  date: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.on_surface_variant,
    lineHeight: 24,
  },
  qrCard: {
    aspectRatio: 1,
    padding: 0, // Edge-to-edge camera or centered? Let's go with centered placeholder look
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraContainer: {
    width: '80%',
    aspectRatio: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: Colors.surface_container,
  },
  qrPlaceholder: {
    alignItems: 'center',
  },
  qrText: {
    fontFamily: 'Inter_500Medium',
    color: Colors.on_surface_variant,
  },
  actions: {
    marginBottom: 80, // Space for tab bar
  },
  displayTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 40,
    color: Colors.on_surface,
    textAlign: 'center',
  },
  displaySubtitle: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 24,
    color: Colors.on_surface_variant,
    textAlign: 'center',
    marginTop: -8,
  },
  confirmCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  confirmIcon: {
    marginBottom: 24,
  },
  confirmTime: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 64,
    color: Colors.primary,
    letterSpacing: -2,
  },
  confirmDate: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: Colors.on_surface_variant,
    marginTop: 4,
  },
  footer: {
    marginBottom: 80,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.status.error.bg,
    padding: 12,
    borderRadius: 16,
    marginVertical: 16,
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.status.error.text,
    marginLeft: 8,
    flex: 1,
  }
});

