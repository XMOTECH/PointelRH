import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '../../src/components/ui/Button';
import Input from '../../src/components/ui/Input';
import Card from '../../src/components/ui/Card';
import useAuthStore from '../../src/store/authStore';
import Colors from '../../src/theme/colors';
import { Spacing } from '../../src/theme/spacing';
import { Typography } from '../../src/theme/typography';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();

  const handleLogin = async () => {
    const success = await login(email, password);
    if (success) {
      router.replace('/(app)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Bienvenue</Text>
          <View style={styles.asymmetricRow}>
            <Text style={styles.subtitle}>Connectez-vous à votre espace PointelRH</Text>
          </View>
        </View>

        <Card style={styles.formCard}>
          <Input 
            label="Email professionnelle" 
            placeholder="m.dubois@pointel.sn" 
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input 
            label="Mot de passe" 
            placeholder="••••••••" 
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          {error && <Text style={styles.errorText}>{error}</Text>}

          <Button 
            title="Se connecter" 
            onPress={handleLogin} 
            isLoading={isLoading} 
            style={{ marginTop: 12 }}
          />
        </Card>
        
        <TouchableOpacity style={styles.forgotPass}>
          <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
        </TouchableOpacity>
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
    marginBottom: 48,
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 40,
    color: Colors.on_surface,
    letterSpacing: -1.5,
  },
  asymmetricRow: {
    marginLeft: 32,
    marginTop: 4,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.on_surface_variant,
    lineHeight: 24,
  },
  formCard: {
    padding: 24,
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.status.error.text,
    backgroundColor: Colors.status.error.bg,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  forgotPass: {
    alignItems: 'center',
    marginTop: 32,
  },
  forgotText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.primary,
  }
});
