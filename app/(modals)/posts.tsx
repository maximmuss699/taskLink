import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ViewBase, FlatList, SafeAreaView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from "expo-router";
import Colors from "@/constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FIRESTORE } from '@/firebaseConfig';
import { collection, query, where, onSnapshot, DocumentData, QuerySnapshot, QueryDocumentSnapshot, doc, getDoc } from 'firebase/firestore';
import { job_ad, jobPost, filterQS } from '../(tabs)/index';
import { filter } from '../filters/filterMain';
import { parse } from '@babel/core';

/* Parses the filter and constructs a chained firebase query */
export function applyFilter(filter: any, queryQ: any) {
    console.log("applyFilter: ", filter);
    if (filter === undefined) return null;
    if (filter === "") return null;
    const collectionRef = collection(FIRESTORE, "posts");
    console.log("Initial queryQ: ", queryQ);

    // join the tables on postId
    if (filter.maxRating !== undefined && Number(filter.maxRating) > 0 && filter.maxRating !== "") {
        console.log("using maxRating: ", filter.maxRating);
        queryQ = query(queryQ, where("rating", '<=', Number(filter.maxRating)));
        console.log("Updated queryQ: ", queryQ);

    }

    if (filter.minRating !== undefined && Number(filter.minRating) > 0 && filter.minRating !== "") {
        console.log("using minRating: ", filter.minRating);
        queryQ = query(queryQ, where("rating", '>=', Number(filter.minRating)));
        console.log("Updated queryQ: ", queryQ);

    }

    if (filter.fromDate !== undefined) {
        // convert to date
        const fromDateDate = new Date(filter.fromDate?.seconds * 1000);
        console.log("using fromDate: ", filter.fromDate);
        if (fromDateDate) {
            queryQ = query(queryQ, where("date", '>=', fromDateDate));
            console.log("Updated queryQ: ", queryQ);

        } else {
            queryQ = query(queryQ, where("date", '>=', filter.fromDate));
            console.log("Updated queryQ: ", queryQ);

        }
    }

    if (filter.toDate !== undefined) {
        const toDateDate = new Date(filter.toDate?.seconds * 1000);
        console.log("using toDate: ", filter.toDate);
        if (toDateDate) {
            queryQ = query(queryQ, where("date", '>=', toDateDate));
            console.log("Updated queryQ: ", queryQ);

        } else {
            queryQ = query(queryQ, where("date", '<=', filter.toDate));
            console.log("Updated queryQ: ", queryQ);

        }
    }

    if (Number(filter.minPrice) > 0 && filter.minPrice !== undefined) {
        console.log("using minPrice: ", Number(filter.minPrice));
        queryQ = query(queryQ, where("price", '>=', Number(filter.minPrice)));
        console.log("Updated queryQ: ", queryQ);
    }

    if (Number(filter.maxPrice) > 0 && filter.maxPrice !== undefined) {
        console.log("using maxPrice: ", filter.maxPrice);
        queryQ = query(queryQ, where("price", '<=', Number(filter.maxPrice)));
        console.log("Updated queryQ: ", queryQ);
    }

    console.log("Initial queryQ: ", queryQ);
    return queryQ;
}

const Page = () => {
    const router = useRouter();
    const [loadedPosts, setPosts] = useState<jobPost[]>([]);
    const [savedFilter, setSavedFilter] = useState<any>(null);

    const { category } = useLocalSearchParams<{ category: string }>();
    const { filter } = useLocalSearchParams<{ filter?: string }>();
    const { filterId } = useLocalSearchParams<{ filterId?: string }>();

    // console.log(filterId);
    // console.log(filter);

    var parsed_filter: any = null;
    if (filter !== undefined && filter !== "") {
        parsed_filter = filter ? JSON.parse(filter): null; // checks for undefined values
        // console.log(parsed_filter);
        console.log("Applying filters:", {
            minPrice: parsed_filter.minPrice,
            maxPrice: parsed_filter.maxPrice,
            fromDate: parsed_filter.fromDate,
            toDate: parsed_filter.toDate,
        });
    }
    const [quickSearch, setQSval] = useState<string | null>(null);

    var no_categ = false;
    var offeringTask = false;
    if (category == "Taskers" || category == "Seekers") {
        no_categ = true;
        offeringTask = category === "Taskers" ? true : false;
    }

    useEffect(() => {
        if (filterId !== undefined) {
            const fetchFilter = async () => {
                const docRef = doc(FIRESTORE, "presetFilter", filterId);
                const filterObj = await getDoc(docRef);
                if (filterObj.exists()) {
                    setSavedFilter(filterObj.data());
                    console.log("saved filter fetched from the firebase based on filterID: ", savedFilter);
                }
            }
            fetchFilter();
        }
        return () => {};
    }, ([filterId]));

    useEffect(() => {
        var queryQ: any;
        const collectionRef = collection(FIRESTORE, "posts");
        if (!no_categ) {
            queryQ = query(collectionRef, where('category', '==', category));
        } else {
            queryQ = query(collectionRef, where('offeringTask', '==', offeringTask));
        }

        /* apply filters, if they are defined... */
        try {
            // if (filterQuery !== null) {
            if (parsed_filter !== null) {
                var filterQuery = applyFilter(parsed_filter, queryQ);
                console.log("aplikace filtru 138: ", filterQuery);
                queryQ = filterQuery;
            }
            if (savedFilter !== null) {
                console.log("using savedFilter: ", savedFilter);
                queryQ = applyFilter(savedFilter, queryQ);
            }
        } catch (error) {
            console.log("filter parsing went wrong: ", error);
        }

        console.log("Query with filters applied:", queryQ);
        const end = onSnapshot(queryQ, (sshot: QuerySnapshot) => {
            const jobArray: any = [];
            sshot.docs.forEach((data: QueryDocumentSnapshot) => {
                jobArray.push({ id: data.id , ...data.data() });
            })
            // console.log(jobArray);
            setPosts(jobArray);
        });
        return () => end();
    }, ([savedFilter, parsed_filter]));

    return (
        <SafeAreaView style={styles.mainView}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name='chevron-back-outline' size={24}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.OtherBtn}>
                    <Ionicons name='bookmark-outline' size={24} onPress={() => router.push({pathname: "/filters/filterMenu", params: { category: category }})}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.OtherBtn}>
                    <Ionicons name='options-outline' size={24} onPress={() => router.push({pathname: "/filters/filterMain", params: { category: category }})}/>
                </TouchableOpacity>
            </View>
            <Text style={styles.MainText}>Posts in { category }</Text>
            <View style={styles.SearchBarCollection}>
                <Ionicons style={styles.SearchIcon} name='search-outline' size={24}/>
                <TextInput
                    style={styles.SearchBar}
                    placeholder='What job are you searching for?'
                    placeholderTextColor="black"
                    onChangeText={setQSval}
                />
            </View>
            <View style={styles.JobPanel}>
                <FlatList
                    data={filterQS(loadedPosts, quickSearch)}
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    MainText: {
        fontSize: 28,
        fontFamily: 'mon-b',
        fontWeight: 'bold',
        color: 'black',
        margin: 10,
        marginLeft: 15,
    },
    LocationText: {
        fontSize: 22,
        fontFamily: 'mon-b',
        fontWeight: 'bold',
        marginTop: 5,
        marginLeft: 5,
        color: Colors.primary
    },
    SearchBar: {
        width: 280,
        margin: 10,
        marginLeft: 2,
        padding: 10,
        alignSelf: 'center',
        borderWidth: 2,
        borderColor: '#DEDEDE',
        borderRadius: 30,
        backgroundColor: '#FFFFFF',
        shadowColor: '#DEDEDE',
        shadowOpacity: 1,
        shadowOffset: { width: 0, height: 1},
        flexDirection: 'row',
        fontFamily: 'mon-b',
        fontWeight: 'bold'
    },
    SearchIcon: {
        marginLeft: 15,
        marginTop: 5
    },
    SearchBarCollection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    JobAdvertisement: {
        marginBottom: 10,
        backgroundColor: "green",
        alignItems: "center",
        width: "100%",
        alignSelf: 'center'
    },
    JobPanel: {
        height: "100%",
        width: "100%",
        alignContent: "center",
        flex: 1,
        marginTop: 10
    },
    mainView: {
        fontSize: 28,
        fontFamily: 'mon-b',
        fontWeight: 'bold',
        color: 'black',
        marginLeft: 5,
        flex: 1
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
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
    OtherBtn: {
        width: 40,
        height: 40,
        shadowColor: '#DEDEDE',
        backgroundColor: "white",
        shadowOpacity: 1,
        shadowOffset: { width: 0, height: 1},
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 20
    }
})

export default Page;
