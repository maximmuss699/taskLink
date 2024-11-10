import React, { useState } from 'react';
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
} from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from 'expo-router';

export interface PersonalInfoProps {
    testID?: string,
}

const paymentData = [
    { id: '1', name: 'Alice Johnson', avatar: 'https://via.placeholder.com/100', date: '2023.11.01', amount: '50 €' },
    { id: '2', name: 'Bob Smith', avatar: 'https://via.placeholder.com/100', date: '2023.10.20', amount: '30 €' },
];

const payoutData = [
    { id: '1', name: 'John Doe', avatar: 'https://via.placeholder.com/100', date: '2023.11.05', amount: '100 €' },
    { id: '2', name: 'Emily Rose', avatar: 'https://via.placeholder.com/100', date: '2023.10.25', amount: '75 €' },
];

const Payments: React.FC<PersonalInfoProps> = (props) => {
    const router = useRouter();
    const [isModalVisible, setModalVisible] = useState(false);
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState(''); // Добавляем состояние для CVV
    const [savedCard, setSavedCard] = useState<{ name: string; number: string; expiry: string } | null>(null);

    const handleAddPayment = () => {
        if (cardName && cardNumber && expiryDate && cvv) { // Проверяем наличие CVV
            setSavedCard({
                name: cardName,
                number: cardNumber,
                expiry: expiryDate,
            });
            setModalVisible(false);
            setCardName('');
            setCardNumber('');
            setExpiryDate('');
            setCvv(''); // Очищаем CVV
        } else {
            Alert.alert('Please fill in all fields');
        }
    };

    const handleDeleteCard = () => {
        Alert.alert(
            'Delete Card',
            'Are you sure you want to delete this card?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => setSavedCard(null) },
            ]
        );
    };

    const renderItem = ({ item, isPayout }: { item: typeof paymentData[0], isPayout: boolean }) => (
        <View style={styles.paymentItem}>
            <TouchableOpacity onPress={() => router.push(`/profile/${item.id}`)}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
            </TouchableOpacity>
            <View style={styles.paymentInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.date}>{item.date}</Text>
            </View>
            <Text style={[styles.amount, isPayout ? styles.payoutAmount : styles.paymentAmount]}>
                {item.amount}
            </Text>
        </View>
    );

    const handleExpiryDateChange = (text: string) => {
        // Удаляем все символы кроме цифр
        let cleaned = text.replace(/[^\d]/g, '');
        if (cleaned.length > 4) {
            cleaned = cleaned.slice(0, 4);
        }

        if (cleaned.length > 2) {
            cleaned = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
        }

        setExpiryDate(cleaned);
    };

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

                {/* Display saved card information */}
                {savedCard && (
                    <TouchableOpacity onPress={handleDeleteCard}>
                        <View style={styles.savedCardContainer}>
                            <View style={styles.cardIcon}>
                                <Ionicons name="card-outline" size={30} color="#fff" />
                            </View>
                            <View style={styles.cardDetails}>
                                <Text style={styles.cardName}>{savedCard.name}</Text>
                                <Text style={styles.cardInfo}>
                                    {savedCard.number} • {savedCard.expiry}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)} testID="add-payment-button">
                    <Text style={styles.addButtonText}>Add Payment Method</Text>
                </TouchableOpacity>

                {/* Your Payments Section */}
                <View style={styles.content}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Your payments</Text>
                    </View>
                    <FlatList
                        data={paymentData}
                        renderItem={({ item }) => renderItem({ item, isPayout: false })}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.paymentList}
                        scrollEnabled={false}
                    />
                </View>

                {/* Your Payouts Section */}
                <View style={styles.content}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Your payouts</Text>
                    </View>
                    <FlatList
                        data={payoutData}
                        renderItem={({ item }) => renderItem({ item, isPayout: true })}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={[styles.paymentList, styles.lastList]}
                        scrollEnabled={false}
                    />
                </View>
                <Text style={styles.footerText}>taskLink</Text>
            </ScrollView>

            {/* Modal for Adding Payment Method */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
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

                                    {/* Поле для имени держателя карты */}
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

                                    {/* Поле для номера карты */}
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

                                    {/* Поле для даты истечения срока действия */}
                                    <View style={styles.inputContainer}>
                                        <Ionicons name="calendar-outline" size={20} color="#666" style={styles.inputIcon} />
                                        <TextInput
                                            placeholder="Expiry Date (MM/YY)"
                                            placeholderTextColor="#aaa"
                                            value={expiryDate}
                                            onChangeText={handleExpiryDateChange} // Используем специальный обработчик
                                            style={styles.input}
                                            keyboardType="numeric"
                                            maxLength={5}
                                        />
                                    </View>

                                    {/* Поле для CVV-кода */}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        paddingBottom: 10,
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
    inputContainer: { // Новый стиль для контейнера с иконкой и полем ввода
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
    inputIcon: { // Новый стиль для иконки внутри поля ввода
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
        height: 20, // Добавляем 20 единиц высоты под кнопками
    },
});

export default Payments;
