// app/layout.tsx

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { configureReanimatedLogger } from 'react-native-reanimated';

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary,
} from 'expo-router';

configureReanimatedLogger({
    strict: false,
})

export const unstable_settings = {
    // Ensure that reloading on `/modal` keeps a back button present.
    initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = useFonts({
        'mon': require('../assets/fonts/Montserrat-Regular.ttf'),
        'mon-sb': require('../assets/fonts/Montserrat-SemiBold.ttf'),
        'mon-b': require('../assets/fonts/Montserrat-Bold.ttf'),
        'moderna': require('../assets/fonts/moderna.ttf'),
        'modernaRegular': require('../assets/fonts/MuseoModerno-Regular.ttf'),
    });

    // Expo Router uses Error Boundaries to catch errors in the navigation tree.
    useEffect(() => {
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return <RootLayoutNav />;
}



function RootLayoutNav() {
    const router = useRouter();
    return (
        <Stack screenOptions={{ headerShown: false }}>

            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />


            <Stack.Screen
                name="(modals)/login"
                options={{
                    title: 'Log in or Sign up',
                    headerTitleStyle: {
                        fontFamily: 'mon-sb',
                    },
                    presentation: 'modal',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name='close' size={28} color={'#000'} />
                        </TouchableOpacity>
                    )
                }}
            />
            <Stack.Screen name='listing/[id]' options={{ headerTitle: '' }} />
            <Stack.Screen
                name='(modals)/booking'
                options={{
                    presentation: 'transparentModal',
                    animation: 'fade',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name='close' size={28} color={'#000'} />
                        </TouchableOpacity>
                    )
                }}
            />
        </Stack>
    );
}
