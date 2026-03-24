import React from 'react';
import { View, StyleSheet } from 'react-native';
import Colors from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';

export default function Card({ children, style, showAccent = true }) {
  return (
    <View style={[styles.card, style]}>
      {showAccent && <View style={styles.accent} />}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface_container_lowest,
    borderRadius: 16, // lg roundedness
    padding: 20,
    shadowColor: Colors.on_surface,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04, // Ambient Shadow (4%)
    shadowRadius: 20,
    elevation: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 20, // Start below the top padding for elegance or just full? Spec says "top-left corner"
    bottom: 20, // Keep it centered vertically for an "architectural" look
    width: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  }
});
