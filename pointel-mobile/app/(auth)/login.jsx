import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Modal, TextInput, Alert } from 'react-native';

import PremiumButton from '../../src/components/ui/Button';
import PremiumInput from '../../src/components/ui/Input';
import PremiumCard from '../../src/components/ui/Card';
import useAuthStore from '../../src/store/authStore';
import Colors from '../../src/theme/colors';
import Typography from '../../src/theme/typography';
import Radius from '../../src/theme/radius';
import { setManualBaseURL, getApiUrl } from '../../src/utils/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [manualUrl, setManualUrl] = useState(getApiUrl());
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();

  const handleLogin = async () => {
    const success = await login(email, password);
    if (success) {
      router.replace('/(app)');
    }
  };

  const handleSaveSettings = async () => {
    await setManualBaseURL(manualUrl);
    setSettingsVisible(false);
    Alert.alert('Succès', 'Configuration réseau mise à jour. Relancez l\'app si nécessaire.');
  };
 
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={styles.brandTitle}>Pointel<Text style={{color: Colors.primary_vibrant}}>RH</Text></Text>
          <Text style={styles.welcomeText}>Bienvenue,</Text>
          <Text style={styles.subtitle}>Connectez-vous pour commencer votre journée</Text>
        </View>

        <PremiumCard style={styles.formCard}>
          <PremiumInput 
            label="Email professionnelle" 
            placeholder="votre@email.sn" 
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <PremiumInput 
            label="Mot de passe" 
            placeholder="••••••••" 
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <PremiumButton 
            title="Se connecter" 
            onPress={handleLogin} 
            isLoading={isLoading} 
            size="lg"
            style={{ marginTop: 8 }}
          />
        </PremiumCard>
        
        <TouchableOpacity style={styles.forgotPass}>
          <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingsToggle}
          onPress={() => {
            setManualUrl(getApiUrl());
            setSettingsVisible(true);
          }}
        >
          <Text style={styles.settingsText}>Paramètres réseau (Dev)</Text>
        </TouchableOpacity>

        <Modal
          visible={isSettingsVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Configuration API</Text>
              <Text style={styles.modalLabel}>URL de base (Kong Gateway)</Text>
              <TextInput 
                style={styles.modalInput}
                value={manualUrl}
                onChangeText={setManualUrl}
                placeholder="http://192.168.x.x:8000/api"
                autoCapitalize="none"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalBtn, { backgroundColor: Colors.surface_variant }]}
                  onPress={() => setSettingsVisible(false)}
                >
                  <Text style={styles.modalBtnText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalBtn, { backgroundColor: Colors.primary }]}
                  onPress={handleSaveSettings}
                >
                  <Text style={[styles.modalBtnText, { color: 'white' }]}>Appliquer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
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
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 40,
  },
  brandTitle: {
    ...Typography.h1,
    fontSize: 28,
    marginBottom: 32,
    color: Colors.on_surface,
  },
  welcomeText: {
    ...Typography.h1,
    fontSize: 34,
    color: Colors.on_surface,
    letterSpacing: -1,
  },
  subtitle: {
    ...Typography.body_lg,
    color: Colors.on_surface_variant,
    marginTop: 8,
    lineHeight: 24,
  },
  formCard: {
    padding: 24,
  },
  errorContainer: {
    backgroundColor: Colors.status.error.bg,
    padding: 12,
    borderRadius: Radius.md,
    marginBottom: 20,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.status.error.text,
    textAlign: 'center',
    fontFamily: 'Inter_600SemiBold',
  },
  forgotPass: {
    alignItems: 'center',
    marginTop: 32,
  },
  forgotText: {
    ...Typography.body_md,
    color: Colors.primary_vibrant,
    fontFamily: 'Inter_600SemiBold',
  },
  settingsToggle: {
    alignItems: 'center',
    marginTop: 24,
    opacity: 0.6,
  },
  settingsText: {
    ...Typography.caption,
    color: Colors.on_surface_variant,
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  modalTitle: {
    ...Typography.h2,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    ...Typography.caption,
    color: Colors.on_surface_variant,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: Colors.surface_variant,
    borderRadius: Radius.md,
    padding: 12,
    ...Typography.body_md,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    padding: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  modalBtnText: {
    ...Typography.body_md,
    fontFamily: 'Inter_600SemiBold',
  }
});
