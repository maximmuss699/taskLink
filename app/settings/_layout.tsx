import { Stack } from 'expo-router';

export default function SettingsLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            {/* Все экраны внутри settings будут наследовать эти настройки */}
        </Stack>
    );
}