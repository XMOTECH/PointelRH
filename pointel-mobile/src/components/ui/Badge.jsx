import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import { Radius } from '../../theme/radius';

export default function Badge({ status }) {
  // status: 'present', 'late', 'absent'
  const config = Colors.status[status] || Colors.status.present;
  const label = status === 'present' ? 'Présent' : status === 'late' ? 'Retard' : 'Absent';

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    ...Typography.caption,
    fontFamily: 'Inter_600SemiBold',
  }
});
