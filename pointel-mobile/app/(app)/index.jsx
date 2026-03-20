import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Button from '../../src/components/ui/Button';
import Card from '../../src/components/ui/Card';
import Badge from '../../src/components/ui/Badge';
import { Colors } from '../../src/theme/colors';
import { Spacing } from '../../src/theme/spacing';
import { Typography } from '../../src/theme/typography';
import { Radius } from '../../src/theme/radius';
import { formatTime, formatDate } from '../../src/utils/formatters';

export default function ClockInScreen() {
  const [status, setStatus] = useState('idle'); // idle | loading | confirmed
  const [clockedAt, setClockedAt] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();

  const handleBarcodeScanned = ({ type, data }) => {
    if (status !== 'idle') return;
    setStatus('loading');
    // Le QR code est scanné (data contient l'ID employe par exemple)
    setTimeout(() => {
      setClockedAt(new Date());
      setStatus('confirmed');
    }, 1200);
  };

  const handleClockIn = () => {
    setStatus('loading');
    // Automatique manuel (fallback UI)
    setTimeout(() => {
      setClockedAt(new Date());
      setStatus('confirmed');
    }, 1200);
  };

  const handleReset = () => {
    setStatus('idle');
    setClockedAt(null);
  };

  if (status === 'confirmed') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Card style={styles.confirmCard}>
            <View style={styles.confirmIcon}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
            <Text style={styles.confirmTitle}>Pointage enregistre</Text>
            <Text style={styles.confirmTime}>{formatTime(clockedAt)}</Text>
            <Text style={styles.confirmDate}>{formatDate(clockedAt)}</Text>
            <View style={{ marginTop: Spacing.lg }}>
              <Badge status="present" />
            </View>
          </Card>
          <Button
            title="Nouveau pointage"
            variant="secondary"
            onPress={handleReset}
            style={{ marginTop: Spacing.md }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Bonjour, User</Text>
          <Text style={styles.date}>Pret a commencer la journee ?</Text>
        </View>

        <Card style={styles.qrCard}>
          {!permission ? (
            <View style={styles.qrPlaceholder}>
              <Text style={styles.qrText}>Chargement caméra...</Text>
            </View>
          ) : !permission.granted ? (
            <View style={styles.qrPlaceholder}>
              <Text style={[styles.qrText, { textAlign: 'center', marginBottom: Spacing.md }]}>
                Autorisation de la caméra requise.
              </Text>
              <Button title="Autoriser" onPress={requestPermission} />
            </View>
          ) : (
            <View style={styles.cameraContainer}>
              {status === 'idle' && (
                <CameraView
                  style={StyleSheet.absoluteFillObject}
                  facing="back"
                  barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                  }}
                  onBarcodeScanned={handleBarcodeScanned}
                />
              )}
            </View>
          )}
        </Card>

        <View style={styles.actions}>
          <Button
            title={status === 'loading' ? 'Enregistrement...' : 'Pointer mon arrivee'}
            onPress={handleClockIn}
            isLoading={status === 'loading'}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.light,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: Spacing.xl,
  },
  greeting: {
    ...Typography.heading,
    color: Colors.neutral.dark,
  },
  date: {
    ...Typography.body,
    color: Colors.neutral.medium,
    marginTop: Spacing.xs,
  },
  qrCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: Colors.neutral.light,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    borderStyle: 'dashed',
    borderRadius: Radius.md,
  },
  cameraContainer: {
    width: 200,
    height: 200,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.neutral.dark,
  },
  qrText: {
    ...Typography.caption,
    color: Colors.neutral.medium,
  },
  actions: {
    marginBottom: Spacing.xl,
  },
  confirmCard: {
    alignItems: 'center',
    padding: Spacing.xxl,
    marginTop: Spacing.xxl,
  },
  confirmIcon: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    backgroundColor: Colors.status.present.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  checkmark: {
    fontSize: 32,
    color: Colors.status.present.text,
    fontWeight: 'bold',
  },
  confirmTitle: {
    ...Typography.heading,
    color: Colors.neutral.dark,
    marginBottom: Spacing.sm,
  },
  confirmTime: {
    ...Typography.display,
    color: Colors.brand.primary,
  },
  confirmDate: {
    ...Typography.body,
    color: Colors.neutral.medium,
    marginTop: Spacing.xs,
    textTransform: 'capitalize',
  },
});

