/**
 * @file inbox.tsx
 * @author Maksim Samusevich (xsamus00)
 * @description This file contains the implementation of the Chats screen.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import { FIRESTORE } from '@/firebaseConfig';
import {
    collection,
    getDocs,
    query,
    where,
    doc,
    deleteDoc,
} from 'firebase/firestore';
import Colors from "@/constants/Colors";

interface ChatDocument {
    username: string;
}

interface Tasker {
    taskerId: string;
    fullName: string;
    profilePicture: string;
}

interface ChatItem {
    id: string;
    name: string;
    avatar: string;
}

const Inbox = () => {
    const router = useRouter();
    const [chats, setChats] = useState<ChatItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchChats = useCallback(async () => {
        try {
            const chatsCollection = collection(FIRESTORE, "chats");
            const chatsSnapshot = await getDocs(chatsCollection);
            const chatList: ChatItem[] = [];

            // Go through each chat document and fetch the tasker's name and avatar
            for (const docSnap of chatsSnapshot.docs) {
                const chatData = docSnap.data() as ChatDocument;
                const { username } = chatData;

                // Search for the tasker with the given username
                const taskersCollection = collection(FIRESTORE, "taskers");
                const taskerQuery = query(taskersCollection, where("fullName", "==", username));
                const taskerSnapshot = await getDocs(taskerQuery);

                let avatar = 'https://via.placeholder.com/100';
                let name = username;

                // If the tasker exists, update the avatar and name
                if (!taskerSnapshot.empty) {
                    const taskerData = taskerSnapshot.docs[0].data() as Tasker;
                    avatar = taskerData.profilePicture || avatar;
                    name = taskerData.fullName || name;
                }

                chatList.push({
                    id: docSnap.id,
                    name,
                    avatar,
                });
            }

            setChats(chatList);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching chats:", error);
            Alert.alert('Error', 'Failed to load chats.');
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchChats();
        }, [fetchChats])
    );

    // Handle deleting a chat
    const handleDeleteChat = (chatId: string) => {
        Alert.alert(
            'Delete Chat',
            'Are you sure you want to delete this chat?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Delete the chat document from Firestore
                            await deleteDoc(doc(FIRESTORE, "chats", chatId));

                            // Update the chat list
                            setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));

                            Alert.alert('Success', 'Chat has been deleted.');
                        } catch (error) {
                            console.error('Error deleting chat:', error);
                            Alert.alert('Error', 'Failed to delete chat.');
                        }
                    }
                }
            ],
            { cancelable: true }
        );
    };

    const renderItem = ({ item }: { item: ChatItem }) => (
        <TouchableOpacity
            style={styles.chatItem}
            onPress={() => router.push(`/chats/${item.id}`)}
            onLongPress={() => handleDeleteChat(item.id)} // Long press to delete chat
        >
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <Text style={styles.name}>{item.name}</Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.loading}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <Text style={styles.header}>Messages</Text>
                <Ionicons name="search-outline" size={26} color="#000" />
            </View>

            {/* Chat List */}
            <FlatList
                data={chats}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.chatList}
                ListEmptyComponent={<Text style={styles.emptyText}>No chats available.</Text>}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: 20,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 24,
        alignItems: 'center',
    },
    header: {
        fontFamily: 'mon-b',
        fontSize: 30,
        color: '#000',
    },
    chatList: {
        paddingHorizontal: 16,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomColor: '#e5e5e5',
        borderBottomWidth: 1,
        paddingVertical: 16,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 0,
        marginTop: -4,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#666',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});

export default Inbox;
