import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    Image,
    ScrollView,
} from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PersonalInfoProps {
    testID?: string,
}

type Tasker = {
    id: string;
    name: string;
    avatar: string;
    date: string;
};

const initialNearTaskers: Tasker[] = [
    { id: '1', name: 'Alice Johnson', avatar: 'https://via.placeholder.com/100', date: '2023.11.01' },
    { id: '2', name: 'Bob Smith', avatar: 'https://via.placeholder.com/100', date: '2023.10.20' },
    { id: '3', name: 'Charlie Brown', avatar: 'https://via.placeholder.com/100', date: '2023.10.15' },
    { id: '4', name: 'David White', avatar: 'https://via.placeholder.com/100', date: '2023.10.10' },
    { id: '5', name: 'Eve Black', avatar: 'https://via.placeholder.com/100', date: '2023.10.05' },
];

const PersonalInformation: React.FC<PersonalInfoProps> = (props) => {
    const router = useRouter();
    const [nearTaskers, setNearTaskers] = useState<Tasker[]>(initialNearTaskers);
    const [favoriteTaskers, setFavoriteTaskers] = useState<Tasker[]>([]);

    useEffect(() => {
        loadTaskers();
    }, []);

    useEffect(() => {
        saveTaskers();
    }, [nearTaskers, favoriteTaskers]);

    const saveTaskers = async () => {
        try {
            await AsyncStorage.setItem('nearTaskers', JSON.stringify(nearTaskers));
            await AsyncStorage.setItem('favoriteTaskers', JSON.stringify(favoriteTaskers));
        } catch (error) {
            console.error('Error saving taskers:', error);
        }
    };

    const loadTaskers = async () => {
        try {
            const savedNearTaskers = await AsyncStorage.getItem('nearTaskers');
            const savedFavoriteTaskers = await AsyncStorage.getItem('favoriteTaskers');
            if (savedNearTaskers) setNearTaskers(JSON.parse(savedNearTaskers));
            if (savedFavoriteTaskers) setFavoriteTaskers(JSON.parse(savedFavoriteTaskers));
        } catch (error) {
            console.error('Error loading taskers:', error);
        }
    };

    const addTaskerToFavorites = (tasker: Tasker) => {
        setFavoriteTaskers((prev) => [...prev, tasker]);
        setNearTaskers((prev) => prev.filter((t) => t.id !== tasker.id));
    };

    const removeTaskerFromFavorites = (tasker: Tasker) => {
        setNearTaskers((prev) => [...prev, tasker]);
        setFavoriteTaskers((prev) => prev.filter((t) => t.id !== tasker.id));
    };

    const renderTaskerItem = ({ item, isFavorite }: { item: Tasker; isFavorite: boolean }) => (
        <View style={styles.taskerItem}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.taskerInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.date}>{item.date}</Text>
            </View>
            <TouchableOpacity
                style={isFavorite ? styles.removeButton : styles.addButton}
                onPress={() => isFavorite ? removeTaskerFromFavorites(item) : addTaskerToFavorites(item)}
            >
                <Text style={styles.buttonText}>{isFavorite ? 'Remove' : 'Add'}</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} testID={props.testID ?? "personal-info"}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>Favourite Taskers</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Your List</Text>
                    </View>
                    <FlatList
                        data={favoriteTaskers}
                        renderItem={({ item }) => renderTaskerItem({ item, isFavorite: true })}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.taskerList}
                        scrollEnabled={false}
                    />
                </View>

                <View style={styles.content}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Taskers Near You</Text>
                    </View>
                    <FlatList
                        data={nearTaskers}
                        renderItem={({ item }) => renderTaskerItem({ item, isFavorite: false })}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={[styles.taskerList, styles.lastList]}
                        scrollEnabled={false}
                    />
                </View>
                <Text style={styles.footerText}>taskLink</Text>
            </ScrollView>
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
        flexDirection: 'row',
    },
    backButton: {
        padding: 8,
        marginBottom: 8,
    },
    title: {
        fontSize: 30,
        fontWeight: '700',
        color: '#000',
        marginLeft: 8,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    content: {
        padding: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    label: {
        fontSize: 22,
        fontWeight: '200',
        color: '#333333',
        fontFamily: 'mon-b',
    },
    taskerList: {
        marginTop: 10,
    },
    lastList: {
        paddingBottom: 80,
    },
    taskerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 12,
    },
    taskerInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    date: {
        fontSize: 14,
        color: '#666',
    },
    addButton: {
        paddingVertical: 10,
        paddingHorizontal: 40,
        backgroundColor: 'green',
        borderRadius: 15,
        alignItems: 'center',
    },
    removeButton: {
        paddingVertical: 10,
        paddingHorizontal: 30,
        backgroundColor: 'black',
        borderRadius: 15,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
    footerText: {
        fontSize: 18,
        fontFamily: 'modernaRegular',
        color: '#888888',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
        paddingBottom: 40,
    },
    description: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
});

export default PersonalInformation;
