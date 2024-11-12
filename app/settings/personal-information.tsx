import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { FIRESTORE } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const UserProfile = () => {
    const [userData, setUserData] = useState<any>(null);
    const userId = '295QvAWplDHFfIrXM5XG';

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const docRef = doc(FIRESTORE, 'users', userId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setUserData(docSnap.data());
                } else {
                    console.log('No such document!');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    if (!userData) {
        return <Text>Loading...</Text>;
    }

    return (
        <View style={styles.container}>
            <Image source={{ uri: userData.profilePicture }} style={styles.profileImage} />
            <Text style={styles.name}>{userData.firstName} {userData.lastName}</Text>
            <Text style={styles.email}>{userData.email}</Text>
            <Text style={styles.phoneNumber}>Phone: {userData.phoneNumber}</Text>
            <Text style={styles.address}>Address: {userData.address}</Text>
            <Text style={styles.verified}>Verified: {userData.isVerified ? 'Yes' : 'No'}</Text>
            <Text style={styles.createdAt}>Member since: {new Date(userData.createdAt.seconds * 1000).toLocaleDateString()}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 20,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    email: {
        fontSize: 16,
        color: 'gray',
    },
    phoneNumber: {
        fontSize: 16,
    },
    address: {
        fontSize: 16,
    },
    verified: {
        fontSize: 16,
        color: 'green',
    },
    createdAt: {
        fontSize: 14,
        color: 'gray',
        marginTop: 10,
    },
});

export default UserProfile;
