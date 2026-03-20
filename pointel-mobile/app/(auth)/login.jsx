import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '../../src/components/ui/Button';
import Input from '../../src/components/ui/Input';
import useAuthStore from '../../src/store/authStore';
import { Colors } from '../../src/theme/colors';
import { Spacing } from '../../src/theme/spacing';
import { Typography } from '../../src/theme/typography';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setAuth({ id: 1, name: 'Demo User' }, 'fake-jwt-token-123');
      router.replace('/(app)');
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Bienvenue</Text>
          <Text style={styles.subtitle}>Connectez-vous à PointelRH</Text>
        </View>

        <View style={styles.form}>
          <Input 
            label="Email" 
            placeholder="votre@email.com" 
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
          <Button 
            title="Se connecter" 
            onPress={handleLogin} 
            isLoading={isLoading} 
            style={{ marginTop: Spacing.md }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xxl,
  },
  title: {
    ...Typography.display,
    color: Colors.neutral.dark,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.neutral.medium,
  },
  form: {
    width: '100%',
  }
});
