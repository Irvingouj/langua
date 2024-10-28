import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { Button } from "react-native";
import {
	RealtimeContext,
	RealtimeProvider,
} from "@/components/context/RealtimeContext";
import { REALTIME_URL } from "@/util/Constant";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const [loaded] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
	});

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	const router = useRouter();
	const navigateToChat = () => {
		router.push("/(chat)/home");
	};

	if (!loaded) {
		return null;
	}

	return (
		<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
			<RealtimeProvider url={REALTIME_URL}>
				<Stack>
					<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
					<Stack.Screen name="(chat)" options={{ headerShown: false }} />
					<Stack.Screen name="+not-found" />
				</Stack>
				<Button title="Go to Chat" onPress={navigateToChat} />
			</RealtimeProvider>
		</ThemeProvider>
	);
}
