import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import { Href } from "expo-router";

interface Chat {
    id: string;
    name: string;
    lastMessage: string;
    timestamp: string;
    avatar: string;
}

const chats: Chat[] = [
    { id: '1', name: 'Alice Johnson', lastMessage: 'Hi! How are you?', timestamp: '10:30 AM', avatar: 'https://via.placeholder.com/100' },
    { id: '2', name: 'Bob Smith', lastMessage: 'Let\'s meet tomorrow.', timestamp: 'Yesterday', avatar: 'https://via.placeholder.com/100' },
    { id: '3', name: 'Charlie Brown', lastMessage: 'I\'ll send the files later.', timestamp: 'Monday', avatar: 'https://via.placeholder.com/100' },
    { id: '4', name: 'David White', lastMessage: 'Thank you for your help!', timestamp: 'November 1', avatar: 'https://via.placeholder.com/100' },
];

const Inbox = () => {
    const router = useRouter();

    const renderItem = ({ item }: { item: Chat }) => (
        <TouchableOpacity
            style={styles.chatItem}
            onPress={() => router.push(`/chats/${item.id}` as Href<`/chats/${string}`>)}
        >
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.chatInfo}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.lastMessage}>{item.lastMessage}</Text>
            </View>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>Messages</Text>
                <Ionicons name="search-outline" size={26} />
            </View>
            <FlatList
                data={chats}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.chatList}
            />
        </View>
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
        alignItems: 'center', // Center vertically
    },
    header: {
        fontFamily: 'mon-b',
        fontSize: 30,
        color: '#000', // Ensure text color is set
    },
    chatList: {
        paddingHorizontal: 16,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    chatInfo: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    lastMessage: {
        fontSize: 14,
        color: '#666',
        marginTop: 4, // Add some spacing between name and last message
    },
    timestamp: {
        fontSize: 12,
        color: '#999',
    },
});

export default Inbox;
