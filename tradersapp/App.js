import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { TradeProvider } from './src/context/TradeContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <TradeProvider>
        <StatusBar style="dark" />
        <AppNavigator />
      </TradeProvider>
    </SafeAreaProvider>
  );
}
