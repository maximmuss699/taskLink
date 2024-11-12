// PersonalInformation.tsx

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from 'expo-router';
import { FIRESTORE } from '@/firebaseConfig'; // Ensure the path is correct
import { doc, getDoc, updateDoc } from 'firebase/firestore'; // Import necessary Firestore functions
import Colors from "../../constants/Colors"; // Import colors if available

export interface PersonalInfoProps {
    /** Used to locate this view in end-to-end tests. */
    testID?: string,
}

const PersonalInformation: React.FC<PersonalInfoProps> = (props) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true); // Loading state

    // States for each field
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');

    // Editing states for each field
    const [isEditing, setIsEditing] = useState({
        firstName: false,
        lastName: false,
        phoneNumber: false,
        address: false,
        email: false,
    });

    // Your document ID
    const userId = "295QvAWplDHFfIrXM5XG"; // Replace with the actual user ID

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
                        setFirstName(userData.firstName || '');
                        setLastName(userData.lastName || '');
                        setPhoneNumber(userData.phoneNumber || '');
                        setAddress(userData.address || '');
                        setEmail(userData.email || '');
                        console.log("Fetched User Data:", userData);
                    } else {
                        Alert.alert('Error', 'User data is empty.');
                    }
                } else {
                    Alert.alert('Error', 'User not found.');
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                Alert.alert('Error', 'Failed to fetch user data.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    // Handler for saving changes
    const handleSave = async (field: keyof typeof isEditing) => {
        // Simple validation
        let value = '';
        switch (field) {
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
            Alert.alert('Error', 'Field cannot be empty.');
            return;
        }

        if (field === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                Alert.alert('Error', 'Please enter a valid email.');
                return;
            }
        }

        try {
            // Create a reference to the user's document
            const userDocRef = doc(FIRESTORE, 'users', userId);

            // Update the specified field
            await updateDoc(userDocRef, { [field]: value });

            Alert.alert('Success', 'Information updated.');
            setIsEditing(prev => ({ ...prev, [field]: false }));
        } catch (error) {
            console.error(`Error updating field ${field}:`, error);
            Alert.alert('Error', 'Failed to update information.');
        }
    };

    // Handler for cancelling changes
    const handleCancel = (field: keyof typeof isEditing) => {
        // Here you can reset changes if previous values are stored
        // For simplicity, just turn off editing mode
        setIsEditing(prev => ({ ...prev, [field]: false }));
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color={Colors.dark} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} testID={props.testID ?? "personal-info"}>
            {/* Custom Header */}
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

// Define styles outside the component to prevent re-creation on each render
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        paddingTop: 16,
        paddingHorizontal: 16,

    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    title: {
        fontSize: 30,
        fontWeight: '700',
        color: '#000',
        textAlign: 'left',
        fontFamily: 'mon-b',
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
        fontFamily: 'modernaRegular',
        color: '#888888',
        fontWeight: 'bold',
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
    },
});

export default PersonalInformation;
