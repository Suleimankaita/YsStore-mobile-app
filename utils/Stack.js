import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView,Platform } from 'react-native';
import 'react-native-reanimated';
import { PaystackProvider } from 'react-native-paystack-webview';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSelector } from 'react-redux';
import { GetRouter } from '@/Features/Funcslice';
import { GestureHandlerRootView } from "react-native-gesture-handler";
export const unstable_settings = {
};


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const route=useSelector(GetRouter)
  return (
      
    <GestureHandlerRootView style={{ flex: 1 ,paddingTop: Platform.OS === 'ios' ? 0 : "7%"}}  >

    <PaystackProvider publicKey="pk_test_162884f06e28545f737d29fe112e0fd09da43cac">
      
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }}  />
        <Stack.Screen name="(Order-tracking)/[id]" options={{ headerShown: false,title:"Cart" }} />
        <Stack.Screen name="(Cart)/Cart" options={{ headerShown: false,title:"Cart" }} />
        <Stack.Screen name="(screens)" options={{ headerShown: false }} />
        <Stack.Screen name="(Checkout)" options={{ headerShown: false }} />
        <Stack.Screen name="(shop)/Shop" options={{ headerShown: false }} />
        <Stack.Screen name="chart/storecharts/[StoreId]" options={{ headerShown: false }} />
         <Stack.Screen name="(PDP)" options={{ headerShown: false ,title:route}} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
    </PaystackProvider>
    </GestureHandlerRootView>
  );
}
