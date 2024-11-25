import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FIRESTORE } from '@/firebaseConfig';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { filter } from '../filters/filterMain';
import { applyFilter } from '../(modals)/posts';
import { Category } from '../context/FormContext';

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

/* interface for printing filters format */
interface filterInfo {
    rating: string | undefined;
    price: string | undefined;
    date: string | undefined;
};

/* parses the filter information */
function parse_filter_info(filter: any) {
    var filterToDisplay: filterInfo = { date: "", price: "", rating: "" };

    var fromDateStr: string | null = null;
    var toDateStr: string | null = null;

    /* conversion from Firebase timestamp to string, probably not the best solution... */
    if (filter.fromDate !== undefined) {
        fromDateStr = new Date(filter.fromDate?.seconds * 1000).toLocaleDateString('en-GB');
    }
    if (filter.toDate !== undefined) {
        toDateStr = new Date(filter.toDate?.seconds * 1000).toLocaleDateString('en-GB');
    }

    /* date */
    if (filter.fromDate !== undefined && filter.toDate !== undefined) {
        filterToDisplay.date = fromDateStr + " - " + toDateStr;
    } else if (filter.fromDate !== undefined && filter.toDate === undefined) {
        filterToDisplay.date = " >= " + fromDateStr;
    } else if (filter.fromDate === undefined && filter.toDate !== undefined) {
        filterToDisplay.date = " <= " + toDateStr;
    }

    /* price */
    if (filter.minPrice !== undefined && filter.maxPrice !== undefined) {
        filterToDisplay.price = filter.minPrice + " - " + filter.maxPrice + " €";
    } else if (filter.minPrice !== undefined && filter.maxPrice === undefined) {
        filterToDisplay.price = " >= " + filter.minPrice + " €";
    } else if (filter.minPrice === undefined && filter.maxPrice !== undefined) {
        filterToDisplay.price = " <= " + filter.maxPrice + " €";
    }

    /* rating */
    if (filter.minRating !== undefined && filter.maxRating !== undefined) {
        filterToDisplay.rating = filter.minRating + " - " + filter.maxRating;
    } else if (filter.minRating !== undefined && filter.maxRating === undefined) {
        filterToDisplay.rating = " >= " + filter.minRating;
    } else if (filter.minRating === undefined && filter.maxRating !== undefined) {
        filterToDisplay.rating = " <= " + filter.maxRating;
    }

    return filterToDisplay;
}

const renderFilter = (filter: any, router: any, category: string) => {
    const parsed_filter_info = parse_filter_info(filter.item);

    return(
        <View style={{ width: "100%" }}>
            <View style={{ height: 2, backgroundColor: "black", width: "100%", margin: 5, marginBottom: 8, alignSelf: "center" }}></View>
            <TouchableOpacity onPress={() => {router.push({ pathname: "/(modals)/posts" , params: { filterId: filter.item.filterId, category: category }})}}>

                <View style={styles.singleComm}>
                    <View style={styles.signleCommL}>
                        <Text style={[styles.evalText, { marginBottom: 8} ]}>{ filter.item.filterName }</Text>
                        {parsed_filter_info.rating && (<View style={styles.ratView}>
                            <Text style={[styles.text, { fontFamily: "mon-b" }]}>Rating: </Text>
                            <Text style={styles.text}>{ parsed_filter_info.rating } </Text>
                            <Ionicons name='star' size={15}/>
                        </View>)}
                        {parsed_filter_info.price && (<View style={styles.ratView}>
                            <Text style={[styles.text, { fontFamily: "mon-b" }]}>Price: </Text>
                            <Text style={styles.text}>{ parsed_filter_info.price }</Text>
                        </View>)}
                        {parsed_filter_info.date && (<View style={styles.ratView}>
                            <Text style={[styles.text, { fontFamily: "mon-b" }]}>Date: </Text>
                            <Text style={styles.text}>{ parsed_filter_info.date }</Text>
                        </View>)}
                        {/* <Text style={styles.text}>Category: { filter.category }</Text> */}
                    </View>
                    <View style={styles.outerSingleCommR}>
                        <View style={ { flexDirection: "row", marginTop: 15 } }>
                            <TouchableOpacity style={styles.commentActionBtn} onPress={() => {router.push({pathname: '/filters/filterEdit', params: { filterId: filter.item.filterId} })}}>
                                <Ionicons name="pencil-outline" size={25}/>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.commentActionBtn, { backgroundColor: "#c00" }]} onPress={() => deleteFilter(filter.item.filterId)}>
                                <Ionicons name="trash-outline" size={25}/>
                            </TouchableOpacity>
                            {/* FIXME: display prompt when button is clicked */}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const Page = () => {
    const router = useRouter();
    const [filters, setFilters]  = useState<any[]>();
    const { category } = useLocalSearchParams<{ category: string }>();

    useEffect(() => {
        // fetch the filters from the database
        const collectionRef = collection(FIRESTORE, "presetFilter");
        const end = onSnapshot(collectionRef, (sshot) => {
            const filterArray: any = [];
            sshot.docs.forEach((data) => {
                filterArray.push({ filterId: data.id, ...data.data() });
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
                    renderItem={(filter) => renderFilter(filter, router, category)}
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
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 25
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
        justifyContent: "center",
        position: "absolute",
        left: 10
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
    },
    evalText: {
        fontFamily: 'mon-sb'
    },
    text: {
        fontFamily: 'mon'
    },
    ratView: {
        flexDirection: "row",
    }
})

export default Page;
