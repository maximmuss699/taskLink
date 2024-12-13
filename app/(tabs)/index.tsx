import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ViewBase, FlatList, Image } from 'react-native';
import { Link, useRouter } from "expo-router";
import Colors from "@/constants/Colors";
import { SearchBar } from 'react-native-screens';
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from 'react-native-safe-area-context';
/* firestore imports */
import { getFirestore, collection, query, getDocs, Timestamp, onSnapshot, where, QueryDocumentSnapshot } from 'firebase/firestore';
import Carousel from 'react-native-reanimated-carousel';
import Toast from 'react-native-toast-message';
import { FIRESTORE } from '@/firebaseConfig';
import * as Loc from 'expo-location';
import { setPackageInBuildGradle } from '@expo/config-plugins/build/android/Package';

// quicksearch filtering
export function filterQS(postArray: jobPost[], qsResult: string | null) {
    // if the search string is null, return the array unchanged...
    if (qsResult === "" || qsResult === null || qsResult === undefined) return postArray;

    var filteredArray: jobPost[] = [];
    // filter the array
    postArray.forEach((arrElem) => {
        var isInFilter: boolean = false;
        if (arrElem.title !== undefined) isInFilter = isInFilter || arrElem.title.toLowerCase().includes(qsResult.toLowerCase());
        if (arrElem.location !== undefined) isInFilter = isInFilter || arrElem.location.toLowerCase().includes(qsResult.toLowerCase());
        if (arrElem.username !== undefined) isInFilter = isInFilter || arrElem.username.toLowerCase().includes(qsResult.toLowerCase());
        if (arrElem.address.locality !== undefined) isInFilter = isInFilter || arrElem.address.locality.toLowerCase().includes(qsResult.toLowerCase());

        if (isInFilter) {
            // put it into the array
            filteredArray.push(arrElem);
        }
    })

    return filteredArray;
}

/* custom quick search on !BE! */
export async function QSFilter(keyString: string) {
    if (keyString === null || keyString === "") return;
    const collectionRef = collection(FIRESTORE, "posts");
    let queryQ = query(collectionRef);
    /* conversion to Camel Case */
    let keyStringArr = keyString.toLowerCase().split(' '); // all words to lowercase and then divided
    /* first word is upperCase, the rest of the word is in lowercase */
    keyString = keyStringArr.map(single_w => single_w.charAt(0)?.toLocaleUpperCase() + single_w.toLowerCase().slice(1)).join(' ');

    const queryArr: any[] = [
    /* firebase does not natively support query for substrings, in order to interact with the BE as much as possible, this was the alternative... */
        query(queryQ, where("title", ">=", keyString), where("title", "<=", keyString + '\uf8ff')),
        query(queryQ, where("address.locality", ">=", keyString), where("address.locality", "<=", keyString + '\uf8ff')),
        query(queryQ, where("username", ">=", keyString), where("username", "<=", keyString + '\uf8ff'))
    ];

    const queryDocs = queryArr.map(async (QSquery) => {
        return await getDocs(QSquery);
    });
    const posts = await Promise.all(queryDocs);
    return posts;
}


export const job_ad = (id: string, username: string,
    location: string, job_name: string,
    date: string, price: string, router: any, images: Array<string>,
    post_type: boolean, description: string) => {
        console.log(images);
        // to differentiate offered and searched jobs; they have different colors
        const tcolor = post_type === false ? "#717171" : "white";
        const bckgColor = post_type === false ? "#D9D9D9" : "#52812F";
        return (<TouchableOpacity style={[styles.JobAdvertisement, {backgroundColor: bckgColor}]} onPress={() => router.push({
                                                                                pathname: '/(modals)/job_post',
                                                                                params: { id,
                                                                                    username,
                                                                                    location,
                                                                                    job_name,
                                                                                    date,
                                                                                    price,
                                                                                    description,
                                                                                    images,
                                                                                    post_type
                                                                                }
                                                                            })}>
        <Text style={styles.JobAdHeader}>{username}</Text>
        <View onStartShouldSetResponder={() => true} style={{ width: "60%", height: "60%", alignItems: "center", justifyContent: "center", margin: 20 }}>
        <Carousel
            width={350}
            height={300}
            autoPlay={false}
            data={images}
            loop={true}
            renderItem={({ item }) => (
                <Image source={{ uri: item }} style={{width: "100%", height: "100%", padding: 5, marginBottom: 10}}/>
            )}
        />
        </View>
        <Text style={styles.PriceLocText}>{location}</Text>
        <Text style={[styles.ItemText, {color: tcolor}]}>{job_name}</Text>
        <Text style={[styles.ItemText, {color: tcolor}]}>{date}</Text>
        <Text style={styles.PriceLocText}>{price} €</Text>
    </TouchableOpacity>
)}

// interface definition
export interface jobPost {
    id: string;
    username: string;
    date: Timestamp;
    location: string;
    title: string;
    description: string;
    offeringTask: boolean;
    address: {
        locality: string;
    }
    price: string;
    images: string[]; // array of image URL
}

const Page = () => {
    const router = useRouter();
    const [loadedPosts, setPosts] = useState<jobPost[]>([]);
    const [quickSearch, setQSval] = useState<string | null>(null);

    const [location, setLocation] = useState<string>("Brno");

    /* fetch the user location, if the permission is granted */
    useEffect(() => {
        const updateLocation = async () => {
            const permission = await Loc.requestForegroundPermissionsAsync();
            if (permission.status === 'granted') {
                // get the location and update it
                const location = await Loc.getCurrentPositionAsync();
                const readableLoc = await Loc.reverseGeocodeAsync(location.coords);
                setLocation(readableLoc[0]?.city || 'Brno'); // Brno here is the default location
            }
        }
        updateLocation();
    }, ([]));

    useEffect(() => {
        let end = () => {};
        const getPosts = async () => {
            if (quickSearch !== null && quickSearch !== "") { // if Quick search is defined
                let jobArray: any[] = [];
                const result = await QSFilter(quickSearch);
                result?.forEach((document) => {
                    document.docs.forEach((snap: any) => {
                        jobArray.push({ id: snap.id, ...snap.data() });
                    })
                });
                // ensure no duplicates are in the array
                const jobArrayWithoutDuplicates: jobPost[] = [];
                const jobArrIds: any[] = [];
                jobArray.forEach((job) => {
                    if (!jobArrIds.includes(job.id)) {
                        jobArrayWithoutDuplicates.push(job);
                        jobArrIds.push(job.id);
                    }
                })

                setPosts(jobArrayWithoutDuplicates);
            } else {
                // get the firestore instance
                const dbEngine = getFirestore();
                // get everything from posts
                const collectionRef = collection(dbEngine, "posts");
                // listener for changes
                end = onSnapshot(collectionRef, (sshot) => {
                    // "snapshot" processing
                    const jobArray: any[] = [];
                    sshot.docs.forEach((data) => {
                        jobArray.push({ id: data.id , ...data.data() });
                    })
                    setPosts(jobArray); // state set
                });
            }
        }
        getPosts();
        return () => end();
    }, ([quickSearch]));

    console.log(loadedPosts);
    return (
        <View style={styles.main}>
            <Text style={styles.MainText}>Explore tasks near You</Text>
            <Text style={styles.LocationText}>{location}</Text>
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
                                                    item.description,
                                                )}
                    keyExtractor={(item) => item.id}
                    />
            </View>
        <Toast/>
        </View>
    );
}

const styles = StyleSheet.create({
    MainText: {
        fontSize: 28,
        fontFamily: 'mon-b',
        fontWeight: 'bold',
        color: 'black',
        marginLeft: 5
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
        alignSelf: 'center',
        justifyContent: 'center',
        height: 480,
        borderRadius: 5,
        flex: 1,
        overflow: "hidden",
        flexDirection: "column"
    },
    JobPanel: {
        height: "100%",
        flex: 1
    },
    JobAdHeader: {
        margin: 10,
        marginTop: 2,
        fontFamily: 'mon-b',
        alignSelf: "center",
        fontSize: 20
    },
    ItemText: {
        margin: 5,
        marginLeft: 10,
        fontFamily: 'mon',
        alignSelf: "flex-start",
        color: "white"
    },
    PriceLocText: {
        margin: 5,
        marginLeft: 10,
        fontFamily: 'mon-b',
        alignSelf: "flex-start",
    },
    main: {
        flex: 1,
        backgroundColor: "white"
    }
})

export default Page;
