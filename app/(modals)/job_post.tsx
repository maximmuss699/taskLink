import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, FlatList, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams, Router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FIRESTORE } from '@/firebaseConfig';
import { updateDoc, collection, setDoc, getFirestore, onSnapshot, query, where, deleteDoc, getDoc, getDocs, doc, limit, addDoc } from 'firebase/firestore';
import { evaluation } from '../comments/commentMain';
import Carousel from 'react-native-reanimated-carousel';
import { jobPost } from '../(tabs)';
import filterPage from '../filters/filterMain';
import { Message } from '../chats/[id]';

/* chat interface */
export interface chat {
    username: string;
    messages: Message[];
};

// function rendering single comment
const renderEval = (id: string, rating: number, comment: string, commId: string, router: any, username: string, taskerId: string | null, current_user: string) => {
    return(
        <View style={{ width: "100%" }}>
        <View style={{ height: 2, backgroundColor: "black", width: "100%", margin: 5, marginBottom: 8, alignSelf: "center" }}></View>
        <View style={styles.singleComm}>
            <View style={styles.signleCommL}>
                {taskerId ? (<TouchableOpacity onPress={() => router.push({pathname: "/profile/[taskerId]", params: {taskerId: taskerId}})}>
                    <Text style={[styles.evalText, { marginBottom: 8} ]}>{ username }</Text>
                </TouchableOpacity>) :
                (<Text style={[styles.evalText, { marginBottom: 8} ]}>{ username }</Text>)}
                <Text style={styles.text}>{comment}</Text>
            </View>
            <View style={styles.outerSingleCommR}>
                <View style={styles.singleCommR}>
                    <Ionicons name='star' size={15}/>
                    <Text style={styles.evalText}>{rating}/5</Text>
                </View>
            </View>
        </View>
        </View>
    )
}


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

/* opens chat */
export async function openChat(username: string, router: Router) {
    // fetch the id
    const collectionRef = collection(FIRESTORE, "chats");
    const queryQ = query(collectionRef, where("username", "==", username));
    const docRef = await getDocs(queryQ);
    let chatId: string | null = null;
    docRef.forEach((singleDoc) => {
        if (singleDoc.exists()) {
            chatId = singleDoc.id;
        }
    });

    // redirect to chat
    if (chatId !== null) {
        router.push({ pathname: '/chats/[id]', params: { id: chatId } });
    } else { // or create a new one
        let newChat: chat = { messages: [], username: username };
        const docRef = await addDoc(collectionRef, newChat);
        router.push({ pathname: '/chats/[id]', params: { id: docRef.id } });
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

    const [images, setImages] = useState<string[] | undefined>();
    const [currentUser, setCurrentUser] = useState<string>("");

    const [isFavourite, setIsFavourite] = useState<boolean>(false);
    const [loadedPost, setLoadedPost] = useState<any | undefined>();
    const [taskerId, setTaskerId] = useState<string>("");
    const [taskerCertificates, setTaskerCertificates] = useState<string[]>([]);

    const [loadedEvals, setEvals] = useState<evaluation[]>([]);


    /* get the username */
    useEffect(() => {
        const get_username = async () => {
            const collectionRef = collection(FIRESTORE, "users");
            const docs = await getDocs(collectionRef);
            if (!docs.empty) {
                setCurrentUser(docs.docs[0].data().firstName + " " + docs.docs[0].data().lastName);
            }
        }
        get_username();
    }, []);

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

    /* fetch the post rating and pictures */
    useEffect(() => {
        const main = async () => {
            const docRef = doc(FIRESTORE, "posts", id);
            const post: any = await getDoc(docRef);
            if(post.exists()){
                setImages(post.data().images);
                setLoadedPost(post.data());
            }
        }
        main();
    }, [id, loadedPost, loadedEvals]);

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
    }, [username]);

    var offeringTask = true;
    if (post_type === "false") {
        offeringTask = false;
    }

    /* fetch the evaluations */
    useEffect(() => {
        const collectionRef = collection(FIRESTORE, "jobEval");
        const queryQ = query(collectionRef, where('postId', '==', id));
            const end = onSnapshot(queryQ, async (sshot) => {
                const evalArray: any[] = await Promise.all(
                    sshot.docs.map(async (data) => {
                        const taskerQ = query(collection(FIRESTORE, "taskers"), where('fullName' , '==', data.data().username), limit(5)); // fetch the id and take only the top 5
                        const taskerDoc = await getDocs(taskerQ);
                        let taskerId: string | null = null;
                        taskerDoc.forEach((tasker) => {
                            if (tasker.exists()) taskerId = tasker.data().taskerId;
                        })

                        return { commId: data.id, ...data.data(), taskerId };
                    })
                )
                setEvals(evalArray);
            });
            return () => end();
    }, ([]));

    // console.log(taskerId);
    // icon setup to make it responsive
    const icon = isFavourite === false ? 'heart-outline' : 'heart';
    // console.log(offeringTask);
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
            {(images && images?.length > 0) && (<View style={styles.carousel}>
                <Carousel
                    width={350}
                    height={350}
                    autoPlay={false}
                    data={images || []}
                    loop={true}
                    renderItem={({ item }) => (
                        <Image source={{ uri: item }} style={{width: "100%", height: "100%", padding: 5, marginBottom: 10}}/>
                    )}
                />
            </View>)}
            <View style={styles.textHeader}>

                <TouchableOpacity style={{ alignContent: "center", justifyContent: "center" }} onPress={() => router.push({pathname: "/profile/[taskerId]", params: {taskerId: taskerId}})}>
                    <Text style={styles.Username}>{ username }</Text>
                </TouchableOpacity>
            </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    {offeringTask ? (<TouchableOpacity style={styles.ContactBtn} onPress={() => router.push({pathname: "/comments/commentMain"
                                                                                                             ,params: {id}})}>
                        <Text style={styles.contactText}>Evaluate</Text>
                    </TouchableOpacity>): (<View style={[styles.ContactBtn, { backgroundColor: "transparent" }]}></View>)}
                    {username !== currentUser ? (
                        <TouchableOpacity style={styles.ContactBtn} onPress={() => openChat(username, router)}>
                            <Text style={styles.contactText}>Contact</Text>
                        </TouchableOpacity>) :
                    (<TouchableOpacity style={[styles.ContactBtn, { backgroundColor: "transparent" }]}>
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
                    <Text style={styles.Text}>{ price } €</Text>
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
                {/* <View style={{height: 2, backgroundColor: "black", width: "100%"}}></View> */}

                {offeringTask && (
                <View style={styles.offTaskView}>
                    {taskerCertificates.length > 0 && (<View>
                        <Text style={styles.Text}>Certificates</Text>
                        { taskerCertificates.map((certification, key) => renderCertification(certification, key)) }
                    </View>)}

                    {loadedPost?.rating && loadedPost?.ratingCnt && (
                    <View style={styles.offTaskView}>
                        {/* <View style={{height: 2, backgroundColor: "black", width: "100%"}}></View> */}
                        <View style={styles.postRatingView}>
                            <Ionicons name="star" size={25}/>
                            <Text style={[styles.Text, { fontSize: 20 }]}>{ loadedPost?.rating } ({ loadedPost?.ratingCnt })</Text>
                        </View>
                    </View>)}

                    {/* <View style={{height: 2, backgroundColor: "black", width: "100%", marginVertical: 10}}></View> */}
                    {loadedEvals.length > 0 && (<View style={styles.offTaskView}>
                        <Text style={styles.Text}>Recent evaluations</Text>
                        {loadedEvals.map((item, key) => (
                            <View key={ key }>
                                {renderEval(item.postId, item.rating, item.comment, item.commId, router, item.username, item.taskerId, currentUser)}
                            </View>
                        ))}
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
        marginTop: 50,
        backgroundColor: "white",
        flex: 1
    },
    Location: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },
    textHeader: {
        flexDirection: "row",
        justifyContent: "center",
        paddingHorizontal: 10,
        alignItems: "center",
        width: "100%",
        paddingVertical: 5
    },
    ContactBtn: {
        width: 100,
        height: 28,
        backgroundColor: "green",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 60,
        marginTop: 10
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
    carousel: {
        width: "90%",
        justifyContent: "center",
        alignContent: "center",
        marginBottom: 20
    },
    singleComm: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15
    },
    signleCommL: {
        flexDirection: "column",
        marginLeft: 30,
        width: "65%"
    },
    singleCommR: {
        flexDirection: "row",
        marginRight: 55
    },
    evalText: {
        fontFamily: 'mon-sb'
    },
    text: {
        fontFamily: 'mon'
    },
    outerSingleCommR: {
        flexDirection: "column"
    }
})

export default Page;
