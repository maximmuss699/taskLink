// ProfilePage.tsx

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    Image,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FIREBASE_APP, FIRESTORE } from '@/firebaseConfig'; // Ensure the path is correct
import { getStorage } from 'firebase/storage'; // Import getStorage from Firebase
import Colors from "../../constants/Colors"; // Import colors if available
import { defaultStyles } from '../../constants/Styles';
import { Href, useRouter } from 'expo-router';

// Define styles before the component to prevent TS2448 error
const styles = StyleSheet.create({
    scrollContainer: {
        paddingBottom: 60, // Чтобы taskLink не пересекался с нижней частью экрана
    },
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
        shadowOffset: { width: 1, height: 2 },
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
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    settingIcon: {
        marginRight: 16,
    },
    settingText: {
        flex: 1,
        fontSize: 16,
        color: Colors.dark,
    },
    footerText: {
        fontSize: 18,
        fontFamily: 'modernaRegular',
        color: '#888888',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
    },
    noUserText: {
        textAlign: 'center',
        fontSize: 18,
        color: '#888',
        marginTop: 20,
    },
});

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    profilePicture: string;
    createdAt: Date;
    isVerified: boolean;
}

interface SettingItem {
    id: string;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    route?: Href; // Make 'route' optional
    onPress?: () => void; // Optional callback for custom actions
}

const settingsData: SettingItem[] = [
    { id: '1', title: 'Personal information', icon: 'person-outline', route: '/settings/personal-information' },
    { id: '2', title: 'Payments and payouts', icon: 'wallet-outline', route: '/settings/payments-and-payouts' },
    { id: '3', title: 'Accessibility', icon: 'cog-outline', route: '/settings/accessibility' },
    { id: '4', title: 'Tasks history', icon: 'clipboard-outline', route: '/settings/tasks-history' },
    { id: '5', title: 'Favourite taskers', icon: 'heart-outline', route: '/settings/favourite-taskers' },
    {
        id: '6',
        title: 'Need help?',
        icon: 'help-circle-outline',
        onPress: () => Alert.alert('Info', 'This feature is not available yet.') // Custom action
    },
    {
        id: '7',
        title: 'Give us feedback',
        icon: 'pencil-outline',
        onPress: () => Alert.alert('Info', 'This feature is not available yet.') // Custom action
    },
];

const ProfilePage = () => {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [edit, setEdit] = useState(false);
    const [loading, setLoading] = useState(true); // Состояние загрузки

    // Ваш документ ID
    const userId = "295QvAWplDHFfIrXM5XG"; // Замените на реальный ID пользователя

    // Initialize Firebase Storage
    const STORAGE = getStorage(FIREBASE_APP);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Create a reference to the user's document
                const userDocRef = doc(FIRESTORE, 'users', userId);

                // Fetch the document
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    if (userData) {
                        const fetchedUser: User = {
                            id: userDoc.id,
                            firstName: userData.firstName || '',
                            lastName: userData.lastName || '',
                            email: userData.email || '',
                            phoneNumber: userData.phoneNumber || '',
                            address: userData.address || '',
                            profilePicture: userData.profilePicture || 'https://via.placeholder.com/100',
                            createdAt: userData.createdAt?.toDate() || new Date(),
                            isVerified: userData.isVerified || false,
                        };
                        setUser(fetchedUser);
                        setFirstName(fetchedUser.firstName);
                        setLastName(fetchedUser.lastName);
                        console.log("Fetched User Data:", fetchedUser);
                    } else {
                        Alert.alert('Ошибка', 'Данные пользователя пусты.');
                    }
                } else {
                    Alert.alert('Ошибка', 'Пользователь не найден.');
                }
            } catch (error) {
                console.error("Ошибка при получении данных пользователя:", error);
                Alert.alert('Ошибка', 'Не удалось получить данные пользователя.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    const onSaveUser = async () => {
        if (!firstName.trim() || !lastName.trim()) {
            Alert.alert('Ошибка', 'Имя или фамилия не могут быть пустыми.');
            return;
        }
        try {
            const userDocRef = doc(FIRESTORE, 'users', userId);
            await updateDoc(userDocRef, {
                firstName: firstName,
                lastName: lastName,
            });
            if (user) {
                setUser({ ...user, firstName, lastName });
            }
            setEdit(false);
            Alert.alert('Успех', 'Информация пользователя обновлена.');
        } catch (error) {
            console.error("Ошибка при обновлении данных пользователя:", error);
            Alert.alert('Ошибка', 'Не удалось обновить данные пользователя.');
        }
    };

    const onCaptureImage = async () => {
        // Запрос разрешений на доступ к медиабиблиотеке
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Ошибка', 'Требуются разрешения для доступа к медиабиблиотеке.');
            return;
        }

        // Выбор изображения пользователем
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.75,
        });

        if (!result.canceled && result.assets.length > 0) {
            try {
                const selectedImage = result.assets[0];
                console.log("Selected Image:", selectedImage.uri);

                // Конвертация URI изображения в blob
                const response = await fetch(selectedImage.uri);
                const blob = await response.blob();

                // Создание ссылки в Firebase Storage
                const storageRef = ref(STORAGE, `profilePictures/${userId}`);

                // Загрузка изображения в Firebase Storage
                await uploadBytes(storageRef, blob);
                console.log("Image uploaded to Firebase Storage.");

                // Получение публичного URL изображения
                const downloadURL = await getDownloadURL(storageRef);
                console.log("Download URL:", downloadURL);

                // Обновление поля profilePicture в Firestore
                const userDocRef = doc(FIRESTORE, 'users', userId);
                await updateDoc(userDocRef, {
                    profilePicture: downloadURL,
                });
                console.log("Firestore updated with new profilePicture URL.");

                // Обновление локального состояния
                if (user) {
                    setUser({ ...user, profilePicture: downloadURL });
                }

                Alert.alert('Успех', 'Изображение профиля обновлено.');
            } catch (error) {
                console.error("Ошибка при обновлении изображения профиля:", error);
                Alert.alert('Ошибка', 'Не удалось обновить изображение профиля.');
            }
        }
    };

    const handleSettingPress = (item: SettingItem) => {
        if (item.route) {
            router.push(item.route);
        } else if (item.onPress) {
            item.onPress();
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={defaultStyles.container}>
                <ActivityIndicator size="large" color={Colors.dark} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={defaultStyles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.headerContainer}>
                    <Text style={styles.header}>Profile</Text>
                    <Ionicons name="notifications-outline" size={26} />
                </View>

                {user ? (
                    <View style={styles.card}>
                        <TouchableOpacity onPress={onCaptureImage}>
                            <Image
                                source={{ uri: user.profilePicture || 'https://via.placeholder.com/100' }}
                                style={styles.avatar}
                            />
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
                                        placeholderTextColor="#aaa"
                                        value={firstName}
                                        onChangeText={setFirstName}
                                        style={[defaultStyles.inputField, { width: 100 }]}
                                    />
                                    <TextInput
                                        placeholder="Last Name"
                                        placeholderTextColor="#aaa"
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
                ) : (
                    <Text style={styles.noUserText}>Данные пользователя отсутствуют.</Text>
                )}

                <View style={styles.settingsHeaderContainer}>
                    <Text style={styles.settingsHeader}>Settings</Text>
                </View>

                {settingsData.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.settingItem}
                        onPress={() => handleSettingPress(item)}
                    >
                        <Ionicons name={item.icon} size={24} color={Colors.dark} style={styles.settingIcon} />
                        <Text style={styles.settingText}>{item.title}</Text>
                        <Ionicons name="chevron-forward" size={24} color={Colors.dark} />
                    </TouchableOpacity>
                ))}
                <Text style={styles.footerText}>taskLink</Text>
            </ScrollView>
        </SafeAreaView>)
};

export default ProfilePage;
