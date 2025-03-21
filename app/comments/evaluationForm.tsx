/**
 * @file evaluationForm.tsx
 * @author Vojtěch Tichý (xtichy33)
 * @description page for comment creation
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from 'react-native-safe-area-context';
/* firestore imports */
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { FIRESTORE } from '@/firebaseConfig';
import Slider from '@react-native-community/slider';

// sends the evaluation collected from the user to the firebase
async function updateEval(rating: number, comment: string, id: string, router: any, username: string) {
    const collectionRef = collection(FIRESTORE, 'jobEval');
    await addDoc(collectionRef, { comment: comment, rating: rating, postId: id, username: username });
    setTimeout(() => router.back(), 300);
}

function resizeCommWin() {
    return styles.Comment.height * 1.5;
}


const evaluationForm = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    const [sliderVal, setSliderVal] = useState<number>(0);
    const [comment, setComment] = useState<string>("");
    const [currentUser, setCurrentUser] = useState<string>("");

    useEffect(() => {
        const get_username = async () => {
            const collectionRef = collection(FIRESTORE, "users");
            const docs = await getDocs(collectionRef);
            if (!docs.empty) { // theres only one user so we can for sure take the first found user....
                setCurrentUser(docs.docs[0].data().firstName + " " + docs.docs[0].data().lastName);
            }
        }
        get_username();
    }, []);

    return (
    <SafeAreaView style={styles.mainView}>
        <View style={styles.topScreen}>
        {/* <TouchableOpacity style={styles.backBtn} onPress={() => router.push({pathname: "/comments/commentMain", params: {id}})}> */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name='chevron-back-outline' size={24}/>
        </TouchableOpacity>
        <Text style={styles.mainText}>Evaluate Tasker</Text>
        </View>
        {/* final evaluation */}
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.header}>
            <View style={styles.rating}>
                <Ionicons name="star" size={25}/>
                <Text style={styles.ratingText}> {sliderVal}</Text>
            </View>
            <Slider
                style={styles.evalSlider}
                minimumValue={0}
                maximumValue={5}
                step={1}
                maximumTrackTintColor="#000000"
                minimumTrackTintColor="green"
                onValueChange={(value) => {setSliderVal(value)}}
            />
                <TextInput
                    style={styles.Comment}
                    placeholder='Add your comment here'
                    placeholderTextColor="gray"
                    onChangeText={(comm) => setComment(comm)}
                    value={comment}
                    multiline
                    numberOfLines={8}
                    onContentSizeChange={resizeCommWin}
                />
        </View>
        </TouchableWithoutFeedback>

        <TouchableOpacity style={styles.button} onPress={() => updateEval(sliderVal, comment, id, router, currentUser)}>
            <Text style={styles.buttonText}>Add evaluation</Text>
        </TouchableOpacity>
    </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    mainView: {
        flexDirection: "column"
    },
    mainText: {
        fontSize: 28,
        fontFamily: 'mon-b',
        fontWeight: 'bold',
        color: 'black',
        marginLeft: 15
    },
    button: {
        marginTop: 300,
        alignSelf: "center",
        width: 200,
        height: 50,
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
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
    },
    form: {
        width: "90%",
        height: 50,
        shadowColor: '#DEDEDE',
        shadowOpacity: 1,
        shadowOffset: { width: 0, height: 1},
    },
    Comment: {
        marginTop: 30,
        width: 280,
        height: 120,
        margin: 10,
        marginLeft: 2,
        padding: 10,
        alignSelf: 'center',
        borderWidth: 2,
        borderColor: '#DEDEDE',
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        shadowColor: '#DEDEDE',
        shadowOpacity: 1,
        shadowOffset: { width: 0, height: 1},
        flexDirection: 'row',
        fontFamily: 'mon',
        fontWeight: 'bold'
    },
    evalSlider: {
        marginTop: 20,
        marginBottom: 40,
        width: 250,
    },
    ratingText: {
        marginTop: 2,
        fontFamily: 'mon-b',
        justifyContent: "center",
        alignItems: "center",
        fontSize: 20
    },
    rating: {
        marginTop: 20,
        flexDirection: "row",
        justifyContent: "center",
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
    topScreen: {
        flexDirection: "row",
        alignItems: "center"
    }
})

export default evaluationForm;
