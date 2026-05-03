import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import "react-native-reanimated";
import { PaystackProvider } from "react-native-paystack-webview";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSelector } from "react-redux";
import { GetRouter } from "@/Features/Funcslice";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import PersistLogin from "@/Features/api/Persistence";
import Auth from "@/utils/Auth";
import { useEffect } from "react";

export const unstable_settings = {};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const route = useSelector(GetRouter);
  const name="suleiman"
  useEffect(()=>{

    // alert(name.charAt(0).toUpperCase()+name.slice(1,name.length))
    // alert(name.slice(0,1).toUpperCase())
    
  },[])
  Auth()
  return (
    <GestureHandlerRootView
      style={{
        flex: 1,
        paddingTop: Platform.OS === "ios" ? 0 : "7%",
      }}
    >
      <PaystackProvider publicKey="pk_test_162884f06e28545f737d29fe112e0fd09da43cac">
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <PersistLogin>
            {/* <Auth /> */}
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false,title:'Home' }} />
              <Stack.Screen
                name="(Order-tracking)/[id]"
                options={{ headerShown: false, title: "Cart" }}
              />
              <Stack.Screen
                name="(Cart)/Cart"
                options={{ headerShown: false, title: "Cart" }}
              />
              <Stack.Screen
                name="(Orders)"
                options={{ headerShown: false, title: "Order" }}
              />
              <Stack.Screen
                name="(HelpCenter)"
                options={{ headerShown: false, title: "HelpCenter" }}
              />
              <Stack.Screen
                name="(Wallet)"
                options={{ headerShown: false, title: "Wallet" }}
              />
              <Stack.Screen
                name="(Security)"
                options={{ headerShown: false, title: "Security" }}
              />
              <Stack.Screen
                name="(Topay)"
                options={{ headerShown: true, title: `${route?.charAt(0)?.toUpperCase()+route?.slice(1,route?.length)}` }}
              />
              <Stack.Screen name="(screens)" options={{ headerShown: false }} />
              <Stack.Screen name="(Checkout)" options={{ headerShown: false }} />
              <Stack.Screen name="(shop)/Shop" options={{ headerShown: false }} />
              <Stack.Screen
                name="chart/storecharts/[StoreId]"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="(PDP)"
                options={{ headerShown: false, title: route }}
              />
              <Stack.Screen
                name="modal"
                options={{ presentation: "modal", title: "Modal" }}
              />
            </Stack>
          </PersistLogin>
          <StatusBar style="auto" />
        </ThemeProvider>
      </PaystackProvider>
    </GestureHandlerRootView>
  );
}