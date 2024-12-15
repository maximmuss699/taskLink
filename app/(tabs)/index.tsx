/**
 * @file index.tsx
 * @author Vojtěch Tichý (xtichy33)
 * @description home page
 */

import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image } from 'react-native';
import { Link, useRouter } from "expo-router";
import Colors from "@/constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from 'react-native-safe-area-context';
/* firestore imports */
import { getFirestore, collection, query, getDocs, Timestamp, onSnapshot, where } from 'firebase/firestore';
import Carousel from 'react-native-reanimated-carousel';
import { FIRESTORE } from '@/firebaseConfig';
import * as Loc from 'expo-location';


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
    /* this only searches prefixes of the strings... not that much effective, but there is interaction with the BE */
        query(queryQ, where("title", ">=", keyString), where("title", "<=", keyString + '\uf8ff')),
        query(queryQ, where("address.locality", ">=", keyString), where("address.locality", "<=", keyString + '\uf8ff')),
        query(queryQ, where("username", ">=", keyString), where("username", "<=", keyString + '\uf8ff'))
    ];

    /* get all the postDocs which fall within the bounds */
    const queryDocs = queryArr.map(async (QSquery) => {
        return await getDocs(QSquery);
    });
    /* promise here, so that the posts are stored propely */
    const posts = await Promise.all(queryDocs);
    return posts;
}


export const job_ad = (
    id: string,
    username: string,
    location: string,
    job_name: string,
    date: string,
    price: string,
    router: any,
    images: Array<string>,
    post_type: boolean,
    description: string
) => {
    // Color depending on the post type
    const tcolor = post_type === false ? "white" : "#717171";
    const bckgColor = post_type === false ? "#8eb28e" : "#D9D9D9";

    return (
        <TouchableOpacity
            key={id}
            style={[styles.JobAdvertisement, { backgroundColor: bckgColor }]}
            onPress={() =>
                router.push({
                    pathname: '/(modals)/job_post',
                    params: {
                        id,
                        username,
                        location,
                        job_name,
                        date,
                        price,
                        description,
                        images,
                        post_type
                    }
                })
            }
        >
            <View style={styles.imageView}>
                <Carousel
                    width={350}
                    height={200}
                    autoPlay={false}
                    data={images}
                    loop={false}
                    renderItem={({ item }) => (
                        <Image source={{ uri: item }} style={styles.carouselImage} />
                    )}
                />
            </View>

            <View style={styles.jobInfo}>
                <Text style={styles.jobUserText}>{username}</Text>
                <Text style={styles.jobNameText}>{job_name}</Text>

                {location && (<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    {/* align the location text */}
                    <Text style={[styles.locText, { fontSize: 16, marginBottom: 3, marginLeft: 0 }]}>{location}</Text>
                </View>)}
                {/* <Text style={styles.DescriptionText}>{description}</Text> */}
                {date && price && (<View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                    <Text style={[styles.dateSytle, { color: 'black', marginLeft: 2 }]}>{date}</Text>
                    <Text style={styles.costStyle}>{price} €</Text>
                </View>)}
            </View>
        </TouchableOpacity>
    );
};


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
    const [location, setLocation] = useState<string>("Brno"); // brno here is the default location when the user forbids the location permission

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

    // console.log(loadedPosts);
    return (
        <SafeAreaView style={styles.main}>
            <View style={styles.header}>
                <Text style={styles.MainText}>Explore tasks near You</Text>
                <Text style={styles.locText}>{location}</Text>
                <View style={styles.SearchBarCollection}>
                    <Ionicons style={styles.SearchIcon} name="search-outline" size={24} color="black" />
                    <TextInput
                        style={styles.SearchBar}
                        placeholder="What job are you searching for?"
                        placeholderTextColor="black"
                        onChangeText={setQSval}
                    />
                </View>
            </View>

            <View style={styles.jobPanel}>
                <FlatList
                    data={loadedPosts}
                    renderItem={({ item }) => job_ad(
                        item.id,
                        item.username,
                        item.address ? item.address.locality || '' : '',
                        item.title,
                        item.date.toDate().toLocaleDateString(),
                        item.price,
                        router,
                        item.images,
                        item.offeringTask,
                        item.description
                    )}
                    keyExtractor={(item) => item.id}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: "white",
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 20,
        backgroundColor: "white",
    },
    MainText: {
        fontSize: 28,
        fontFamily: 'mon-b',
        fontWeight: 'bold',
        color: 'black',
        marginLeft: 5,
    },
    locText: {
        fontSize: 22,
        fontFamily: 'mon-b',
        fontWeight: 'bold',
        marginTop: 5,
        marginLeft: 5,
        color: Colors.primary,
    },
    SearchBarCollection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    SearchBar: {
        flex: 1,
        paddingLeft: 40,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#DEDEDE',
        borderRadius: 30,
        backgroundColor: '#FFFFFF',
        fontFamily: 'mon-b',
    },
    SearchIcon: {
        position: 'absolute',
        left: 15,
        top: '50%',
        color: '#ccc',
    },
    JobAdvertisement: {
        marginBottom: 20,
        backgroundColor: "#FFFFFF",
        alignItems: "flex-start",
        width: "90%",
        alignSelf: 'center',
        borderRadius: 15,
        overflow: "hidden",
        flexDirection: "column",
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
    },
    imageView: {
        width: '100%',
        height: 200,
    },
    carouselImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    jobInfo: {
        padding: 15,
    },
    jobUserText: {
        fontSize: 16,
        fontFamily: 'mon-b',
    },
    jobNameText: {
        fontSize: 14,
        fontFamily: 'mon',
        color: '#333',
        marginBottom: 5,
    },
    dateSytle: {
        fontSize: 14,
        fontFamily: 'mon',
        color: "#333",
    },
    costStyle: {
        fontSize: 16,
        fontFamily: 'mon-b',
        color: Colors.primary,
    },
    jobPanel: {
        marginTop: 10,
        width: "100%",
        backgroundColor: "white",
        flex: 1
    }
});

export default Page;
