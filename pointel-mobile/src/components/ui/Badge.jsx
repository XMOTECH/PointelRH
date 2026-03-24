import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import { Radius } from '../../theme/radius';

export default function Badge({ status }) {
  // mapping status to our new config
  const statusMap = {
    present: Colors.status.success,
    late:    Colors.status.warning,
    absent:  Colors.status.error,
  };
  
  const config = statusMap[status] || Colors.status.success;
  const label = status === 'present' ? 'Présent' : status === 'late' ? 'Retard' : 'Absent';

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999, // full organic roundedness
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  }
});
