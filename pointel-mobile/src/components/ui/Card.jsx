import React from 'react';
import { View, StyleSheet } from 'react-native';
import Colors from '../../theme/colors';
import Radius from '../../theme/radius';
import Shadows from '../../theme/shadows';

export default function PremiumCard({ children, style, variant = 'elevated' }) {
  return (
    <View style={[
      styles.card,
      variant === 'elevated' && Shadows.sm,
      variant === 'outlined' && styles.outlined,
      variant === 'flat' && styles.flat,
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface_container_lowest,
    borderRadius: Radius.xl,
    padding: 24,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.surface_container,
    shadowColor: 'transparent',
    elevation: 0,
  },
  flat: {
    backgroundColor: Colors.surface_container_low,
    shadowColor: 'transparent',
    elevation: 0,
  },
});
