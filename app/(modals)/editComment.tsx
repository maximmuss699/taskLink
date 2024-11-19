import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, TouchableWithoutFeedback, Keyboard, TextInput } from 'react-native';
import { useLocalSearchParams, router, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from 'react-native-safe-area-context';
/* firestore imports */
import { collection, setDoc, doc, getDoc } from 'firebase/firestore';
import { FIRESTORE } from '@/firebaseConfig';
import Slider from '@react-native-community/slider';

interface evaluation {
    id: string; // postId; FIXME: make the variable name unambiguous
    commId: string;
    comment: string;
    rating: number;
}

// updates the evaluation
async function evalToDB(rating: number, comment: string, id: string, router: any, commId: string) {
    const collectionRef = collection(FIRESTORE, 'jobEval');
    const docRef = doc(collectionRef, commId);

    await setDoc(docRef, { comment: comment, rating: rating, postId: id });
    setTimeout(() => router.push({pathname: "/comments/commentMain", params: {id}}), 500);
}

function resizeCommWin() {
    return styles.Comment.height * 1.5;
}

const editCommPage = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { commId } = useLocalSearchParams<{ commId: string }>();

    const [sliderVal, setSliderVal] = useState<number>(0);
    const [comment, setComment] = useState<string>("");

    useEffect(() => {
        // fetch the evaluation from firebase and let the user modify it
        const func = async () => {
            const collectionRef = collection(FIRESTORE, "jobEval");
            const docToLoad = doc(collectionRef, commId);
            const loadedData = await getDoc(docToLoad);
            setSliderVal(loadedData.data()?.rating);
            setComment(loadedData.data()?.comment);
        }
        func();
    }, ([]));

    return (
    <SafeAreaView style={styles.mainView}>
        <View style={styles.topScreen}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.push({pathname: "/comments/commentMain", params: {id}})}>
            <Ionicons name='chevron-back-outline' size={24}/>
        </TouchableOpacity>
        <Text style={styles.mainText}>Modify Evaluation</Text>
        </View>
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
                // minimumTrackTintColor="#FFFFFF"
                minimumTrackTintColor="green"
                onValueChange={(value) => {setSliderVal(value)}}
                value={sliderVal}
            />
                <TextInput
                    style={styles.Comment}
                    onChangeText={(comm) => setComment(comm)}
                    value={comment}
                    multiline
                    numberOfLines={8}
                    onContentSizeChange={resizeCommWin}
                />
        </View>
        </TouchableWithoutFeedback>

        <TouchableOpacity style={styles.button} onPress={() => evalToDB(sliderVal, comment, id, router, commId)}>
            <Text style={styles.buttonText}>Modify evaluation</Text>
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
        marginLeft: 5
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

export default editCommPage;
