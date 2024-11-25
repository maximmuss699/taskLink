import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import Ionicons from "@expo/vector-icons/Ionicons";
import Colors from "@/constants/Colors";
import { useRouter } from 'expo-router';
import { FIRESTORE } from '@/firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { job_ad, jobPost } from '../(tabs)/index';

const Explore = () => {
    const router = useRouter();
    const [loadedPosts, setPosts] = useState<jobPost[]>([]);

    useEffect(() => {
        const collectionRef = collection(FIRESTORE, "posts");
        const queryQ = query(collectionRef, where('offeringTask', '==', true));
        const end = onSnapshot(queryQ, (sshot) => {
            const jobArray: any = [];
            sshot.docs.forEach((data) => {
                jobArray.push({ id: data.id , ...data.data() });
            })
            setPosts(jobArray);
        });
        return () => end();
    }, ([]));

    return (
        <View style={styles.mainView}>
            <Text style={styles.MainText}>Explore Jobs</Text>
            <TouchableOpacity style={styles.SearchBtn} onPress={() => router.push({pathname: '/(modals)/categories'})}>
                    <Ionicons style={styles.SearchIcon} name='search-outline' size={24}/>
                    <Text style={styles.SearchBtnText}>What job are you searching for?</Text>
            </TouchableOpacity>

            <View style={styles.jobPanel}>
                <FlatList
                    data={loadedPosts}
                    renderItem = {({ item }) => job_ad(item.id,
                                                      item.username,
                                                      item.address.locality,
                                                      item.title,
                                                      item.date.toDate().toLocaleDateString(),
                                                      item.price,
                                                      router,
                                                      item.image,
                                                      item.offeringTask,
                                                      item.description,)}
                    keyExtractor={(item) => item.id}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainView: {
        backgroundColor: "white",
        flex: 1
    },
    MainText: {
        fontSize: 28,
        fontFamily: 'mon-b',
        fontWeight: 'bold',
        color: 'black',
        margin: 10
    },
    LocationText: {
        fontSize: 22,
        fontFamily: 'mon-b',
        fontWeight: 'bold',
        marginTop: 5,
        marginLeft: 5,
        color: Colors.primary
    },
    SearchBtn: {
        height: 40,
        width: "80%",
        marginTop: 8,
        alignSelf: 'center',
        borderWidth: 2,
        borderColor: '#DEDEDE',
        borderRadius: 30,
        backgroundColor: "white",
        shadowColor: '#DEDEDE',
        shadowOpacity: 1,
        shadowOffset: { width: 0, height: 1},
        flexDirection: 'row'
    },
    SearchBtnText: {
        fontFamily: 'mon-b',
        fontWeight: 'bold',
        color: 'black',
        marginLeft: 10,
        marginRight: 30,
        marginTop: 10,
        marginBottom: 10
    },
    SearchIcon: {
        marginLeft: 15,
        marginTop: 5
    },
    SearchLink: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%"
    },
    jobPanel: {
        flex: 1,
        marginTop: 20
    }
})

export default Explore;
