import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'other';
}

const ChatScreen = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: 'Hi, still need help with your garden?', sender: 'other' },
    ]);
    const [inputText, setInputText] = useState('');

    const sendMessage = () => {
        if (inputText.trim()) {
            setMessages([...messages, { id: Date.now().toString(), text: inputText, sender: 'user' }]);
            setInputText('');
        }
    };

    const renderItem = ({ item }: { item: Message }) => (
        <View style={[
            styles.messageRow,
            item.sender === 'user' ? styles.messageRowUser : styles.messageRowOther
        ]}>
            {item.sender === 'other' && (
                <TouchableOpacity onPress={() => router.push(`/profile/${item.sender}`)}>
                    <Image
                        source={{ uri: 'https://via.placeholder.com/50' }}
                        style={styles.messageAvatar}
                    />
                </TouchableOpacity>
            )}
            <View style={[
                styles.messageBubble,
                item.sender === 'user' ? styles.userMessage : styles.otherMessage
            ]}>
                <Text style={[
                    styles.messageText,
                    item.sender === 'user' ? styles.userText : styles.otherText
                ]}>{item.text}</Text>
            </View>
            {item.sender === 'user' && (
                <Text style={styles.messageTime}>16:30</Text>
            )}
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 48.5 : 0}
        >
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push(`/profile/${id}`)}>
                        <Image
                            source={{ uri: 'https://via.placeholder.com/50' }}
                            style={styles.profileImage}
                        />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.profileName}>Matty Mazowecki</Text>
                        <Text style={styles.chatId}>Chat with ID: {id}</Text>
                    </View>
                    <TouchableOpacity style={styles.searchIcon}>
                        <Ionicons name="search-outline" size={24} color="#000" />
                    </TouchableOpacity>
                </View>

                {/* Chat Messages */}
                <FlatList
                    data={messages}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.chatContainer}
                />

                {/* Input Box */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Write a message..."
                        placeholderTextColor="#888"
                        value={inputText}
                        onChangeText={setInputText}
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                        <Ionicons name="send" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    backButton: {
        padding: 8,
        marginRight: 10,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    headerTextContainer: {
        flex: 1,
        alignItems: 'center',
    },
    profileName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    chatId: {
        fontSize: 12,
        color: '#555',
    },
    searchIcon: {
        padding: 8,
    },
    chatContainer: {
        flexGrow: 1,
        padding: 16,
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginVertical: 8,
    },
    messageRowUser: {
        justifyContent: 'flex-end',
    },
    messageRowOther: {
        justifyContent: 'flex-start',
    },
    messageAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
    },
    messageBubble: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 16,
        maxWidth: '70%',
    },
    userMessage: {
        backgroundColor: 'green',
        borderTopRightRadius: 0,
    },
    otherMessage: {
        backgroundColor: '#e5e5ea',
        borderTopLeftRadius: 0,
    },
    messageText: {
        fontSize: 16,
    },
    userText: {
        color: '#fff',
    },
    otherText: {
        color: '#333',
    },
    messageTime: {
        fontSize: 12,
        color: '#666',
        marginLeft: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    input: {
        flex: 1,
        padding: 10,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginRight: 10,
        fontSize: 16,
    },
    sendButton: {
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 20,
    },
});

export default ChatScreen;
