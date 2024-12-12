// Payments.tsx

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
    TextInput,
    Alert,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
    KeyboardAvoidingView,
    ActivityIndicator,
} from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from 'expo-router';
import { FIRESTORE } from '@/firebaseConfig';
import { collection, getDocs, query, where, addDoc, deleteDoc, doc } from 'firebase/firestore';
import Colors from "../../constants/Colors";

export interface PersonalInfoProps {
    testID?: string,
}

interface Card {
    id: string;
    name: string;
    last4: string;
    expiry: string;
}

interface PaymentItem {
    id: string;
    taskerId: string;
    date: any;
    amount: string;
    fullName: string;
    profilePicture: string;
}

const Payments: React.FC<PersonalInfoProps> = (props) => {
    const router = useRouter();
    const [isModalVisible, setModalVisible] = useState(false);
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [savedCards, setSavedCards] = useState<Card[]>([]);
    // states for payments and payouts
    const [payments, setPayments] = useState<PaymentItem[]>([]);
    const [payouts, setPayouts] = useState<PaymentItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const paymentsSnapshot = await getDocs(collection(FIRESTORE, 'payments'));
                const payoutsSnapshot = await getDocs(collection(FIRESTORE, 'payouts'));
                // Get data from snapshots and add id field
                const paymentsData = paymentsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                const payoutsData = payoutsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

                // Concatenate payments and payouts data
                const allTransactions = [...paymentsData, ...payoutsData];
                const taskerIds = Array.from(new Set(allTransactions.map(item => item.taskerId)));

                // Receive tasker data
                const taskersData: { [key: string]: { fullName: string; profilePicture: string } } = {};


                // Fetch tasker data in batches of 10
                for (let i = 0; i < taskerIds.length; i += 10) {
                    const batch = taskerIds.slice(i, i + 10);
                    const q = query(collection(FIRESTORE, 'taskers'), where('taskerId', 'in', batch));
                    const taskersSnapshot = await getDocs(q);
                    taskersSnapshot.forEach(doc => {
                        const data = doc.data();
                        taskersData[data.taskerId] = {
                            fullName: data.fullName || 'Unknown Tasker',
                            profilePicture: data.profilePicture || 'https://via.placeholder.com/100',
                        };
                    });
                }

                // Add tasker info to payments
                const paymentsWithTaskerInfo = paymentsData.map(item => ({
                    ...item,
                    fullName: taskersData[item.taskerId]?.fullName || 'Unknown Tasker',
                    profilePicture: taskersData[item.taskerId]?.profilePicture || 'https://via.placeholder.com/100',
                }));
                // Add tasker info to payouts
                const payoutsWithTaskerInfo = payoutsData.map(item => ({
                    ...item,
                    fullName: taskersData[item.taskerId]?.fullName || 'Unknown Tasker',
                    profilePicture: taskersData[item.taskerId]?.profilePicture || 'https://via.placeholder.com/100',
                }));

                // Update state
                setPayments(paymentsWithTaskerInfo);
                setPayouts(payoutsWithTaskerInfo);
            } catch (error) {
                console.error('Error fetching transactions:', error);
                Alert.alert('Error', 'Cant fetch transactions.');
            } finally {
                setLoading(false);
            }
        };

        const fetchSavedCards = async () => {
            try {
                // Fetch saved cards from Firestore
                const cardsSnapshot = await getDocs(collection(FIRESTORE, 'cards'));
                const cardsData = cardsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Card[];
                setSavedCards(cardsData);
            } catch (error) {
                console.error('Error fetching saved cards:', error);
                Alert.alert('Error', 'Cant fetch cards');
            }
        };
        // Fetch transactions and saved cards
        fetchTransactions();
        fetchSavedCards();
    }, []);

    const handleAddPayment = async () => {
        if (cardName && cardNumber && expiryDate && cvv) {
            // Saving only last 4 digits of card number
            const last4 = cardNumber.slice(-4);
            const newCard: Card = {
                id: '',
                name: cardName,
                last4: last4,
                expiry: expiryDate,
            };

            try {
                // Add card to Firestore
                const docRef = await addDoc(collection(FIRESTORE, 'cards'), newCard);
                newCard.id = docRef.id;

                // Update state
                setSavedCards([...savedCards, newCard]);

                // Close modal and clear input fields
                setModalVisible(false);
                setCardName('');
                setCardNumber('');
                setExpiryDate('');
                setCvv('');
            } catch (error) {
                console.error('Error adding card:', error);
                Alert.alert('Error', 'card');
            }
        } else {
            Alert.alert('Please, complete all fields');
        }
    };

    const handleDeleteCard = (id: string) => {
        Alert.alert(
            'Delete Card',
            'Are you sure you want to delete this card?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete', style: 'destructive', onPress: async () => {
                        try {
                            await deleteDoc(doc(FIRESTORE, 'cards', id));
                            setSavedCards(savedCards.filter(card => card.id !== id));
                        } catch (error) {
                            console.error('Error deleting card:', error);
                            Alert.alert('Error', 'cant delete card');
                        }
                    }
                },
            ]
        );
    };

    const renderItem = ({ item, isPayout }: { item: PaymentItem, isPayout: boolean }) => (
        <View style={styles.paymentItem}>
            <TouchableOpacity onPress={() => router.push(`/profile/${item.taskerId}`)}>
                <Image source={{ uri: item.profilePicture }} style={styles.avatar} />
            </TouchableOpacity>
            <View style={styles.paymentInfo}>
                <Text style={styles.userName}>{item.fullName}</Text>
                <Text style={styles.date}>{new Date(item.date.seconds * 1000).toLocaleDateString()}</Text>
            </View>
            <Text style={[styles.amount, isPayout ? styles.payoutAmount : styles.paymentAmount]}>
                {item.amount} EUR
            </Text>
        </View>
    );

    const handleExpiryDateChange = (text: string) => {
        let cleaned = text.replace(/[^\d]/g, '');
        if (cleaned.length > 4) {
            cleaned = cleaned.slice(0, 4);
        }

        if (cleaned.length > 2) {
            cleaned = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
        }

        setExpiryDate(cleaned);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loading}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} testID={props.testID ?? "personal-info"}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>Payment & payouts</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    <Text style={styles.label}>Payment methods</Text>
                    <Text style={styles.description}>
                        Add a payment method for your future tasks.
                    </Text>
                </View>


                {savedCards.map((card) => (
                    <TouchableOpacity key={card.id} onPress={() => handleDeleteCard(card.id)}>
                        <View style={styles.savedCardContainer}>
                            <View style={styles.cardIcon}>
                                <Ionicons name="card-outline" size={30} color="#fff" />
                            </View>
                            <View style={styles.cardDetails}>
                                <Text style={styles.cardName}>{card.name}</Text>
                                <Text style={styles.cardInfo}>
                                    **** **** **** {card.last4} • {card.expiry}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}

                <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)} testID="add-payment-button">
                    <Text style={styles.addButtonText}>Add Payment Method</Text>
                </TouchableOpacity>


                <View style={styles.content}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Your payments</Text>
                    </View>
                    <FlatList
                        data={payments}
                        renderItem={({ item }) => renderItem({ item, isPayout: false })}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.paymentList}
                        scrollEnabled={false}
                    />
                </View>


                <View style={styles.content}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Your payouts</Text>
                    </View>
                    <FlatList
                        data={payouts}
                        renderItem={({ item }) => renderItem({ item, isPayout: true })}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={[styles.paymentList, styles.lastList]}
                        scrollEnabled={false}
                    />
                </View>
                <Text style={styles.footerText}>taskLink</Text>
            </ScrollView>


            <Modal
                visible={isModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                style={styles.modalContainer}
                            >
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>Add Payment Method</Text>


                                    <View style={styles.inputContainer}>
                                        <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                                        <TextInput
                                            placeholder="Card Holder Name"
                                            placeholderTextColor="#aaa"
                                            value={cardName}
                                            onChangeText={setCardName}
                                            style={styles.input}
                                        />
                                    </View>


                                    <View style={styles.inputContainer}>
                                        <Ionicons name="card-outline" size={20} color="#666" style={styles.inputIcon} />
                                        <TextInput
                                            placeholder="Card Number"
                                            placeholderTextColor="#aaa"
                                            value={cardNumber}
                                            onChangeText={setCardNumber}
                                            style={styles.input}
                                            keyboardType="numeric"
                                            maxLength={19}
                                        />
                                    </View>


                                    <View style={styles.inputContainer}>
                                        <Ionicons name="calendar-outline" size={20} color="#666" style={styles.inputIcon} />
                                        <TextInput
                                            placeholder="Expiry Date (MM/YY)"
                                            placeholderTextColor="#aaa"
                                            value={expiryDate}
                                            onChangeText={handleExpiryDateChange}
                                            style={styles.input}
                                            keyboardType="numeric"
                                            maxLength={5}
                                        />
                                    </View>


                                    <View style={styles.inputContainer}>
                                        <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                                        <TextInput
                                            placeholder="CVV"
                                            placeholderTextColor="#aaa"
                                            value={cvv}
                                            onChangeText={setCvv}
                                            style={styles.input}
                                            keyboardType="numeric"
                                            maxLength={4}
                                            secureTextEntry={true}
                                        />
                                    </View>

                                    <View style={styles.modalButtons}>
                                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                                            <Text style={styles.cancelButtonText}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={handleAddPayment} style={styles.saveButton}>
                                            <Text style={styles.saveButtonText}>Save</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.extraSpace} />
                                </View>
                            </KeyboardAvoidingView>
                        </TouchableWithoutFeedback>
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
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 16,
        paddingHorizontal: 16,
        paddingBottom: 10,
        fontSize: 24,
        fontFamily: 'mon-b',
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
        marginLeft: 16,
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
    description: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    savedCardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#34C759',
        padding: 15,
        borderRadius: 10,
        marginHorizontal: 16,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 2, height: 3 },
        elevation: 5,
    },
    cardIcon: {
        backgroundColor: '#34C759',
        padding: 10,
        borderRadius: 25,
        marginRight: 15,
    },
    cardDetails: {
        flex: 1,
    },
    cardName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    cardInfo: {
        fontSize: 16,
        color: '#E0E0E0',
    },
    addButton: {
        width: 203,
        height: 42,
        borderRadius: 10,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginLeft: 16,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '300',
        fontFamily: 'mon-sb',
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
    paymentList: {
        marginTop: 10,
    },
    lastList: {
        paddingBottom: 80,
    },
    paymentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
    },
    paymentInfo: {
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
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    paymentAmount: {
        color: '#FF3B30',
    },
    payoutAmount: {
        color: '#34C759',
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
        borderRadius: 20,
        padding: 20,
        elevation: 10,
    },
    modalContent: {
        width: '100%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: Platform.OS === 'ios' ? 15 : 10,
        marginBottom: 15,
        backgroundColor: '#f9f9f9',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 15,
        marginRight: 10,
        borderRadius: 10,
        backgroundColor: '#ddd',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#333',
        fontWeight: '600',
        fontSize: 16,
    },
    saveButton: {
        flex: 1,
        paddingVertical: 15,
        marginLeft: 10,
        borderRadius: 10,
        backgroundColor: '#34C759',
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        borderRadius: 10,
        marginVertical: 5,
        marginRight: 10,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 12,
        marginTop: 5,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 12,
    },
    extraSpace: {
        height: 20,
    },
});

export default Payments;
