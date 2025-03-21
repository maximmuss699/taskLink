/**
 * @file posts.tsx
 * @author Vojtěch Tichý (xtichy33)
 * @description page for post listing
 */

import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Modal, FlatList, SafeAreaView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from "expo-router";
import Colors from "@/constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FIRESTORE } from '@/firebaseConfig';
import { collection, query, where, onSnapshot, DocumentData, QuerySnapshot, QueryDocumentSnapshot, doc, getDoc, getDocs, Timestamp } from 'firebase/firestore';
import { job_ad, jobPost, QSFilter } from '../(tabs)/index';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { geohashQueryBounds } from "geofire-common";

interface filt {
    filterCriteria: string;
    value: any;
}

/* parses the filters to a more readable format */
function parseFilters(filter: filt | undefined) {
    if (filter === undefined) return;
    if (filter?.value <= 0) return;
    if (filter?.value === "") return;
    if (filter?.filterCriteria === "maxRating") filter.filterCriteria = "maximal rating";
    if (filter?.filterCriteria === "minRating") filter.filterCriteria = "minimal rating";
    if (filter?.filterCriteria === "minPrice") filter.filterCriteria = "minimal price";
    if (filter?.filterCriteria === "maxPrice") filter.filterCriteria = "maximal price";
    if (filter?.filterCriteria === "filterName") filter.filterCriteria = "name";
    if (filter?.filterCriteria === "fromDate" || filter?.filterCriteria === "toDate") {
        // convert the value
        const date = new Date(filter.value.seconds * 1000);
        filter.value = date.toLocaleDateString();
        if (filter?.filterCriteria === "fromDate") {
            filter.filterCriteria = "from";
        } else {
            filter.filterCriteria = "to";
        }
    }
    if (filter?.filterCriteria === "address") filter.filterCriteria = "address";
    if (filter?.filterCriteria === "locationRadius") filter.filterCriteria = "radius";

    return filter
}

/* visualizes the used Filters */
function visualizeUsedFilters(filter: filt | undefined, pos: number) {
    if (filter?.filterCriteria === "location") return; // do not render location
    if (filter?.filterCriteria === "locationRadius") {
        filter.filterCriteria = "location radius";
        // console.log("value");
        filter.value = "+- " + filter.value + " km";
    }
    return(
        (filter?.filterCriteria && filter?.value) ? (<View key={ pos } style={{ flexDirection: "column", width: "100%" }}>
            <View style={styles.usedFilterView}>
                <Text style={{ fontFamily: 'mon-b', marginLeft: 10 }}>{filter?.filterCriteria}: </Text>
                <Text style={{ fontFamily: 'mon' }}>{filter?.value}</Text>
            </View>
        </View>) : null
    )
}

/* Parses the filter and constructs a chained firebase query */
export async function applyFilter(filter: any, queryQ: any, setLocArr: any) {
    // console.log("applyFilter: ", filter);
    if (filter === undefined) return queryQ;
    if (filter === "") return queryQ;
    const collectionRef = collection(FIRESTORE, "posts");
    // console.log("Initial queryQ: ", queryQ);

    // join the tables on postId
    if (filter.maxRating !== undefined && Number(filter.maxRating) > 0 && filter.maxRating !== "") {
        // console.log("using maxRating: ", filter.maxRating);
        queryQ = query(queryQ, where("rating", '<=', Number(filter.maxRating)));
        // console.log("Updated queryQ: ", queryQ);

    }

    if (filter.minRating !== undefined && Number(filter.minRating) > 0 && filter.minRating !== "") {
        // console.log("using minRating: ", filter.minRating);
        queryQ = query(queryQ, where("rating", '>=', Number(filter.minRating)));
        // console.log("Updated queryQ: ", queryQ);

    }

    if (filter.fromDate !== undefined) {
        // convert to date
        const fromDateDate = new Date(filter.fromDate?.seconds * 1000);
        const timestamp = Timestamp.fromDate(fromDateDate);
        // console.log(timestamp);
        queryQ = query(queryQ, where("date", '>=', timestamp));
    }

    if (filter.toDate !== undefined) {
        const toDateDate = new Date(filter.toDate?.seconds * 1000);
        const timestamp = Timestamp.fromDate(toDateDate);
        queryQ = query(queryQ, where("date", '<=', timestamp));
    }

    if (Number(filter.minPrice) > 0 && filter.minPrice !== undefined) {
        // console.log("using minPrice: ", Number(filter.minPrice));
        queryQ = query(queryQ, where("price", '>=', Number(filter.minPrice)));
        // console.log("Updated queryQ: ", queryQ);
    }

    if (Number(filter.maxPrice) > 0 && filter.maxPrice !== undefined) {
        // console.log("using maxPrice: ", filter.maxPrice);
        queryQ = query(queryQ, where("price", '<=', Number(filter.maxPrice)));
        // console.log("Updated queryQ: ", queryQ);
    }

    /* location */
    if (filter.location && filter.locationRadius > 0) {
        const locationPosts: any[] = [];
        const IdArr: any[] = [];
        /* get the geohash bounds for query */
        const loc: [number, number] = [filter.location.latitude, filter.location.longitude];
        const areaOfInterest = geohashQueryBounds(loc, filter.locationRadius * 1000);
        // console.log(areaOfInterest);

        /* here the queries are performed separately, due to the fact that the post only falls within one of those bounds */
        /* if the queries were chained, it would only fetch posts, which are within ALL of the bounds, and no such post exists */
        const postsInRadius = areaOfInterest.map(async ([min, max]) => {
            const range = query(queryQ, where("coordinates.geohash", ">=", min), where("coordinates.geohash", "<=", max));
            const resultDocs = await getDocs(range);
            resultDocs.forEach((singleDoc: any) => {
                if (!IdArr.includes(singleDoc.id)) {
                    locationPosts.push({ id: singleDoc.id, ...singleDoc.data() });
                    IdArr.push(singleDoc.id);
                }
            });
        });
        await Promise.all(postsInRadius);
        // console.log("populating the location array: ", locationPosts);
        setLocArr(locationPosts);
        // console.log(queryQ);
    }

    return queryQ;
}

const Page = () => {
    const router = useRouter();
    const [loadedPosts, setPosts] = useState<jobPost[]>([]);
    const [savedFilter, setSavedFilter] = useState<any | undefined>(null);

    const { category } = useLocalSearchParams<{ category: string }>();
    // console.log(category);
    const { filter } = useLocalSearchParams<{ filter?: string | undefined }>();
    const { filterId } = useLocalSearchParams<{ filterId?: string }>();
    const { tempFilterId } = useLocalSearchParams<{ tempFilterId?: string }>();

    const [modalVis, setModalVis] = useState<boolean>(false);
    const [nonSavedFilter, setNonSavedFilter] = useState<string | undefined>(filter);

    const [QsjobArr, setQsJobArr] = useState<jobPost[]>([]);
    const [locArr, setLocArr] = useState<jobPost[]>([]);
    const [IslocationFilter, setIsLocationFilter] = useState<boolean>(false);
    const [quickSearch, setQSval] = useState<string | null>(null);
    const [nonMergePosts, setNonMergePosts] = useState<jobPost[]>([]);

    // console.log(filterId);
    // console.log(filter);

    var parsed_filter: any = null;

    var no_categ = false;
    var offeringTask = false;
    if (category == "Taskers" || category == "Seekers") {
        no_categ = true;
        offeringTask = category === "Taskers" ? true : false;
    }

    /* fetch the given filter, any of them is defined */
    useEffect(() => {
        if (filterId !== undefined) {
            const fetchFilter = async () => {
                const docRef = doc(FIRESTORE, "presetFilter", filterId);
                const filterObj = await getDoc(docRef);
                if (filterObj.exists()) {
                    setSavedFilter(filterObj.data());
                    // console.log("saved filter fetched from the firebase based on filterID: ", savedFilter);
                }
            }
            fetchFilter();
        } else if (tempFilterId !== undefined) {
            const fetchTempFilter = async () => {
                const docRef = doc(FIRESTORE, "tempFilter", tempFilterId);
                const tempFilterObj = await getDoc(docRef);
                if (tempFilterObj.exists()) {
                    setSavedFilter(tempFilterObj.data());
                }
            }
            fetchTempFilter();
        }
        return () => {};
    }, ([filterId, tempFilterId]));

    /* fetch liked posts */
    useEffect(() => {
        const collectionRef = collection(FIRESTORE, "posts");
        let posts_snap: (() => void) | undefined = undefined;

            if (!no_categ && category === "Liked") {
                /* listen for changes in liked posts */
                posts_snap = onSnapshot(collection(FIRESTORE, "favJobs"), async (favJob) => {
                    let fav_posts: string[] = [];
                    let jobArray: any = [];

                    if (favJob.empty) {
                        setPosts([]);
                        return;
                    }

                    favJob.forEach((data) => fav_posts.push(data.id));
                    /* prevention from duplicates */
                    fav_posts = Array.from(new Set(fav_posts));

                    const docs = await Promise.all(fav_posts.map((id) => getDoc(doc(collectionRef, id))));
                    docs.forEach((doc) => {
                        if (doc.exists()) {
                            jobArray.push({ id: doc.id , ...doc.data() });
                        }
                    })
                    // setPosts(jobArray);
                    setNonMergePosts(jobArray);
                });

            }
        return () => {
            if (posts_snap !== undefined) posts_snap();
        };
    }, ([no_categ, category]));


    /* get the posts with optional filters */
    useEffect(() => {
        /* to make sure the jobArray would not be overwritten */
        const getPosts = async () => {

            if (category === "Liked") return;
            let end = () => {};
            const jobArray: any = [];
            var queryQ: any;
            const collectionRef = collection(FIRESTORE, "posts");
            if (!no_categ) {
                queryQ = query(collectionRef, where('category', '==', category));
            } else {
                queryQ = query(collectionRef, where('offeringTask', '==', offeringTask));
            }
            /* apply filters, if they are defined... */
            try {
                if (parsed_filter !== null) {
                    var filterQuery = await applyFilter(parsed_filter, queryQ, setLocArr);
                    // console.log("aplikace filtru 138: ", filterQuery);
                    queryQ = filterQuery;
                }
                if (savedFilter !== null) {
                    // console.log("using savedFilter: ", savedFilter);
                    queryQ = await applyFilter(savedFilter, queryQ, setLocArr);
                }
                if (savedFilter !== null) {
                    if (savedFilter.location !== undefined && savedFilter.locationRadius > 0) {
                        setIsLocationFilter(true);
                    }
                }
                if (parsed_filter !== null) {
                    if (parsed_filter.location !== undefined && parsed_filter.loacationRadius > 0) {
                        setIsLocationFilter(true);
                    }
                }
            } catch (error) {
                console.log("filter parsing went wrong: ", error);
            }
            // console.log("LOCATION ARRAY: ", locArr);
            end = onSnapshot(queryQ, (sshot: QuerySnapshot) => {
                sshot.docs.forEach((data: QueryDocumentSnapshot) => {
                    jobArray.push({ id: data.id , ...data.data() });
                })
                // console.log(jobArray);
                // setPosts(jobArray);
                setNonMergePosts(jobArray)
                // console.log(nonMergePosts);
            });
            return () => end();
        };

        getPosts();
    }, ([savedFilter, nonSavedFilter, quickSearch]));

    /* for managing quickSearch results */
    useEffect(() => {
        const QSRawArr: any[] = [];
        const QsjobArr: jobPost[] = [];
        /* get the QS result */
        if (quickSearch !== null && quickSearch !== "") {
            const getQS = async () => {
                // console.log("!!! Searching !!!", quickSearch);
                const QSresult = await QSFilter(quickSearch);
                QSresult?.forEach((document) => {
                    document.docs.forEach((snap: any) => {
                        QSRawArr.push({ id: snap.id, ...snap.data() });
                    })
                });
                // ensure no duplicates are in the array
                const jobArrIds: any[] = [];
                QSRawArr.forEach((job) => {
                    if (!jobArrIds.includes(job.id)) {
                        QsjobArr.push(job);
                        jobArrIds.push(job.id);
                    }
                })
                setQsJobArr(QsjobArr);
            }
            getQS();
        } else if (quickSearch === "") {
            setQsJobArr([]);
        }
    }, ([quickSearch]));

    /* for merging all the filters... this is a workaround due to the firestore limitations, probably not the most effective */
    useEffect(() => {
        // location merging logic...
        // console.log("Populated QsjobArr: ", QsjobArr);
        // console.log("Populated: ", quickSearch);
        if (locArr.length > 0 || QsjobArr.length > 0) {
            // console.log("!!! MERGING !!!");
            const IdList: any = [];

            locArr.forEach((job) => {
                if (!IdList.includes(job.id)) {
                    IdList.push(job.id);
                }
            });

            QsjobArr.forEach((job) => {
                if (!IdList.includes(job.id)) {
                    IdList.push(job.id);
                }
            });

            const filteredPosts = nonMergePosts.filter((job: any) => IdList.includes(job.id));
            // console.log("Loaded Posts: ", nonMergePosts);
            // console.log("Location Array: ", locArr);
            setPosts(filteredPosts);
        } else if (QsjobArr.length == 0 && quickSearch && quickSearch !== "") {
            setPosts([]);
        } else if (nonMergePosts.length > 0 && !IslocationFilter) {
            setPosts(nonMergePosts);
        } else {
            setPosts([]);
        }
    } ,([locArr, QsjobArr, nonMergePosts]));

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
                    data={loadedPosts}
                    renderItem = {({ item }) => job_ad(item.id,
                                                    item.username,
                                                    item.address.locality,
                                                    item.title,
                                                    item.date.toDate().toLocaleDateString(),
                                                    item.price,
                                                    router,
                                                    item.images,
                                                    item.offeringTask,
                                                    item.description)}
                    keyExtractor={(item) => item.id}
                    />
            </View>

            {(savedFilter || nonSavedFilter) && (<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <TouchableOpacity onPress={() => setModalVis(true)} style={styles.showFilterBtn}>
                    <Text style={styles.showFilterBtnText}>Show filter</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.showFilterBtn, { backgroundColor: "#D2122E" }]} onPress={() => {
                                                                                                                if (savedFilter !== undefined) setSavedFilter(undefined);
                                                                                                                if (nonSavedFilter !== undefined) setNonSavedFilter(undefined);
                                                                                                                if (locArr.length > 0) setLocArr([]);
                                                                                                                if (IslocationFilter) setIsLocationFilter(false);
                                                                                                                }}>
                    <Text style={styles.showFilterBtnText}>Remove</Text>
                </TouchableOpacity>
            </View>)}
            <Modal
                  style={styles.modal}
                  animationType="slide"
                  transparent={true}
                  visible={modalVis}>
                <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={styles.modalView}>
                    <Text style={styles.subText}>Used filter</Text>
                    <ScrollView>
                        {savedFilter && (Object.entries(savedFilter).map(([filter, val], pos) => visualizeUsedFilters(parseFilters({ filterCriteria: filter, value: val }), pos)))}
                        {parsed_filter && (Object.entries(parsed_filter).map(([filter, val], pos) => visualizeUsedFilters(parseFilters({filterCriteria: filter, value: val}), pos)))}
                    </ScrollView>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVis(false)}>
                        <Text style={styles.fBtnText}>Close</Text>
                    </TouchableOpacity>
                </View>
                </GestureHandlerRootView>
            </Modal>
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
    },
    modal: {
        flex: 1,
        alignSelf: "center",
        backgroundColor: "white",
        alignContent: "center",
        borderRadius: 30,
        borderColor: "gray",
        borderWidth: 2
    },
    modalView: {
        position: "absolute",
        top: 215,
        width: "80%",
        height: 310,
        alignSelf: "center",
        backgroundColor: "white",
        alignContent: "center",
        borderRadius: 30,
        borderColor: "gray",
        borderWidth: 2
    },
    showFilterBtn: {
        marginBottom: 1,
        marginTop: 10,
        marginHorizontal: 20,
        backgroundColor: "#A9A9A9",
        width: 95,
        height: 30,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center"
    },
    showFilterBtnText: {
        fontFamily: 'mon-b',
        alignSelf: "center",
        color: "white"
    },
    subText: {
        alignSelf: "center",
        fontSize: 20,
        fontFamily: 'mon-b',
        fontWeight: 'bold',
        color: 'black',
        margin: 10,
        marginLeft: 5
    },
    fBtnText: {
        fontFamily: 'mon-b',
        color: "white"
    },
    cancelBtn: {
        width: 80,
        height: 30,
        backgroundColor: "#D2122E",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        margin: 30,
        position: "absolute",
        bottom: 2,
        marginTop: 20,
        alignSelf: "center"
    },
    usedFilterView: {
        flexDirection: "row",
        marginHorizontal: 15,
        marginVertical: 5
    }
})

export default Page;
