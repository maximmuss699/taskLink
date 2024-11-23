import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FIRESTORE } from '@/firebaseConfig';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { filter } from '../filters/filterMain';
import { FlatList } from 'react-native-gesture-handler';

/* deletes filter with 'filterId'  */
async function deleteFilter(filterId: string) {
    if (filterId == "" || filterId == undefined) return;
    try {
        const docRef = doc(FIRESTORE, "presetFilter", filterId);
        await deleteDoc(docRef);
    } catch(error) {
        console.log("ERROR: ", error);
    }
}

const renderFilter = (filter: any, router: any) => {
    return(
        <View style={{ width: "100%" }}>
            <View style={{ height: 2, backgroundColor: "black", width: "100%", margin: 5, marginBottom: 8, alignSelf: "center" }}></View>
            <View style={styles.singleComm}>
                <View style={styles.signleCommL}>
                    {/* <Text style={[styles.evalText, { marginBottom: 8} ]}>USERNAME</Text> */}
                    {/* <Text style={styles.text}>{comment}</Text> */}
                </View>
                <View style={styles.outerSingleCommR}>
                    <View style={styles.singleCommR}>
                        <Ionicons name='star' size={15}/>
                        {/* <Text style={styles.evalText}>{rating}/5</Text> */}
                    </View>
                    <View style={ { flexDirection: "row", marginTop: 15 } }>
                        <TouchableOpacity style={styles.commentActionBtn} onPress={() => {router.push({pathname: '/(modals)/editComment', params: filter.filterId })}}>
                            <Ionicons name="pencil-outline" size={25}/>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.commentActionBtn, { backgroundColor: "#c00" }]} onPress={() => deleteFilter(filter.filterId)}>
                            <Ionicons name="trash-outline" size={25}/>
                        </TouchableOpacity>
                        {/* FIXME: display prompt when button is clicked */}
                    </View>
                </View>
            </View>
        </View>
    );
};

const Page = () => {
    const router = useRouter();
    const [filters, setFilters]  = useState<any[]>();

    useEffect(() => {
        // fetch the filters from the database
        const collectionRef = collection(FIRESTORE, "presetFilter");
        const end = onSnapshot(collectionRef, (sshot) => {
            const filterArray: any = [];
            sshot.docs.forEach((data) => {
                filterArray.push({ id: data.id, ...data.data() });
            })
            setFilters(filterArray);
        });
        return () => end();
    }, ([]));


    return(
        <SafeAreaView style={styles.mainView}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name='chevron-back-outline' size={24}/>
                </TouchableOpacity>
                <Text style={styles.mainText}>Saved Filters</Text>
            </View>

        <View style={styles.filtsView}>
            <FlatList
                data={filters}
                renderItem={(filter) => renderFilter(filter, router)}
                keyExtractor={(item) => item.id}
            />
        </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    mainText: {
        fontSize: 28,
        fontFamily: 'mon-b',
        fontWeight: 'bold',
        color: 'black',
        marginLeft: 5
    },
    mainView: {
        flexDirection: "column"
    },
    header: {
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "space-between"
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
    filterView: {

    },
    commentActionBtn: {
        marginRight: 12,
        borderRadius: 50,
        backgroundColor: "green",
        padding: 5
    },
    singleComm: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15
    },
    signleCommL: {
        flexDirection: "column",
        marginLeft: 30,
    },
    singleCommR: {
        flexDirection: "row",
        marginRight: 30
    },
    outerSingleCommR: {
        flexDirection: "column"
    },
    filtsView: {
        flexDirection: "column",
        width: "100%"
    }
})

export default Page;
