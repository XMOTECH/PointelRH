import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import Colors from '../../theme/colors';
import Spacing from '../../theme/spacing';
import Typography from '../../theme/typography';
import Radius from '../../theme/radius';

export default function PremiumInput({ label, error, ...props }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputFocused,
        error && styles.inputError
      ]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.on_surface_variant + '80'}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    ...Typography.label,
    color: Colors.on_surface_variant,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.surface_container,
    paddingHorizontal: 16,
    height: 56,
    justifyContent: 'center',
  },
  inputFocused: {
    borderColor: Colors.primary_vibrant,
    backgroundColor: Colors.surface_container_lowest,
  },
  inputError: {
    borderColor: Colors.status.error.vibrant,
  },
  input: {
    ...Typography.body_lg,
    color: Colors.on_surface,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.status.error.text,
    marginTop: 6,
    marginLeft: 4,
  }
});
