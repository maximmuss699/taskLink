import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ViewBase, FlatList, SafeAreaView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from "expo-router";
import Colors from "@/constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FIRESTORE } from '@/firebaseConfig';
import { collection, query, where, onSnapshot, DocumentData, QuerySnapshot, QueryDocumentSnapshot } from 'firebase/firestore';
import { job_ad, jobPost, filterQS } from '../(tabs)/index';
import { filter } from '../filters/filterMain';

/* Parses the filter and constructs a chained firebase query */
export function applyFilter(filter: any, queryQ: any) {
    if (filter === undefined) return null;
    if (filter === "") return null;
    const collectionRef = collection(FIRESTORE, "posts");

    // join the tables on postId
    if (filter.maxRating !== undefined && Number(filter.maxRating) > 0 && filter.maxRating !== "") {
        console.log("using maxRating: ", filter.maxRating);
        queryQ = query(queryQ, where("rating", '<=', Number(filter.maxRating)));
    }

    if (filter.minRating !== undefined && Number(filter.minRating) > 0 && filter.minRating !== "") {
        console.log("using minRating: ", filter.minRating);
        queryQ = query(queryQ, where("rating", '>=', Number(filter.minRating)));
    }

    if (filter.fromDate !== undefined) {
        console.log("using fromDate: ", filter.fromDate);
        queryQ = query(queryQ, where("date", '>=', filter.fromDate));
    }

    if (filter.toDate !== undefined) {
        console.log("using toDate: ", filter.toDate);
        queryQ = query(queryQ, where("date", '<=', filter.toDate));
    }

    if (Number(filter.minPrice) > 0 && filter.minPrice !== undefined) {
        console.log("using minPrice: ", filter.minPrice);
        queryQ = query(queryQ, where("price", '>=', Number(filter.minPrice)));
    }

    if (Number(filter.maxPrice) > 0 && filter.maxPrice !== undefined) {
        console.log("using maxPrice: ", filter.maxPrice);
        queryQ = query(queryQ, where("price", '<=', Number(filter.maxPrice)));
    }

    return queryQ;
}

const Page = () => {
    const router = useRouter();
    const [loadedPosts, setPosts] = useState<jobPost[]>([]);
    const { category } = useLocalSearchParams<{ category: string }>();
    const { filter } = useLocalSearchParams<{ filter?: string }>();

    if (filter !== undefined) {
        const parsed_filter = filter ? JSON.parse(filter): null; // checks for undefined values
        // console.log(parsed_filter);
        console.log("Applying filters:", {
            minPrice: parsed_filter.minPrice,
            maxPrice: parsed_filter.maxPrice,
            fromDate: parsed_filter.fromDate,
            toDate: parsed_filter.toDate,
        });
        console.log("minPrice type:", typeof parsed_filter.minPrice, parsed_filter.minPrice);
    }

    const [quickSearch, setQSval] = useState<string | null>(null);

    var no_categ = false;
    var offeringTask = false;
    if (category == "Taskers" || category == "Seekers") {
        no_categ = true;
        offeringTask = category === "Taskers" ? true : false;
    }

    useEffect(() => {
        const collectionRef = collection(FIRESTORE, "posts");
        var queryQ;
        if (!no_categ) {
            queryQ = query(collectionRef, where('category', '==', category));
        } else {
            queryQ = query(collectionRef, where('offeringTask', '==', offeringTask));
        }

        /* apply filters, if they are defined... */
        try {
            var filterQuery = applyFilter(JSON.parse(filter || ""), queryQ);
            if (filterQuery !== null) queryQ = filterQuery;
        } catch (error) {
            console.log("filter parsing went wrong: ", error);
        }
        console.log("Query with filters applied:", queryQ);
        const end = onSnapshot(queryQ, (sshot: QuerySnapshot) => {
            const jobArray: any = [];
            sshot.docs.forEach((data: QueryDocumentSnapshot) => {
                jobArray.push({ id: data.id , ...data.data() });
            })
            console.log(jobArray);
            setPosts(jobArray);
        });
        return () => end();
    }, ([]));

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
                                                    // item.username,
                                                    "Kamil",
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
        width: "95%",
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
