/**
 * @file chat.tsx
 * @author Maksim Samusevich (xsamus00)
 * @description Chat screen
 */


import React, {useCallback, useEffect, useState} from 'react';
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
    ActivityIndicator,
    Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {useRouter, useLocalSearchParams, useFocusEffect} from 'expo-router';
import { collection, getDoc, doc, arrayUnion, updateDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { FIRESTORE } from '@/firebaseConfig';
import { openChat } from '../(modals)/job_post';
import Colors from "@/constants/Colors";

export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'other';
    timestamp: Timestamp;
}

const ChatScreen = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [username, setUsername] = useState<string>('');
    const [tasker, setTasker] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [imageLoading, setImageLoading] = useState<boolean>(true);

    // Send message
    const sendMessage = async () => {
        if (inputText.trim()) {
            const newMessage: Message = {
                id: Date.now().toString(),
                text: inputText.trim(),
                sender: 'user',
                timestamp: Timestamp.now(),
            };
            setMessages(prevMessages => [...prevMessages, newMessage]);
            setInputText('');

            try {
                const docRef = doc(FIRESTORE, "chats", id);
                await updateDoc(docRef, {
                    messages: arrayUnion({
                        id: newMessage.id,
                        text: newMessage.text,
                        sender: newMessage.sender,
                        timestamp: newMessage.timestamp,
                    })
                });
            } catch (error) {
                console.error('Error sending message:', error);
                Alert.alert('Error', 'Failed to send message.');
            }
        }
    };

    // Fetch chat data
    const fetchChatData = useCallback(async () => {
        try {
            const chatDocRef = doc(FIRESTORE, "chats", id);
            const chatDocSnap = await getDoc(chatDocRef);

            if (!chatDocSnap.exists()) {
                Alert.alert('Error', 'Chat not found.');
                setLoading(false);
                return;
            }

            const chatData = chatDocSnap.data() as { username: string; messages: Message[] };
            setUsername(chatData.username);

            // Filter out messages without timestamp
            const validMessages = (chatData.messages || []).filter(msg => msg.timestamp && msg.timestamp.seconds);
            setMessages(validMessages);

            // Fetch tasker data
            const taskersCollection = collection(FIRESTORE, "taskers");
            const taskerQuery = query(taskersCollection, where("fullName", "==", chatData.username));
            const taskerSnapshot = await getDocs(taskerQuery);

            if (!taskerSnapshot.empty) {
                const taskerData = taskerSnapshot.docs[0].data();
                setTasker(taskerData);
            } else {
                Alert.alert('Error', 'Tasker not found.');
            }

            setLoading(false);
        } catch (error) {
            console.error("Error fetching chat data:", error);
            Alert.alert('Error', 'Failed to load chat data.');
            setLoading(false);
        }
    }, [id]);


    useFocusEffect(
        useCallback(() => {
            fetchChatData();
        }, [fetchChatData])
    );

    // Render chat messages
    const renderItem = ({ item }: { item: Message }) => (
        <View style={[
            styles.messageRow,
            item.sender === 'user' ? styles.messageRowUser : styles.messageRowOther
        ]}>
            {item.sender === 'other' && tasker && (
                <TouchableOpacity onPress={() => router.push(`/profile/${tasker.taskerId}`)}>
                    <Image
                        source={{ uri: tasker.profilePicture || 'https://via.placeholder.com/50' }}
                        style={styles.messageAvatar}
                        onLoadEnd={() => {}}
                        onError={() => console.log('Error loading avatar')}
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
            {item.sender === 'user' && tasker && (
                <Text style={styles.messageTime}>{item.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            )}
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.loading}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </SafeAreaView>
        );
    }
    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        >
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <TouchableOpacity onPress={() => router.push(`/profile/${tasker?.taskerId}`)}>
                            <Image
                                source={{ uri: tasker?.profilePicture || 'https://via.placeholder.com/50' }}
                                style={styles.profileImage}
                                onLoadEnd={() => setImageLoading(false)}
                                onError={() => {
                                    setImageLoading(false);
                                    Alert.alert('Error', 'Failed to load profile image.');
                                }}
                            />
                            {imageLoading && (
                                <ActivityIndicator
                                    style={styles.imageLoader}
                                    size="small"
                                    color="#0000ff"
                                />
                            )}
                        </TouchableOpacity>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.profileName}>{username}</Text>
                            <Text style={styles.chatId}>Chat ID: {id}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.searchIcon}>
                        <Ionicons name="search-outline" size={24} color="#000" />
                    </TouchableOpacity>
                </View>

                {/* Chat Messages */}
                <FlatList
                    data={messages.sort((a, b) => a.timestamp.seconds - b.timestamp.seconds)}
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
                        multiline
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
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    backButton: {
        padding: 8,
    },
    headerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    imageLoader: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -10,
        marginTop: -10,
    },
    headerTextContainer: {
        marginLeft: 12,
    },
    profileName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    chatId: {
        fontSize: 12,
        color: '#666',
    },
    searchIcon: {
        padding: 8,
    },
    chatContainer: {
        flexGrow: 1,
        padding: 16,
        justifyContent: 'flex-end',
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
        alignItems: 'flex-end',
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
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 20,
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

export default ChatScreen;
