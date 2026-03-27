import React, { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform,
  TouchableOpacity, Modal, TextInput, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import PremiumButton from '../../src/components/ui/Button';
import PremiumInput from '../../src/components/ui/Input';
import PremiumCard from '../../src/components/ui/Card';
import useAuthStore from '../../src/store/authStore';
import Colors from '../../src/theme/colors';
import Typography from '../../src/theme/typography';
import Radius from '../../src/theme/radius';
import Shadows from '../../src/theme/shadows';
import { setManualBaseURL, getApiUrl } from '../../src/utils/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [manualUrl, setManualUrl] = useState(getApiUrl());
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    clearError();
    const success = await login(email, password);
    if (success) {
      router.replace('/(app)');
    }
  };

  const handleSaveSettings = async () => {
    await setManualBaseURL(manualUrl);
    setSettingsVisible(false);
    Alert.alert('OK', 'Configuration mise a jour.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.logoContainer}>
              <View style={styles.logoDot} />
              <Text style={styles.brandTitle}>
                Pointel<Text style={styles.brandAccent}>RH</Text>
              </Text>
            </View>
            <Text style={styles.heroTitle}>Bienvenue</Text>
            <Text style={styles.heroSubtitle}>
              Connectez-vous pour commencer votre journee
            </Text>
          </View>

          {/* Form */}
          <PremiumCard style={styles.formCard}>
            <PremiumInput
              label="Email professionnel"
              placeholder="votre@email.com"
              value={email}
              onChangeText={(t) => { setEmail(t); clearError(); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.passwordWrap}>
              <PremiumInput
                label="Mot de passe"
                placeholder="Votre mot de passe"
                value={password}
                onChangeText={(t) => { setPassword(t); clearError(); }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.on_surface_muted}
                />
              </TouchableOpacity>
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={Colors.status.error.text} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <PremiumButton
              title="Se connecter"
              onPress={handleLogin}
              isLoading={isLoading}
              disabled={!email || !password}
              size="lg"
              style={{ marginTop: 4 }}
            />
          </PremiumCard>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Mot de passe oublie ?</Text>
          </TouchableOpacity>

          {/* Dev Settings */}
          {__DEV__ && (
            <TouchableOpacity
              style={styles.devBtn}
              onPress={() => { setManualUrl(getApiUrl()); setSettingsVisible(true); }}
            >
              <Ionicons name="settings-outline" size={14} color={Colors.on_surface_muted} />
              <Text style={styles.devBtnText}>Config reseau</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Settings Modal */}
      <Modal visible={isSettingsVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Configuration API</Text>
            <Text style={styles.modalLabel}>URL de base (Kong Gateway)</Text>
            <TextInput
              style={styles.modalInput}
              value={manualUrl}
              onChangeText={setManualUrl}
              placeholder="http://172.26.32.102:8000/api"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setSettingsVisible(false)}
              >
                <Text style={styles.modalBtnTextCancel}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSave]}
                onPress={handleSaveSettings}
              >
                <Text style={styles.modalBtnTextSave}>Appliquer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  hero: {
    marginBottom: 32,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  logoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary_vibrant,
    marginRight: 8,
  },
  brandTitle: {
    ...Typography.h2,
    color: Colors.on_surface,
  },
  brandAccent: {
    color: Colors.primary_vibrant,
  },
  heroTitle: {
    ...Typography.display,
    fontSize: 36,
    color: Colors.on_surface,
  },
  heroSubtitle: {
    ...Typography.body_lg,
    color: Colors.on_surface_variant,
    marginTop: 8,
    lineHeight: 24,
  },
  formCard: {
    padding: 24,
  },
  passwordWrap: {
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: 16,
    top: 34,
    zIndex: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.status.error.bg,
    padding: 12,
    borderRadius: Radius.md,
    marginBottom: 16,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.status.error.text,
    fontFamily: 'Inter_500Medium',
    flex: 1,
  },
  forgotBtn: {
    alignItems: 'center',
    marginTop: 28,
  },
  forgotText: {
    ...Typography.body_md,
    color: Colors.primary_vibrant,
    fontFamily: 'Inter_600SemiBold',
  },
  devBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
    opacity: 0.5,
  },
  devBtnText: {
    ...Typography.caption,
    color: Colors.on_surface_muted,
    textDecorationLine: 'underline',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface_container_lowest,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.surface_container_high,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.on_surface,
    marginBottom: 16,
  },
  modalLabel: {
    ...Typography.caption,
    color: Colors.on_surface_variant,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalInput: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.surface_container,
    padding: 14,
    ...Typography.body_md,
    color: Colors.on_surface,
    marginBottom: 24,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    padding: 14,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  modalBtnCancel: {
    backgroundColor: Colors.surface_container_low,
  },
  modalBtnSave: {
    backgroundColor: Colors.primary_vibrant,
    ...Shadows.sm,
  },
  modalBtnTextCancel: {
    ...Typography.body_md,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.on_surface_variant,
  },
  modalBtnTextSave: {
    ...Typography.body_md,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.on_primary,
  },
});
