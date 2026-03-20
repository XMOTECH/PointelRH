import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../../theme/colors';
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
  const isPrimary = variant === 'primary';
  const bgColor = isPrimary ? Colors.brand.primary : Colors.brand.light;
  const textColor = isPrimary ? Colors.neutral.white : Colors.brand.primary;

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        { backgroundColor: disabled ? Colors.neutral.border : bgColor },
        style
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    ...Typography.label,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  }
});
