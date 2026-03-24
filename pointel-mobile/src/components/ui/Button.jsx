import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import Colors from '../../theme/colors';
import Spacing from '../../theme/spacing';
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
  size = 'md'
}) {
  const isVibrant = variant === 'primary' || variant === 'success';

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      style={[
        styles.button,
        styles[variant],
        isVibrant && Shadows.sm,
        size === 'lg' && styles.buttonLg,
        disabled && styles.disabled,
        style
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' ? Colors.primary : Colors.on_primary} />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[
            styles.text,
            size === 'lg' && styles.textLg,
            variant === 'outline' ? styles.textOutline : styles.textPrimary
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
    fontSize: 18,
  },
  iconContainer: {
    marginRight: 8,
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: Colors.surface_container_high,
  }
});
