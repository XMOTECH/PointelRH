import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import Radius from '../../theme/radius';
import Shadows from '../../theme/shadows';

export default function PremiumButton({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  style,
  icon,
  size = 'md',
}) {
  const isOutline = variant === 'outline';
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.button,
        styles[variant] || styles.primary,
        !isOutline && Shadows.sm,
        size === 'lg' && styles.buttonLg,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={isOutline ? Colors.primary : Colors.on_primary} />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[
            styles.text,
            size === 'lg' && styles.textLg,
            isOutline ? styles.textOutline : styles.textPrimary,
          ]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Radius.full,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLg: {
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  primary: {
    backgroundColor: Colors.primary_vibrant,
  },
  success: {
    backgroundColor: Colors.status.success.vibrant,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.surface_container,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    ...Typography.body_lg,
    fontFamily: 'Inter_600SemiBold',
  },
  textPrimary: {
    color: Colors.on_primary,
  },
  textOutline: {
    color: Colors.primary,
  },
  textLg: {
    fontSize: 17,
  },
  iconContainer: {
    marginRight: 10,
  },
  disabled: {
    opacity: 0.45,
  },
});
