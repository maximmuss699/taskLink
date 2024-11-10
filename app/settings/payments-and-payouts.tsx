import React from 'react';
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

export interface PersonalInfoProps {
    testID?: string,
}

// Example data
const paymentData = [
    { id: '1', name: 'Alice Johnson', avatar: 'https://via.placeholder.com/100', date: '2023.11.01', amount: '50 €' },
    { id: '2', name: 'Bob Smith', avatar: 'https://via.placeholder.com/100', date: '2023.10.20', amount: '30 €' },
    // ... more data
];

const payoutData = [
    { id: '1', name: 'John Doe', avatar: 'https://via.placeholder.com/100', date: '2023.11.05', amount: '100 €' },
    { id: '2', name: 'Emily Rose', avatar: 'https://via.placeholder.com/100', date: '2023.10.25', amount: '75 €' },
    // ... more data
];

const PersonalInformation: React.FC<PersonalInfoProps> = (props) => {
    const router = useRouter();

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
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Payment methods</Text>
                    </View>
                    <Text style={styles.description}>
                        Add a payment method for your future tasks.
                    </Text>
                </View>

                <TouchableOpacity style={styles.addButton} testID="add-payment-button">
                    <Text style={styles.addButtonText}>Add Payment Method</Text>
                </TouchableOpacity>

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
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 12,
    },
    description: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
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
    footerText: {
        fontSize: 18,
        fontFamily: 'modernaRegular',
        color: '#888888',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
        paddingBottom: 40,
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
});

export default PersonalInformation;
