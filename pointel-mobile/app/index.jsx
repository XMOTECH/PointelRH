import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import useAuthStore from '../src/store/authStore';
import { getToken, deleteToken } from '../src/utils/storage';
import api from '../src/utils/api';
import Colors from '../src/theme/colors';

export default function Index() {
  const [isReady, setIsReady] = useState(false);
  const { isAuthenticated, setAuth, fetchEmployee } = useAuthStore();

  useEffect(() => {
    const checkToken = async () => {
      const token = await getToken('jwt_token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          // Handle both { data: { user } } and { data: { data: { user } } }
          const userData =
            response.data?.data?.user
            || response.data?.user
            || response.data?.data
            || response.data;
          await setAuth(userData, token);
          // Fetch employee profile after restoring session
          await fetchEmployee();
        } catch (err) {
          console.warn('[Splash] Token expired or invalid:', err.message);
          await deleteToken('jwt_token');
          await setAuth(null, null);
        }
      }
      setIsReady(true);
    };
    checkToken();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.container}>
        <Text style={styles.brand}>Pointel<Text style={styles.accent}>RH</Text></Text>
        <ActivityIndicator size="large" color={Colors.primary_vibrant} style={{ marginTop: 24 }} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  } else {
    return <Redirect href="/(auth)/login" />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  brand: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.on_surface,
    letterSpacing: -0.5,
  },
  accent: {
    color: Colors.primary_vibrant,
  },
});
