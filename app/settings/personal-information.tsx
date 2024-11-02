// app/settings/personal-information.tsx

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
} from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';

export interface PersonalInfoProps {
    /** Используется для локализации этого представления в end-to-end тестах. */
    testID?: string,
}

const PersonalInformation: React.FC<PersonalInfoProps> = (props) => {
    const router = useRouter();

    // Состояния для каждого поля
    const [firstName, setFirstName] = useState('Luka');
    const [lastName, setLastName] = useState('Zaniola');
    const [phoneNumber, setPhoneNumber] = useState('+4202281337');
    const [address, setAddress] = useState('Česká 228/67');
    const [email, setEmail] = useState('zaniola@gmail.com');

    // Состояния редактирования для каждого поля
    const [isEditing, setIsEditing] = useState({
        firstName: false,
        lastName: false,
        phoneNumber: false,
        address: false,
        email: false,
    });

    // Обработчик сохранения изменений
    const handleSave = (field: keyof typeof isEditing) => {
        // Простая валидация
        let value = '';
        switch(field) {
            case 'firstName':
                value = firstName;
                break;
            case 'lastName':
                value = lastName;
                break;
            case 'phoneNumber':
                value = phoneNumber;
                break;
            case 'address':
                value = address;
                break;
            case 'email':
                value = email;
                break;
            default:
                break;
        }

        if (!value.trim()) {
            Alert.alert('Ошибка', 'Поле не может быть пустым.');
            return;
        }

        if (field === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                Alert.alert('Ошибка', 'Введите корректный email.');
                return;
            }
        }

        // Здесь можно добавить логику сохранения данных на сервере или в хранилище
        Alert.alert('Успех', 'Информация обновлена.');

        // Выключаем режим редактирования
        setIsEditing(prev => ({ ...prev, [field]: false }));
    };

    // Обработчик отмены изменений
    const handleCancel = (field: keyof typeof isEditing) => {
        // Здесь можно сбросить изменения, если сохранять предыдущие значения
        // Для простоты, просто выключаем режим редактирования
        setIsEditing(prev => ({ ...prev, [field]: false }));
    };

    return (
        <SafeAreaView style={styles.container} testID={props.testID ?? "personal-info"}>
            {/* Кастомный Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>Personal Information</Text>
            </View>


            <ScrollView contentContainerStyle={styles.content}>
                {/* First Name */}
                <View style={styles.infoRow}>
                    <View style={styles.labelContainer}>
                        <Text style={styles.label}>First Name</Text>
                    </View>
                    <View style={styles.valueContainer}>
                        {isEditing.firstName ? (
                            <TextInput
                                style={styles.input}
                                value={firstName}
                                onChangeText={setFirstName}
                                placeholder="Enter your first name"
                            />
                        ) : (
                            <Text style={styles.value}>{firstName}</Text>
                        )}
                    </View>
                    <View style={styles.iconContainer}>
                        {isEditing.firstName ? (
                            <>
                                <TouchableOpacity onPress={() => handleSave('firstName')} style={styles.iconButton}>
                                    <Ionicons name="checkmark" size={24} color="#4CAF50" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleCancel('firstName')} style={styles.iconButton}>
                                    <Ionicons name="close" size={24} color="#F44336" />
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity onPress={() => setIsEditing(prev => ({ ...prev, firstName: true }))} style={styles.iconButton}>
                                <Ionicons name="pencil-outline" size={24} color="#000" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Last Name */}
                <View style={styles.infoRow}>
                    <View style={styles.labelContainer}>
                        <Text style={styles.label}>Last Name</Text>
                    </View>
                    <View style={styles.valueContainer}>
                        {isEditing.lastName ? (
                            <TextInput
                                style={styles.input}
                                value={lastName}
                                onChangeText={setLastName}
                                placeholder="Enter your last name"
                            />
                        ) : (
                            <Text style={styles.value}>{lastName}</Text>
                        )}
                    </View>
                    <View style={styles.iconContainer}>
                        {isEditing.lastName ? (
                            <>
                                <TouchableOpacity onPress={() => handleSave('lastName')} style={styles.iconButton}>
                                    <Ionicons name="checkmark" size={24} color="#4CAF50" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleCancel('lastName')} style={styles.iconButton}>
                                    <Ionicons name="close" size={24} color="#F44336" />
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity onPress={() => setIsEditing(prev => ({ ...prev, lastName: true }))} style={styles.iconButton}>
                                <Ionicons name="pencil-outline" size={24} color="#000" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Phone Number */}
                <View style={styles.infoRow}>
                    <View style={styles.labelContainer}>
                        <Text style={styles.label}>Phone Number</Text>
                    </View>
                    <View style={styles.valueContainer}>
                        {isEditing.phoneNumber ? (
                            <TextInput
                                style={styles.input}
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                placeholder="Enter your phone number"
                                keyboardType="phone-pad"
                            />
                        ) : (
                            <Text style={styles.value}>{phoneNumber}</Text>
                        )}
                    </View>
                    <View style={styles.iconContainer}>
                        {isEditing.phoneNumber ? (
                            <>
                                <TouchableOpacity onPress={() => handleSave('phoneNumber')} style={styles.iconButton}>
                                    <Ionicons name="checkmark" size={24} color="#4CAF50" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleCancel('phoneNumber')} style={styles.iconButton}>
                                    <Ionicons name="close" size={24} color="#F44336" />
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity onPress={() => setIsEditing(prev => ({ ...prev, phoneNumber: true }))} style={styles.iconButton}>
                                <Ionicons name="pencil-outline" size={24} color="#000" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Address */}
                <View style={styles.infoRow}>
                    <View style={styles.labelContainer}>
                        <Text style={styles.label}>Address</Text>
                    </View>
                    <View style={styles.valueContainer}>
                        {isEditing.address ? (
                            <TextInput
                                style={styles.input}
                                value={address}
                                onChangeText={setAddress}
                                placeholder="Enter your address"
                            />
                        ) : (
                            <Text style={styles.value}>{address}</Text>
                        )}
                    </View>
                    <View style={styles.iconContainer}>
                        {isEditing.address ? (
                            <>
                                <TouchableOpacity onPress={() => handleSave('address')} style={styles.iconButton}>
                                    <Ionicons name="checkmark" size={24} color="#4CAF50" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleCancel('address')} style={styles.iconButton}>
                                    <Ionicons name="close" size={24} color="#F44336" />
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity onPress={() => setIsEditing(prev => ({ ...prev, address: true }))} style={styles.iconButton}>
                                <Ionicons name="pencil-outline" size={24} color="#000" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Email */}
                <View style={styles.infoRow}>
                    <View style={styles.labelContainer}>
                        <Text style={styles.label}>Email</Text>
                    </View>
                    <View style={styles.valueContainer}>
                        {isEditing.email ? (
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter your email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        ) : (
                            <Text style={styles.value}>{email}</Text>
                        )}
                    </View>
                    <View style={styles.iconContainer}>
                        {isEditing.email ? (
                            <>
                                <TouchableOpacity onPress={() => handleSave('email')} style={styles.iconButton}>
                                    <Ionicons name="checkmark" size={24} color="#4CAF50" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleCancel('email')} style={styles.iconButton}>
                                    <Ionicons name="close" size={24} color="#F44336" />
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity onPress={() => setIsEditing(prev => ({ ...prev, email: true }))} style={styles.iconButton}>
                                <Ionicons name="pencil-outline" size={24} color="#000" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

            </ScrollView>
            <Text style={styles.footerText}>taskLink</Text>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        paddingTop: 16,
        paddingHorizontal: 16,
        fontFamily: 'mon-b',
        fontSize: 24,
    },
    backButton: {
        padding: 8,
        marginBottom: 8,
    },
    title: {
        fontSize: 30,
        fontWeight: '700',
        color: '#000',
        textAlign: 'left', // Выравнивание заголовка влево
        fontFamily: 'mon-b',
    },
    placeholder: {
        width: 32, // Для симметрии заголовка
    },
    content: {
        padding: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    labelContainer: {
        flex: 2,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333333',
    },
    valueContainer: {
        flex: 3,
    },
    value: {
        fontSize: 16,
        color: '#666666',
    },
    input: {
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 8,
        padding: 8,
        fontSize: 16,
        color: '#000000',
    },
    disabledInput: {
        backgroundColor: '#F5F5F5',
        color: '#A0A0A0',
    },
    iconContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    iconButton: {
        marginLeft: 8,
    },
    footer: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerText: {
        fontSize: 18,
        fontFamily: 'modernaRegular', // Используем шрифт MuseoModerno
        color: '#888888', // Серый цвет текста
        fontWeight: 'bold',
        position: 'absolute',
        bottom: 20, // Отступ от низа экрана
        alignSelf: 'center',
    },

});

export default PersonalInformation;
