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
    Alert,
    ActivityIndicator,
} from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from 'expo-router';
import { FIRESTORE } from '@/firebaseConfig';
import { collection, getDocs, doc, setDoc, deleteDoc, query, where } from 'firebase/firestore';

export interface PersonalInfoProps {
    testID?: string;
}

type Tasker = {
    id: string;
    name: string;
    avatar: string;
    date: string;
    taskerId?: string; // Если нужно, можно хранить taskerId внутри документа
};

const PersonalInformation: React.FC<PersonalInfoProps> = (props) => {
    const router = useRouter();
    const [nearTaskers, setNearTaskers] = useState<Tasker[]>([]);
    const [favoriteTaskers, setFavoriteTaskers] = useState<Tasker[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTaskersFromDB();
    }, []);

    const loadTaskersFromDB = async () => {
        try {
            // Загружаем все таскеры
            const taskersSnapshot = await getDocs(collection(FIRESTORE, 'taskers'));
            if (taskersSnapshot.empty) {
                Alert.alert('Info', 'No taskers available.');
                setLoading(false);
                return;
            }

            const allTaskers: Tasker[] = taskersSnapshot.docs.map(doc => {
                const data = doc.data();
                const name = data.fullName || 'Unknown Tasker';
                const avatar = data.profilePicture || 'https://via.placeholder.com/100';
                let date = 'Unknown Date';
                if (data.joinedDate && data.joinedDate.seconds) {
                    date = new Date(data.joinedDate.seconds * 1000).toLocaleDateString();
                }
                return {
                    id: doc.id,
                    name,
                    avatar,
                    date,
                    taskerId: data.taskerId || doc.id // Предполагается, что в data есть taskerId
                };
            });

            // Загружаем избранных таскеров
            const favouritesSnapshot = await getDocs(collection(FIRESTORE, 'favourites'));
            const favoriteTaskerIds = favouritesSnapshot.docs.map(doc => {
                const favData = doc.data();
                return favData.taskerId;
            }).filter(Boolean);

            // Разделяем на избранных и остальных
            const favorites = allTaskers.filter(tasker => favoriteTaskerIds.includes(tasker.taskerId ?? tasker.id));
            const near = allTaskers.filter(tasker => !favoriteTaskerIds.includes(tasker.taskerId ?? tasker.id));

            setFavoriteTaskers(favorites);
            setNearTaskers(near);

        } catch (error) {
            console.error('Error loading taskers:', error);
            Alert.alert('Error', 'Unable to load taskers from database.');
        } finally {
            setLoading(false);
        }
    };

    const addTaskerToFavorites = async (tasker: Tasker) => {
        try {
            // Добавляем документ в favourites
            await setDoc(doc(FIRESTORE, 'favourites', tasker.id), {
                taskerId: tasker.taskerId || tasker.id
            });
            setFavoriteTaskers((prev) => [...prev, tasker]);
            setNearTaskers((prev) => prev.filter((t) => t.id !== tasker.id));
        } catch (error) {
            console.error('Error adding to favorites:', error);
            Alert.alert('Error', 'Unable to add tasker to favourites.');
        }
    };

    const removeTaskerFromFavorites = async (tasker: Tasker) => {
        try {
            // Удаляем документ из favourites
            await deleteDoc(doc(FIRESTORE, 'favourites', tasker.id));
            setNearTaskers((prev) => [...prev, tasker]);
            setFavoriteTaskers((prev) => prev.filter((t) => t.id !== tasker.id));
        } catch (error) {
            console.error('Error removing from favorites:', error);
            Alert.alert('Error', 'Unable to remove tasker from favourites.');
        }
    };

    const renderTaskerItem = ({ item, isFavorite }: { item: Tasker; isFavorite: boolean }) => (
        <View style={styles.taskerItem}>
            <TouchableOpacity onPress={() => router.push(`/profile/${item.id}`)}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
            </TouchableOpacity>
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

    if (loading) {
        return (
            <SafeAreaView style={styles.loading}>
                <ActivityIndicator size="large" color="#34C759" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} testID={props.testID ?? "personal-info"}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>Favourite Taskers</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Favorite Taskers */}
                <View style={styles.content}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Your List</Text>
                    </View>
                    {favoriteTaskers.length === 0 ? (
                        <Text style={styles.noTaskersText}>No favorite taskers added</Text>
                    ) : (
                        <FlatList
                            data={favoriteTaskers}
                            renderItem={({ item }) => renderTaskerItem({ item, isFavorite: true })}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.taskerList}
                            scrollEnabled={false}
                        />
                    )}
                </View>

                {/* Near Taskers */}
                <View style={styles.content}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Taskers Near You</Text>
                    </View>
                    {nearTaskers.length === 0 ? (
                        <Text style={styles.noTaskersText}>No taskers found near you</Text>
                    ) : (
                        <FlatList
                            data={nearTaskers}
                            renderItem={({ item }) => renderTaskerItem({ item, isFavorite: false })}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={[styles.taskerList, styles.lastList]}
                            scrollEnabled={false}
                        />
                    )}
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
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    header: {
        paddingTop: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
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
        color: '#888888',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
        paddingBottom: 40,
    },
    noTaskersText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
        fontFamily: 'mon-b',
    },
});

export default PersonalInformation;
