/**
 * @file tasks-history.tsx
 * @author Maksim Samusevich (xsamus00)
 * @description Tasks history screen
 */


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
    TouchableWithoutFeedback,
    ActivityIndicator,
} from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from 'expo-router';
import { FIRESTORE } from '@/firebaseConfig';
import { collection, getDocs, doc, setDoc, deleteDoc, query, where, addDoc } from "firebase/firestore";

export interface PersonalInfoProps {
    testID?: string,
}

interface Card {
    id: string;
    name: string;
    last4: string;
    expiry: string;
}

interface WaitingPaymentTask {
    id: string;
    taskerId: string;
    amount: string;
    fullName?: string;
    avatar?: string;
    date?: string;
}

interface Task {
    id: string;
    taskerId: string;
    date: any; // Firestore timestamp
    description: string;
    price?: string;
    fullName?: string;
    avatar?: string;
}

const TasksHIstory: React.FC<PersonalInfoProps> = (props) => {
    const router = useRouter();

    const [savedCards, setSavedCards] = useState<Card[]>([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const [noCardModalVisible, setNoCardModalVisible] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    const [waitingForPayment, setWaitingForPayment] = useState<WaitingPaymentTask[]>([]);
    const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
    const [tasksCompletedByUser, setTasksCompletedByUser] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    // Load all data on component mount
    useEffect(() => {
        loadAllData();
    }, []);


    // Load all data from Firestore
    const loadAllData = async () => {
        setLoading(true);
        try {
            await fetchSavedCards();
            await fetchWaitingForPayment();
            await fetchCompletedTasksWithDates();
        } catch (error) {
            console.error('Error loading data:', error);
            Alert.alert('Error', 'Unable to load data.');
        } finally {
            setLoading(false);
        }
    };


    // Fetch saved cards from Firestore
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

    // Fetch waiting for payment Taskers
    const fetchWaitingForPayment = async () => {
        try {
            const waitingSnapshot = await getDocs(collection(FIRESTORE, 'waiting_for_payment'));
            if (waitingSnapshot.empty) {
                return;
            }

            const waitingDocs = waitingSnapshot.docs.map(doc => ({
                id: doc.id,
                taskerId: doc.data().taskerId,
                amount: doc.data().amount || '0',
            }));

            if (waitingDocs.length > 0) {
                const qTaskers = query(
                    collection(FIRESTORE, 'taskers'),
                    where('taskerId', 'in', waitingDocs.map(d => d.taskerId))
                );
                const taskersSnapshot = await getDocs(qTaskers);
                const taskersData: { [key: string]: { fullName: string; profilePicture: string; joinedDate?: any } } = {};

                taskersSnapshot.forEach(doc => {
                    const data = doc.data();
                    taskersData[data.taskerId] = {
                        fullName: data.fullName || 'Unknown Tasker',
                        profilePicture: data.profilePicture || 'https://via.placeholder.com/100',
                        joinedDate: data.joinedDate
                    };
                });

                const tasks = waitingDocs.map(wDoc => {
                    const tInfo = taskersData[wDoc.taskerId] || { fullName: 'Unknown Tasker', profilePicture: 'https://via.placeholder.com/100', joinedDate: null };
                    let date = 'Unknown Date';
                    if (tInfo.joinedDate && tInfo.joinedDate.seconds) {
                        date = new Date(tInfo.joinedDate.seconds * 1000).toLocaleDateString();
                    }
                    return {
                        ...wDoc,
                        fullName: tInfo.fullName,
                        avatar: tInfo.profilePicture,
                        date: date,
                    };
                });

                setWaitingForPayment(tasks);
            }
        } catch (error) {
            console.error('Error fetching waiting_for_payment:', error);
            Alert.alert('Error', 'Unable to load waiting for payment tasks.');
        }
    };


    // Fetch completed tasks with dates
    const fetchCompletedTasksWithDates = async () => {
        try {
            const completedSnapshot = await getDocs(collection(FIRESTORE, 'completed_tasks'));
            const completedData: Task[] = completedSnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            })) as Task[];

            const completedByYouSnapshot = await getDocs(collection(FIRESTORE, 'completed_tasks_by_you'));
            const completedByYouData: Task[] = completedByYouSnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            })) as Task[];

            const allTaskerIds = Array.from(new Set([...completedData.map(t => t.taskerId), ...completedByYouData.map(t => t.taskerId)]));

            let taskersData: { [key: string]: { fullName: string, profilePicture: string } } = {};
            if (allTaskerIds.length > 0) {
                const qTaskers = query(collection(FIRESTORE, 'taskers'), where('taskerId', 'in', allTaskerIds));
                const taskersSnapshot = await getDocs(qTaskers);
                taskersSnapshot.forEach(doc => {
                    const data = doc.data();
                    taskersData[data.taskerId] = {
                        fullName: data.fullName || 'Unknown Tasker',
                        profilePicture: data.profilePicture || 'https://via.placeholder.com/100',
                    };
                });
            }

            // Load payments
            const paymentsSnapshot = await getDocs(collection(FIRESTORE, 'payments'));
            const paymentsData = paymentsSnapshot.docs.map(doc => doc.data());
            const paymentsByTasker: { [key: string]: any } = {};
            paymentsData.forEach(pay => {
                if (pay.taskerId) {
                    paymentsByTasker[pay.taskerId] = pay.date;
                }
            });

            // Load payouts
            const payoutsSnapshot = await getDocs(collection(FIRESTORE, 'payouts'));
            const payoutsData = payoutsSnapshot.docs.map(doc => doc.data());
            const payoutsByTasker: { [key: string]: any } = {};
            payoutsData.forEach(payout => {
                if (payout.taskerId) {
                    payoutsByTasker[payout.taskerId] = payout.date;
                }
            });

            const addInfoAndDateForCompleted = (task: Task) => {
                const info = taskersData[task.taskerId] || { fullName: 'Unknown Tasker', profilePicture: 'https://via.placeholder.com/100' };
                const date = paymentsByTasker[task.taskerId];
                return {
                    ...task,
                    fullName: info.fullName,
                    avatar: info.profilePicture,
                    date: date ? new Date(date.seconds * 1000).toLocaleDateString() : 'No Date'
                };
            };

            const addInfoAndDateForCompletedByYou = (task: Task) => {
                const info = taskersData[task.taskerId] || { fullName: 'Unknown Tasker', profilePicture: 'https://via.placeholder.com/100' };
                const date = payoutsByTasker[task.taskerId];
                return {
                    ...task,
                    fullName: info.fullName,
                    avatar: info.profilePicture,
                    date: date ? new Date(date.seconds * 1000).toLocaleDateString() : 'No Date'
                };
            };

            setCompletedTasks(completedData.map(addInfoAndDateForCompleted));
            setTasksCompletedByUser(completedByYouData.map(addInfoAndDateForCompletedByYou));

        } catch (error) {
            console.error('Error fetching completed tasks with dates:', error);
            Alert.alert('Error', 'Unable to fetch tasks and their dates from database.');
        }
    };


    // Handle payment button press
    const handlePayment = (taskId: string) => {
        const foundTask = waitingForPayment.find(t => t.id === taskId);
        if (!foundTask) {
            Alert.alert('Error', 'Task not found in waiting_for_payment.');
            return;
        }

        if (savedCards.length === 0) {
            setNoCardModalVisible(true);
        } else {
            setSelectedTaskId(taskId);
            setModalVisible(true);
        }
    };


    // Handle payment with card
    const handlePaymentWithCard = async (cardId: string) => {
        try {
            if (!selectedTaskId) return;
            const task = waitingForPayment.find(t => t.id === selectedTaskId);
            if (!task) {
                Alert.alert('Error', 'Task not found in waiting_for_payment.');
                setModalVisible(false);
                return;
            }

            const paymentId = `pay_${Math.random().toString(36).substr(2, 9)}`;
            await setDoc(doc(collection(FIRESTORE, 'payments')), {
                paymentId: paymentId,
                taskerId: task.taskerId,
                userId: '202',
                amount: task.amount,
                date: new Date(),
            });

            await addDoc(collection(FIRESTORE, 'completed_tasks'), {
                taskerId: task.taskerId,
            });

            // Delete from waiting_for_payment
            await deleteDoc(doc(FIRESTORE, 'waiting_for_payment', task.id));

            // Update UI
            setWaitingForPayment(prev => prev.filter(t => t.id !== task.id));

           // Alert.alert('Success', `Payment of €${task.amount} for ${task.fullName} completed.`);
            setModalVisible(false);

            await loadAllData();
        } catch (error) {
            console.error('Error processing payment:', error);
            Alert.alert('Error', 'Payment failed.');
        }
    };


    // Render payment item in FlatList
    const renderPaymentItem = ({ item }: { item: WaitingPaymentTask }) => (
        <View style={styles.taskItem}>
            <TouchableOpacity onPress={() => router.push(`/profile/${item.taskerId}`)}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
            </TouchableOpacity>
            <View style={styles.taskInfo}>
                <View style={styles.nameAndDescription}>
                    <Text style={styles.userName}>{item.fullName}</Text>

                </View>
                <Text style={styles.date}>{item.date}</Text>
                <Text style={styles.price}>€{item.amount}</Text>
            </View>
            <TouchableOpacity style={styles.payButton} onPress={() => handlePayment(item.id)}>
                <Text style={styles.payButtonText}>Pay now</Text>
            </TouchableOpacity>
        </View>
    );

    // Render task item in FlatList
    const renderTaskItem = ({ item }: { item: Task }) => (
        <View style={styles.taskItem}>
            <TouchableOpacity onPress={() => router.push(`/profile/${item.taskerId}`)}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
            </TouchableOpacity>
            <View style={styles.taskInfo}>
                <View style={styles.nameAndDescription}>
                    <Text style={styles.userName}>{item.fullName}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                </View>
                <Text style={styles.date}>{item.date}</Text>
                {item.price && <Text style={styles.price}>{item.price}</Text>}
            </View>
        </View>
    );


    // Render green loading indicator
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
                <Text style={styles.title}>Tasks history</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {waitingForPayment.length > 0 && (
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
                )}

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
                        <TouchableWithoutFeedback onPress={() => {}}>
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
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            <Modal visible={noCardModalVisible} transparent={true} animationType="fade">
                <TouchableWithoutFeedback onPress={() => setNoCardModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={() => {}}>
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
        fontFamily: 'modernaRegular',
        color: '#888888',
        fontWeight: 'bold',
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
        justifyContent: 'flex-end',

    },
    modalContainer: {
        width: '100%',
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
        width: 340,
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
        backgroundColor: '#333',
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

export default TasksHIstory;
