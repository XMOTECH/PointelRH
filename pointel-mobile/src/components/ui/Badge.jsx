import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import Radius from '../../theme/radius';

export default function PremiumBadge({ status, label: customLabel, size = 'md' }) {
  const statusMap = {
    present: { ...Colors.status.success, label: 'Present' },
    late:    { ...Colors.status.warning, label: 'Retard' },
    absent:  { ...Colors.status.error,   label: 'Absent' },
    info:    { ...Colors.status.info,    label: 'Info' },
  };

  const config = statusMap[status] || statusMap.present;
  const label = customLabel || config.label;
  const isSmall = size === 'sm';

  return (
    <View style={[
      styles.badge,
      { backgroundColor: config.bg },
      isSmall && styles.badgeSm,
    ]}>
      <Text style={[
        styles.text,
        { color: config.text },
        isSmall && styles.textSm,
      ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  text: {
    ...Typography.caption,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 10,
  },
  textSm: {
    fontSize: 9,
  },
});
