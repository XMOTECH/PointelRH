import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import useAuthStore from '../src/store/authStore';
import { getToken, deleteToken } from '../src/utils/storage';
import api from '../src/utils/api';
import Colors from '../src/theme/colors';

export default function Index() {
  const [isReady, setIsReady] = useState(false);
  const { isAuthenticated, setAuth, logout } = useAuthStore();

  useEffect(() => {
    const checkToken = async () => {
      const token = await getToken('jwt_token');
      if (token) {
        try {
          // Attempt to fetch real user info from Kong
          const response = await api.get('/auth/me');
          const userData = response.data.data.user;
          setAuth(userData, token);
        } catch (err) {
          console.warn('Splash: Token verification failed', err.message);
          // If network error or 401, clear stale token
          // In development, if network is down, we might want to stay on login 
          // rather than using mock user
          await deleteToken('jwt_token');
          setAuth(null, null); 
        }
      }
      setIsReady(true);
    };
    checkToken();
  }, [setAuth]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surface }}>
        <ActivityIndicator size="large" color={Colors.primary_vibrant} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  } else {
    return <Redirect href="/(auth)/login" />;
  }
}
