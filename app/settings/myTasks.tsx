/**
 * @file myTasks.tsx
 * @author Jakub Zelenay (xzelen29)
 * @description My tasks screen
 */

import React, { useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { SafeAreaView, Text, StyleSheet, View, TouchableOpacity, FlatList, ActivityIndicator, Alert } from "react-native";
import { FIRESTORE } from "@/firebaseConfig";
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from "firebase/firestore";
import { userId } from "./personal-information";
import { jobPost } from "../(tabs)/index";

const MyTasks = () => {
    const router = useRouter();
    const [tasks, setTasks] = useState<jobPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState<string>('');

    useEffect(() => {
        const fetchUsername = async () => {
            try {
                const userDocRef = doc(FIRESTORE, 'users', userId);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const data = userDoc.data();
                    if (data) {
                        setUserName(data.firstName + ' ' + data.lastName);
                    } else {
                        console.log('Error', 'User data is empty');
                    }
                } else {
                    console.log('Error', 'User not found');
                }
            } catch (error) {
                console.log('Error', error);
            }
        };

        fetchUsername();
    }, [userId]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const q = query(collection(FIRESTORE, 'posts'), where('username', '==', userName));
                const querySnapshot = await getDocs(q);
                const fetchedTasks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as jobPost));
                setTasks(fetchedTasks);
            } catch (error) {
                console.error("Error fetching tasks: ", error);
            } finally {
                setLoading(false);
            }
        };

        if (userName) {
            fetchTasks();
        }
    }, [userName]);

    const handleDelete = (id: string) => {
        Alert.alert(
            "Delete Post",
            "Are you sure you want to delete this post?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(FIRESTORE, 'posts', id));
                            setTasks(tasks.filter(task => task.id !== id));
                        } catch (error) {
                            console.error("Error deleting post: ", error);
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000000" />
                </TouchableOpacity>
                <Text style={styles.title}>My tasks</Text>
            </View>
            {loading ? (
                <ActivityIndicator size="large" color="#000000" style={styles.loadingIndicator} />
            ) : (
                <FlatList
                    data={tasks}
                    renderItem={({ item }) => (
                        <View style={styles.taskContainer}>
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.JobAdvertisement, { backgroundColor: item.offeringTask ? "#D9D9D9" : "#8eb28e" }]}
                                onPress={() =>
                                    router.push({
                                        pathname: '/(modals)/job_post',
                                        params: {
                                            id: item.id,
                                            username: item.username,
                                            location: item.address.locality,
                                            job_name: item.title,
                                            date: item.date.toDate().toLocaleDateString(),
                                            price: item.price,
                                            description: item.description,
                                            images: item.images,
                                            post_type: item.offeringTask.toString()
                                        }
                                    })
                                }
                            >
                                <View style={styles.jobInfo}>
                                    <Text style={styles.jobNameText}>{item.title}</Text>
                                    <Text style={[styles.locText, { fontSize: 16, marginBottom: 3, marginLeft: 0 }]}>{item.address.locality}</Text>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                                        <Text style={[styles.dateSytle, { color: 'black', marginLeft: 2 }]}>{item.date.toDate().toLocaleDateString()}</Text>
                                        <Text style={styles.costStyle}>{item.price} €</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                                <Ionicons name="trash" size={24} color="#ffffff" />
                            </TouchableOpacity>
                        </View>
                    )}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.scrollView}
                />
            )}
        </SafeAreaView>
    );
}

export default MyTasks;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        paddingTop: 16,
        paddingHorizontal: 16,
        fontFamily: 'mon-b',
        fontSize: 24,
        flexDirection: 'row',
    },
    title: {
        fontSize: 30,
        fontWeight: '700',
        color: '#000',
        textAlign: 'left',
        fontFamily: 'mon-b',
    },
    backButton: {
        padding: 8,
        marginBottom: 8,
    },
    scrollView: {
        padding: 16,
    },
    JobAdvertisement: {
        marginBottom: 20,
        alignItems: "flex-start",
        width: "80%",
        borderRadius: 15,
        overflow: "hidden",
        flexDirection: "column",
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 5,
    },
    jobInfo: {
        padding: 15,
    },
    jobUserText: {
        fontSize: 16,
        fontFamily: 'mon-b',
    },
    jobNameText: {
        fontSize: 18,
        fontFamily: 'mon-b',
        marginBottom: 5,
    },
    locText: {
        fontSize: 22,
        fontFamily: 'mon-b',
        fontWeight: 'bold',
        marginTop: 5,
        marginLeft: 5,
        color: '#000',
    },
    dateSytle: {
        fontSize: 14,
        fontFamily: 'mon',
        color: "#333",
    },
    costStyle: {
        fontSize: 16,
        fontFamily: 'mon-b',
        color: '#000',
    },
    loadingIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    taskContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
    deleteButton: {
        width: '18%',
        backgroundColor: '#ff0000',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
        height: '87%',
        marginLeft: 10,
    },
});