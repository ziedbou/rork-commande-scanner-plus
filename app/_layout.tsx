import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAppStore } from "@/store/app-store";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Retour" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="barcode-scanner" options={{ presentation: "modal" }} />
      <Stack.Screen name="order-details" options={{ presentation: "card" }} />
      <Stack.Screen name="order-selection" options={{ presentation: "card" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const { loadFromStorage } = useAppStore();

  useEffect(() => {
    const initializeApp = async () => {
      await loadFromStorage();
      SplashScreen.hideAsync();
    };

    initializeApp();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RootLayoutNav />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}