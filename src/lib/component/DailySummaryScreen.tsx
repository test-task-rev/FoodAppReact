import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const DailySummaryScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Daily Summary Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});
