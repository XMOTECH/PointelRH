import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Colors from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import { Radius } from '../../theme/radius';

export default function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  isLoading = false, 
  disabled = false,
  style 
}) {
  const getStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          button: { backgroundColor: Colors.surface_container_highest },
          text: { color: Colors.primary }
        };
      case 'tertiary':
        return {
          button: { backgroundColor: 'transparent' },
          text: { color: Colors.primary }
        };
      case 'primary':
      default:
        return {
          button: { backgroundColor: Colors.primary },
          text: { color: Colors.on_primary }
        };
    }
  };

  const variantStyles = getStyles();

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        variantStyles.button,
        disabled && { backgroundColor: Colors.surface_container, opacity: 0.5 },
        style
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator color={variantStyles.text.color} />
      ) : (
        <Text style={[styles.text, variantStyles.text]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12, // lg roundedness (~0.75rem for premium feel)
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    letterSpacing: -0.2,
  }
});
