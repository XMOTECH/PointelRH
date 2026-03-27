import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold
} from '@expo-google-fonts/space-grotesk';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import Colors from '../src/theme/colors';
import Typography from '../src/theme/typography';
import { initApi } from '../src/utils/api';

export default function RootLayout() {
  const [apiReady, setApiReady] = useState(false);

  useEffect(() => {
    initApi().then(() => setApiReady(true));
  }, []);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  if (!fontsLoaded || !apiReady) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashBrand}>Pointel</Text>
        <Text style={styles.splashSuffix}>RH</Text>
        <ActivityIndicator size="small" color={Colors.primary_vibrant} style={{ marginTop: 32 }} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
    </>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  splashBrand: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.on_surface,
    letterSpacing: -1,
  },
  splashSuffix: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.primary_vibrant,
    marginTop: -8,
    letterSpacing: -1,
  },
});
