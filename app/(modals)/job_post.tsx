import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FIRESTORE } from '@/firebaseConfig';
import { collection, setDoc, getFirestore, onSnapshot, query, where, deleteDoc, getDoc, getDocs, doc } from 'firebase/firestore';
import { renderEval, evaluation } from '../comments/commentMain';
import { jobPost } from '../(tabs)';
import filterPage from '../filters/filterMain';

/* adds post to favourites if its not already... if it is in favourites, it will remove it from favourites */
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

function renderCertification(certification: string, key: number) {
    return (<Text style={styles.basicText} key={key}>{ certification }</Text>)
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
    const [loadedPost, setLoadedPost] = useState<any | undefined>();
    const [taskerId, setTaskerId] = useState<string>("");
    const [taskerCertificates, setTaskerCertificates] = useState<string[]>([]);

    /* fetch whether the post is liked or not... */
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

    /* fetch the post rating */
    useEffect(() => {
        const main = async () => {
            const docRef = doc(FIRESTORE, "posts", id);
            const post: any = await getDoc(docRef);
            if(post.exists()){
                setLoadedPost(post.data());
            }
        }
        main();
    }, []);

    /* fetch the taskerId */
    useEffect(() => {
        const collectionRef = collection(FIRESTORE, "taskers");
        const queryQ = query(collectionRef, where("fullName", "==", username));
        const end = onSnapshot(queryQ, (sshot) => {
            sshot.forEach((data) => {
                setTaskerCertificates(data.data().certificates);
                setTaskerId(data.data().taskerId);
            })
        });
        return () => end();
    }, []);

    var offeringTask = false;
    if (post_type === "false") {
        offeringTask = true;
    }

    // console.log(taskerId);
    // icon setup to make it responsive
    const icon = isFavourite === false ? 'heart-outline' : 'heart';
    return (
        <ScrollView style={styles.ScrollView}>
            <View style={styles.outerView}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
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

                <TouchableOpacity onPress={() => router.push({pathname: "/profile/[taskerId]", params: {taskerId: taskerId}})}>
                    <Text style={styles.Username}>{ username }</Text>
                </TouchableOpacity>

                {username !== "Michael Scott" ? (<TouchableOpacity style={styles.ContactBtn}>
                    <Text style={styles.contactText}>Contact</Text> </TouchableOpacity>) :
                (<TouchableOpacity style={[styles.ContactBtn, { backgroundColor: "" }]}>
                    <Text style={{color: "white"}}>A</Text>
                </TouchableOpacity>)}
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
                <View style={styles.offTaskView}>
                    <View>
                        <Text style={styles.Text}>Certificates</Text>
                        { taskerCertificates.map((certification, key) => renderCertification(certification, key)) }
                    </View>

                    {loadedPost?.rating && (
                    <View style={styles.offTaskView}>
                        <View style={{height: 2, backgroundColor: "black", width: "100%"}}></View>
                        <View style={styles.postRatingView}>
                            <Ionicons name="star" size={25}/>
                            <Text style={[styles.Text, { fontSize: 20 }]}>{ loadedPost?.rating } ({ loadedPost?.ratingCnt })</Text>
                        </View>
                    </View>)}
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
        marginTop: 70,
        backgroundColor: "white"
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
    },
    commentView: {
        flexDirection: "column",
        width: "100%"
    },
    postRatingView: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row"
    },
    offTaskView: {
        width: "100%"
    },
    basicText: {
        fontSize: 14,
        color: '#666',
        margin: 4,
        fontFamily: 'mon',
        marginLeft: 15,
        marginBottom: 15
    },
})

export default Page;
