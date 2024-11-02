// app/(tabs)/profile.tsx

import React, { useState } from 'react';
import {
    View,
    Text,
    Button,
    StyleSheet,
    SafeAreaView,
    Image,
    TouchableOpacity,
    TextInput,
    FlatList,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; //  IoniconsName
import Colors from '@/constants/Colors';
import {Href, Link} from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { defaultStyles } from '@/constants/Styles';
import { useRouter } from 'expo-router';




// interface for setting item
type IoniconsName = React.ComponentProps<typeof Ionicons>['name']; // icons in settings
interface SettingItem {
    id: string;
    title: string;
    icon: IoniconsName;
    route: string; // Используем тип SettingsRoute
}


// SETTINGS
const settingsData: SettingItem[] = [
    { id: '1', title: 'Personal information', icon: 'person-outline', route: '/settings/personal-information' },
    { id: '2', title: 'Payments and payouts', icon: 'wallet-outline', route: '/settings/payments-and-payouts' },
    { id: '3', title: 'Accessibility', icon: 'cog-outline', route: '/settings/accessibility' },
    { id: '4', title: 'Tasks history', icon: 'clipboard-outline', route: '/settings/tasks-history' },
    { id: '5', title: 'Favourite taskers', icon: 'heart-outline', route: '/settings/favourite-taskers' },
    { id: '6', title: 'Need help?', icon: 'help-circle-outline', route: '/settings/need-help' },
    { id: '7', title: 'Give us feedback', icon: 'pencil-outline', route: '/settings/give-us-feedback' },
];

const ProfilePage = () => {
   /// const [isSignedIn, setIsSignedIn] = useState(true); // Maybe we need to check if user is signed in

    const router = useRouter();

    const [user, setUser] = useState({
        firstName: 'Donald',
        lastName: 'Trump',
        email: 'Donald@example.com',
        imageUrl: 'https://d39-a.sdn.cz/d_39/c_img_gR_0/nKri/donald-trump-usa.jpeg?fl=cro,398,557,2352,1323%7Cres,722,,1%7Cwebp,75',
        createdAt: new Date('2023-01-01'),
    });
    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName);
    const [edit, setEdit] = useState(false);

    const onSaveUser = () => {
        if (!firstName.trim() || !lastName.trim()) {
            Alert.alert('Error', 'Empty name or surename.');
            return;
        }
        // HERE WE SHOULD SAVE USER DATA TO THE SERVER
        setUser({
            ...user,
            firstName: firstName,
            lastName: lastName,
        });
        setEdit(false);
    };

    const onCaptureImage = async () => {
        // Request permission to access the media library (for IOS)
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Error', 'You need permission.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.75,
            base64: false,
        });

        if (!result.canceled) {
            const selectedImage = result.assets[0].uri;
            // HERE WE SHOULD SAVE IMAGE TO THE SERVER
            setUser({
                ...user,
                imageUrl: selectedImage,
            });
        }
    };

    // Simple function to handle setting press
    const handleSettingPress = (item: SettingItem) => {
        router.push(item.route as Href);
    };

    // Render setting item
    const renderSettingItem = ({ item }: { item: SettingItem }) => (
        <TouchableOpacity style={styles.settingItem} onPress={() => handleSettingPress(item)}>
            <Ionicons name={item.icon} size={24} color={Colors.dark} style={styles.settingIcon} />
            <Text style={styles.settingText}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={24} color={Colors.dark} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={defaultStyles.container}>
            {/* Header Profile */}
            <View style={styles.headerContainer}>
                <Text style={styles.header}>Profile</Text>
                <Ionicons name="notifications-outline" size={26} />
            </View>

            {/* PROFILE CARD */}
            {user && (
                <View style={styles.card}>
                    <TouchableOpacity onPress={onCaptureImage}>
                        <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
                    </TouchableOpacity>
                    <View style={styles.profileInfo}>
                        {!edit ? (
                            <View style={styles.editRow}>
                                <Text style={styles.userName}>
                                    {user.firstName} {user.lastName}
                                </Text>
                                <TouchableOpacity onPress={() => setEdit(true)}>
                                    <Ionicons name="create-outline" size={24} color={Colors.dark} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.editRow}>
                                <TextInput
                                    placeholder="First Name"
                                    value={firstName}
                                    onChangeText={setFirstName}
                                    style={[defaultStyles.inputField, { width: 100 }]}
                                />
                                <TextInput
                                    placeholder="Last Name"
                                    value={lastName}
                                    onChangeText={setLastName}
                                    style={[defaultStyles.inputField, { width: 100 }]}
                                />
                                <TouchableOpacity onPress={onSaveUser}>
                                    <Ionicons name="checkmark-outline" size={24} color={Colors.dark} />
                                </TouchableOpacity>
                            </View>
                        )}
                        <Text style={styles.email}>{user.email}</Text>
                        <Text style={styles.since}>Since {user.createdAt.toLocaleDateString()}</Text>
                    </View>
                </View>
            )}

            {/* HEADER Settings */}
            <View style={styles.settingsHeaderContainer}>
                <Text style={styles.settingsHeader}>Settings</Text>
            </View>

            {/* LIST OF SETTINGS */}
            <FlatList
                data={settingsData}
                renderItem={renderSettingItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.settingsListContainer}
               // ItemSeparatorComponent={() => <View style={styles.separator} />}
            />

        </SafeAreaView>
    );

};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 24,
    },
    header: {
        fontFamily: 'mon-b',
        fontSize: 30,
    },
    card: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 16,
        marginHorizontal: 24,
        marginTop: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: {
            width: 1,
            height: 2,
        },
        alignItems: 'center',
        gap: 14,
        marginBottom: 24,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.grey,
    },
    profileInfo: {
        width: '100%',
        alignItems: 'center',
    },
    editRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
    },
    userName: {
        fontSize: 22,
        fontWeight: '600',
        color: Colors.dark,
    },
    email: {
        fontSize: 16,
        color: Colors.dark,
        marginTop: 8,
    },
    since: {
        fontSize: 14,
        color: Colors.dark,
        marginTop: 4,
    },
    settingsHeaderContainer: {
        paddingHorizontal: 24,
        paddingVertical: 8,
    },
    settingsHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.dark,
    },
    settingsListContainer: {
        paddingHorizontal: 24,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
    },
    settingIcon: {
        marginRight: 16,
    },
    settingText: {
        flex: 1,
        fontSize: 16,
        color: Colors.dark,
    },
    separator: {
        height: 1,
        backgroundColor: Colors.grey,
        marginLeft: 40,
    },
});

export default ProfilePage;
