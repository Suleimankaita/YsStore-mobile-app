import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { PaystackProvider } from 'react-native-paystack-webview';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSelector } from 'react-redux';
import { GetRouter } from '@/Features/Funcslice';

export const unstable_settings = {
  anchor: '(tabs)',
};


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const route=useSelector(GetRouter)
  return (
    <PaystackProvider publicKey="pk_test_162884f06e28545f737d29fe112e0fd09da43cac">

    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(screens)" options={{ headerShown: false }} />
        <Stack.Screen name="(PDP)" options={{ headerShown: false ,title:route}} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
    </PaystackProvider>
  );
}
