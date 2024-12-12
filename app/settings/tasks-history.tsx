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
    Modal,
    Alert,
    TouchableWithoutFeedback
} from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from 'expo-router';
import { FIRESTORE } from '@/firebaseConfig';
import { collection, getDocs } from "firebase/firestore";

export interface PersonalInfoProps {
    testID?: string,
}

interface Card {
    id: string;
    name: string;
    last4: string;
    expiry: string;
}

const waitingForPayment = [
    { id: '1', name: 'John Smith', avatar: 'https://via.placeholder.com/100', date: '2023.11.20', description: '', price: '52.00 EUR' },
    { id: '2', name: 'Jane Doe', avatar: 'https://via.placeholder.com/100', date: '2023.11.15', description: '', price: '75.00 EUR' },
];

const completedTasks = [
    { id: '1', name: 'Alice Johnson', avatar: 'https://via.placeholder.com/100', date: '2023.11.01', description: 'Grocery shopping' },
    { id: '2', name: 'Bob Smith', avatar: 'https://via.placeholder.com/100', date: '2023.10.20', description: 'Dog walking' },
    { id: '3', name: 'Charlie Brown', avatar: 'https://via.placeholder.com/100', date: '2023.10.15', description: 'Lawn mowing' },
];

const tasksCompletedByUser = [
    { id: '1', name: 'John Doe', avatar: 'https://via.placeholder.com/100', date: '2023.11.05', description: 'Furniture assembly' },
    { id: '2', name: 'Emily Rose', avatar: 'https://via.placeholder.com/100', date: '2023.10.25', description: 'Painting' },
];

const PersonalInformation: React.FC<PersonalInfoProps> = (props) => {
    const router = useRouter();
    const [savedCards, setSavedCards] = useState<Card[]>([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [noCardModalVisible, setNoCardModalVisible] = useState(false);

    useEffect(() => {
        const fetchSavedCards = async () => {
            try {
                const cardsSnapshot = await getDocs(collection(FIRESTORE, 'cards'));
                const cardsData = cardsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Card[];
                setSavedCards(cardsData);
            } catch (error) {
                console.error('Error fetching saved cards:', error);
                Alert.alert('Error', 'Unable to fetch saved cards.');
            }
        };

        fetchSavedCards();
    }, []);

    const handlePayment = (taskId: string) => {
        if (savedCards.length === 0) {
            setNoCardModalVisible(true);
        } else {
            setSelectedTaskId(taskId);
            setModalVisible(true);
        }
    };

    const handlePaymentWithCard = async (cardId: string) => {
        try {
            console.log(`Processing payment for task ${selectedTaskId} using card ${cardId}`);
            Alert.alert('Success', 'Payment completed successfully!');
            setModalVisible(false);
        } catch (error) {
            console.error('Error processing payment:', error);
            Alert.alert('Error', 'Payment failed.');
        }
    };

    const renderPaymentItem = ({ item }: { item: typeof waitingForPayment[0] }) => (
        <View style={styles.taskItem}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.taskInfo}>
                <View style={styles.nameAndDescription}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                </View>
                <Text style={styles.date}>{item.date}</Text>
                <Text style={styles.price}>{item.price}</Text>
            </View>
            <TouchableOpacity style={styles.payButton} onPress={() => handlePayment(item.id)}>
                <Text style={styles.payButtonText}>Pay now</Text>
            </TouchableOpacity>
        </View>
    );

    const renderTaskItem = ({ item }: { item: typeof completedTasks[0] }) => (
        <View style={styles.taskItem}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.taskInfo}>
                <View style={styles.nameAndDescription}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                </View>
                <Text style={styles.date}>{item.date}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} testID={props.testID ?? "personal-info"}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>Tasks history</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Waiting for Payment</Text>
                    </View>
                    <FlatList
                        data={waitingForPayment}
                        renderItem={renderPaymentItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.taskList}
                        scrollEnabled={false}
                    />
                </View>

                <View style={styles.content}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Recently completed</Text>
                    </View>
                    <FlatList
                        data={completedTasks}
                        renderItem={renderTaskItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.taskList}
                        scrollEnabled={false}
                    />
                </View>

                <View style={styles.content}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Tasks completed by you</Text>
                    </View>
                    <FlatList
                        data={tasksCompletedByUser}
                        renderItem={renderTaskItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={[styles.taskList]}
                        scrollEnabled={false}
                    />
                </View>
                <Text style={styles.footerText}>taskLink</Text>
            </ScrollView>

            <Modal visible={isModalVisible} transparent={true} animationType="fade">
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Select Payment Method</Text>


                            {savedCards.length > 0 ? (
                                savedCards.map((card) => (
                                    <TouchableOpacity
                                        key={card.id}
                                        onPress={() => handlePaymentWithCard(card.id)}
                                    >
                                        <View style={styles.savedCardContainer}>
                                        <View style={styles.cardIcon}>
                                            <Ionicons name="card-outline" size={30} color="#fff" />
                                        </View>
                                        <Text style={styles.cardName}>{card.name}</Text>
                                        <Text style={styles.cardInfo}>
                                            **** **** **** {card.last4} • {card.expiry}
                                        </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <Text>No saved cards available.</Text>
                            )}

                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            <Modal visible={noCardModalVisible} transparent={true} animationType="fade">
                <TouchableWithoutFeedback onPress={() => setNoCardModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>No Cards Found</Text>
                            <Text style={styles.modalDescription}>Please add a card to proceed with payments.</Text>
                            <TouchableOpacity
                                style={styles.addCardButton}
                                onPress={() => {
                                    setNoCardModalVisible(false);
                                    router.push('/settings/payments-and-payouts');
                                }}
                            >
                                <Text style={styles.addCardButtonText}>Go to Payments</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
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
    taskList: {
        marginTop: 10,
    },
    taskItem: {
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
    taskInfo: {
        flex: 1,
    },
    nameAndDescription: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    description: {
        fontSize: 16,
        color: '#666',
        marginLeft: 8,
    },
    date: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    footerText: {
        fontSize: 18,
        color: '#888888',
        textAlign: 'center',
        marginTop: 20,
        paddingBottom: 40,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 4,
    },
    payButton: {
        paddingVertical: 10,
        paddingHorizontal: 30,
        backgroundColor: 'green',
        borderRadius: 15,
        alignItems: 'center',
    },
    payButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'mon-b',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 25,
        alignItems: 'flex-start',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        fontFamily: 'mon-b',
    },
    modalDescription: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    addCardButton: {
        backgroundColor: '#000',
        padding: 10,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center',
    },
    addCardButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    savedCardContainer: {
        width: 300,
        height: 110,
        padding: 15,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 15,
        backgroundColor: '#34C759',

    },
    cardName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    cardInfo: {
        fontSize: 14,
        color: '#E0E0E0',

    },
    cancelButton: {
        backgroundColor: '#D10000',
        padding: 10,
        borderRadius: 15,
        marginTop: 10,
        width: '100%',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    cardIcon: {
        backgroundColor: '#34C759',
        padding: 10,
        borderRadius: 25,
        marginRight: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default PersonalInformation;
