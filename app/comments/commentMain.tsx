import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { useLocalSearchParams, router, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from 'react-native-safe-area-context';
/* firestore imports */
import { collection, query, doc, where, onSnapshot, deleteDoc, updateDoc, getDocs } from 'firebase/firestore';
import { FIRESTORE } from '@/firebaseConfig';

// evaluation interface
export interface evaluation {
    postId: string;
    commId: string;
    comment: string;
    rating: number;
    username: string;
    taskerId: string;
}

// deletes comment with comment id
async function deleteComment(commId: string) {
    const docReference = doc(FIRESTORE, 'jobEval', commId);
    await deleteDoc(docReference);
}

// computes the average rating...
const computeWholeEval = (evalArr: Array<evaluation>) => {
    var ratingSum: number = 0;
    if (evalArr.length === 0) return 0.0 // avoid division by zero
    // get the sum
    evalArr.forEach((arrElem) => {
        ratingSum += arrElem.rating;
    })
    // divide the sum by the number of the elements in the array
    ratingSum = ratingSum / evalArr.length;
    return Math.ceil(ratingSum * 10) / 10;
}

// function rendering single comment
export const renderEval = (id: string, rating: number, comment: string, commId: string, router: any, username: string, taskerId: string | null, current_user: string) => {
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
                {/* Jan Schwarz is the logged in user */}
                {username === current_user && (<View style={ { flexDirection: "row", marginTop: 15 } }>
                    <TouchableOpacity style={styles.commentActionBtn} onPress={() => {router.push({pathname: '/(modals)/editComment', params: { id, commId }})}}>
                        <Ionicons name="pencil-outline" size={25}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.commentActionBtn, { backgroundColor: "#c00" }]} onPress={() => deleteComment(commId)}>
                        <Ionicons name="trash-outline" size={25}/>
                    </TouchableOpacity>
                </View>)}
            </View>
        </View>
        </View>
    )
}

const commentMain = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    // console.log(id);
    // get the post evaluations
    const [loadedEvals, setEvals] = useState<evaluation[]>([]);
    const [postRating, setPostRating] = useState<number>();
    const [currentUser, setCurrentUser] = useState<string>("");


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

    useEffect(() => {
        const collectionRef = collection(FIRESTORE, "jobEval");
        const queryQ = query(collectionRef, where('postId', '==', id));

            const end = onSnapshot(queryQ, async (sshot) => {
                // const evalArray: any = [];
                const evalArray: any[] = await Promise.all(
                    sshot.docs.map(async (data) => {
                        const taskerQ = query(collection(FIRESTORE, "taskers"), where('fullName' , '==', data.data().username)); // fetch the id
                        const taskerDoc = await getDocs(taskerQ);
                        let taskerId: string | null = null;
                        taskerDoc.forEach((tasker) => {
                            if (tasker.exists()) taskerId = tasker.data().taskerId;
                        })

                        return { commId: data.id, ...data.data(), taskerId };
                    })
                )
                setEvals(evalArray);
                // compute the overall job rating
                const postEvaluation = computeWholeEval(evalArray);
                const postDoc = doc(collection(FIRESTORE, "posts"), id);
                // update the rating in the post collection
                updateDoc(postDoc, { rating: postEvaluation, ratingCnt: evalArray.length });
                setPostRating(postEvaluation);
            });
            return () => end();
    }, ([]));

    return (
        <SafeAreaView>
        <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <Ionicons name='chevron-back-outline' size={24}/>
            </TouchableOpacity>
            <Text style={styles.mainText}>Job Evaluations</Text>
        </View>
        {/* final evaluation */}
        <View style={styles.evalHeader}>
            <View style={{ flexDirection: "row", marginLeft: 30 }}>
                <Ionicons name="star" size={20}/>
                <Text style={{ fontFamily: 'mon-b', fontSize: 20 }}>{postRating} ({loadedEvals.length})</Text>
            </View>
        <TouchableOpacity style={styles.button} onPress={() => router.push({pathname: "/comments/evaluationForm", params: {id} })}>
            <Text style={styles.buttonText}>Add evaluation</Text>
        </TouchableOpacity>
        </View>

        <View style={styles.commentView}>
            <FlatList
                data={loadedEvals}
                renderItem = {({ item }) => renderEval(item.postId, item.rating, item.comment, item.commId, router, item.username, item.taskerId, currentUser)}
                keyExtractor={(item) => item.commId}
            />
        </View>

    </SafeAreaView>
    );
}

export const styles = StyleSheet.create({
    mainText: {
        fontSize: 28,
        fontFamily: 'mon-b',
        fontWeight: 'bold',
        color: 'black',
        marginLeft: 5
    },
    button: {
        width: 130,
        height: 30,
        backgroundColor: "green",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        margin: 10
    },
    buttonText: {
        color: "white",
        fontFamily: 'mon-b',
        fontWeight: 'bold',
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14
    },
    header: {
        flexDirection: "row",
        alignItems: "center"
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
    commentView: {
        flexDirection: "column",
        width: "100%"
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
    text: {
        fontFamily: 'mon'
    },
    evalText: {
        fontFamily: 'mon-sb'
    },
    evalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 30
    },
    outerSingleCommR: {
        flexDirection: "column"
    },
    commentActionBtn: {
        marginRight: 12,
        borderRadius: 50,
        backgroundColor: "green",
        padding: 5
    }
})

export default commentMain;
