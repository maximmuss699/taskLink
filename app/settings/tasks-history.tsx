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

// Example task data with name, description, and date
const completedTasks = [
    { id: '1', name: 'Alice Johnson', avatar: 'https://via.placeholder.com/100', date: '2023.11.01', description: 'Grocery shopping' },
    { id: '2', name: 'Bob Smith', avatar: 'https://via.placeholder.com/100', date: '2023.10.20', description: 'Dog walking' },
    { id: '3', name: 'Charlie Brown', avatar: 'https://via.placeholder.com/100', date: '2023.10.15', description: 'Lawn mowing' },
    { id: '4', name: 'David White', avatar: 'https://via.placeholder.com/100', date: '2023.10.10', description: 'House cleaning' },
    { id: '5', name: 'Eve Black', avatar: 'https://via.placeholder.com/100', date: '2023.10.05', description: 'Car washing' },
];

const tasksCompletedByUser = [
    { id: '1', name: 'John Doe', avatar: 'https://via.placeholder.com/100', date: '2023.11.05', description: 'Furniture assembly' },
    { id: '2', name: 'Emily Rose', avatar: 'https://via.placeholder.com/100', date: '2023.10.25', description: 'Painting' },
    { id: '3', name: 'Michael Johnson', avatar: 'https://via.placeholder.com/100', date: '2023.10.10', description: 'Plumbing repair' },
    { id: '4', name: 'Sarah Smith', avatar: 'https://via.placeholder.com/100', date: '2023.10.05', description: 'Gardening' },
    { id: '5', name: 'Tom Brown', avatar: 'https://via.placeholder.com/100', date: '2023.10.01', description: 'Moving help' },
];

const PersonalInformation: React.FC<PersonalInfoProps> = (props) => {
    const router = useRouter();

    const renderItem = ({ item }: { item: typeof completedTasks[0] }) => (
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
                <Text style={styles.title}>Completed Tasks</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Recently completed</Text>
                    </View>
                    <FlatList
                        data={completedTasks}
                        renderItem={renderItem}
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
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={[styles.taskList, styles.lastList]}
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
    taskList: {
        marginTop: 10,
    },
    lastList: {
        paddingBottom: 80,
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
});

export default PersonalInformation;
