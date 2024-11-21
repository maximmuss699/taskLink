import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Header } from 'react-native/Libraries/NewAppScreen';
import { FIRESTORE } from '@/firebaseConfig';
import { collection, setDoc, getFirestore, onSnapshot, query, where, deleteDoc, getDocs, doc } from 'firebase/firestore';

async function addToFavourites(id: string) {
    const collectionRef = collection(FIRESTORE, 'favJobs');
    const queryQ = query(collectionRef, where('postId', '==', id));
    const queryResult = await getDocs(queryQ);
    if(queryResult.empty === true) {
        await setDoc(doc(FIRESTORE, 'favJobs', id), { postId: id});
    } else {
    // if the record exists, delete it
        queryResult.forEach(async (element) => {
            if (element.data().postId == id) {
                // document reference for deletion
                const ref = doc(FIRESTORE, 'favJobs', element.id);
                await deleteDoc(ref);
            }
        })
    }
}

const Page = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { username } = useLocalSearchParams<{ username: string }>();
    const { location } = useLocalSearchParams<{ location: string }>();
    const { job_name } = useLocalSearchParams<{ job_name: string }>();
    const { date } = useLocalSearchParams<{ date: string }>();
    const { price } = useLocalSearchParams<{ price: string }>();
    const { description } = useLocalSearchParams<{ description: string }>();
    const { post_type } = useLocalSearchParams<{ post_type: string }>();

    const [isFavourite, setIsFavourite] = useState<boolean>(false);

    useEffect(() => {
        const collectionRef = collection(FIRESTORE, "favJobs");
        const queryQ = query(collectionRef, where('postId', '==', id));
        const end = onSnapshot(queryQ, (sshot) => {
            if (sshot.empty) {
                setIsFavourite(false);
            } else {
                setIsFavourite(true);
            }
        });
        return () => end();
    }, [id]);

    var offeringTask = false;
    if (post_type === "false") {
        offeringTask = true;
    }

    // icon setup to make it responsive
    const icon = isFavourite === false ? 'heart-outline' : 'heart';
    return (
        <ScrollView style={styles.ScrollView}>
            <View style={styles.outerView}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.push({pathname: "/(tabs)"})}>
                        <Ionicons name='chevron-back-outline' size={24}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.backBtn} onPress={() => addToFavourites(id)}>
                        <Ionicons name={icon} size={24}/>
                    </TouchableOpacity>
                </View>
            <View style={styles.textHeader}>
                {offeringTask ? (<TouchableOpacity style={styles.ContactBtn} onPress={() => router.push({pathname: "/comments/commentMain"
                                                                                                         ,params: {id}})}>
                    <Text style={styles.contactText}>Evaluate</Text>
                </TouchableOpacity>): <View style={[styles.ContactBtn, { backgroundColor: "none" }]}></View>}

                <Text style={styles.Username}>{ username }</Text>

                <TouchableOpacity style={styles.ContactBtn}>
                    <Text style={styles.contactText}>Contact</Text>
                </TouchableOpacity>
            </View>
            <View style={{height: 2, backgroundColor: "black", width: "100%", margin: 5, marginTop: 8}}></View>
            <View style={styles.Location}>
                    <Ionicons name="location" size={30}/>
                    <Text style={styles.LocText}>{ location }</Text>
            </View>
            <View style={{height: 2, backgroundColor: "black", width: "100%", margin: 5}}></View>
            <View style={styles.datePrice}>
                <View style={styles.datePriceElem}>
                    <Ionicons name='cash' size={40}/>
                    <Text style={styles.Text}>{ price }</Text>
                </View>
                <View style={styles.datePriceElem}>
                    <Ionicons name='calendar' size={40}/>
                    <Text style={styles.Text}>{ date }</Text>
                </View>
            </View>
                <View style={{height: 2, backgroundColor: "black", width: "100%"}}></View>
                <View style={styles.DescBlock}>
                    <Text style={styles.Text}>Description</Text>
                    <Text style={styles.DescText}>{ description }</Text>
                </View>
                <View style={{height: 2, backgroundColor: "black", width: "100%"}}></View>

                {offeringTask && (
                <View>
                    <View>
                        {/* Kvalifikace */}
                        <Text></Text>
                        <Text>Kvalifikace</Text>
                    </View>
                    <View style={{height: 2, backgroundColor: "black", width: "100%"}}></View>
                    <View>
                        {/* rating */}
                        <Text>3.2</Text>
                    </View>
                    <View style={{height: 2, backgroundColor: "black", width: "100%"}}></View>
                    <View>
                        {/* evaluations */}
                        <Text>Super</Text>
                    </View>
                </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    Username: {
        textAlign: "center",
        fontSize: 22,
        fontFamily: 'mon-b',
        fontWeight: 'bold',
        color: 'black',
        alignSelf: 'center'
    },
    LocText: {
        marginTop: 18,
        textAlign: "center",
        fontSize: 20,
        fontFamily: 'mon-b',
        fontWeight: 'bold',
        color: 'black',
    },
    Text: {
        margin: 10,
        fontSize: 18,
        fontFamily: 'mon-b',
        fontWeight: 'bold',
        color: 'black',
    },
    datePrice: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    datePriceElem: {
        margin: 15,
        flexDirection: "row"
    },
    DescText: {
        margin: 10,
        fontSize: 15,
        fontFamily: 'mon',
        color: 'black',
    },
    backBtn: {
        margin: 20,
        height: 40,
        width: 40,
        backgroundColor: "white",
        borderRadius: 50,
        shadowColor: '#DEDEDE',
        shadowOpacity: 1,
        shadowOffset: { width: 0, height: 1},
        alignItems: "center",
        justifyContent: "center"
    },
    ScrollView: {
        marginTop: 70
    },
    Location: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },
    textHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        alignItems: "center",
        width: "100%"
    },
    ContactBtn: {
        width: 100,
        height: 28,
        backgroundColor: "green",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    contactText: {
        color: "white",
        fontFamily: 'mon-b'
    },
    outerView: {
        alignItems: "center"
    },
    DescBlock: {
        alignItems: "flex-start",
        width: "100%"
    },
    header: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative"
    }
})

export default Page;
