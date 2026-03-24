import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import Radius from '../../theme/radius';

export default function PremiumBadge({ status, label: customLabel }) {
  const statusMap = {
    present: { ...Colors.status.success, label: 'Présent' },
    late:    { ...Colors.status.warning, label: 'Retard' },
    absent:  { ...Colors.status.error,   label: 'Absent' },
    info:    { ...Colors.status.info,    label: 'Info' },
  };
  
  const config = statusMap[status] || statusMap.present;
  const label = customLabel || config.label;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    ...Typography.caption,
    fontFamily: 'Inter_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 10,
  }
});
