import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import useAuthStore from '../src/store/authStore';
import { getToken } from '../src/utils/storage';
import Colors from '../src/theme/colors';

export default function Index() {
  const [isReady, setIsReady] = useState(false);
  const { isAuthenticated, setAuth } = useAuthStore();

  useEffect(() => {
    const checkToken = async () => {
      const token = await getToken('jwt_token');
      if (token) {
        setAuth({ id: 1, name: 'User' }, token);
      }
      setIsReady(true);
    };
    checkToken();
  }, [setAuth]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  } else {
    return <Redirect href="/(auth)/login" />;
  }
}
