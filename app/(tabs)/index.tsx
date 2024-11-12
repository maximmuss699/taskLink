import { View, Text, StyleSheet, TextInput, TouchableOpacity, ViewBase, FlatList, Image } from 'react-native';
import React from 'react';
import { Link, useRouter } from "expo-router";
import Colors from "@/constants/Colors";
import { SearchBar } from 'react-native-screens';
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from 'react-native-safe-area-context';

// Only for testing
const TEST_DATA = [
    {
        id: "1",
        username: "Alice",
        location: "Šternberk, Olomoucký kraj",
        job_name: "Venčení psa",
        date: "2024-11-01",
        price: "200kč/hod",
        image: 'https://via.placeholder.com/150',
        post_type: 0
    },
    {
        id: "2",
        username: "Jan",
        location: "Krnov, Moravskoslezský kraj",
        job_name: "Sečení trávy",
        date: "2024-11-02",
        price: "500kč/hod",
        image: 'https://via.placeholder.com/150',
        post_type: 1
    },
    {
        id: "3",
        username: "Emanuel",
        location: "Bruntál, Moravskoslezský kraj",
        job_name: "Profesionální úklid",
        date: "2024-11-03",
        price: "300kč/hod",
        image: 'https://via.placeholder.com/150',
        post_type: 0
    },
];

const job_ad = (id: string, username: string,
    location: string, job_name: string,
    date: string, price: string, router: any, image: string,
    post_type: number) => {
        const tcolor = post_type === 0 ? "#717171" : "white";
        const bckgColor = post_type === 0 ? "#D9D9D9" : "#52812F";
        return (<TouchableOpacity style={[styles.JobAdvertisement, {backgroundColor: bckgColor}]} onPress={() => router.push({
            pathname: '/(modals)/job_post',
                                                                                params: { id,
                                                                                    username,
                                                                                    location,
                                                                                    job_name,
                                                                                    date,
                                                                                    price
                                                                                }
                                                                            })}>
        <Text style={styles.JobAdHeader}>{username}</Text>
        <Image source={{ uri: image }} style={{width: "95%", height: "60%", padding: 5, marginBottom: 10}}/>
        <Text style={styles.PriceLocText}>{location}</Text>
        <Text style={[styles.ItemText, {color: tcolor}]}>{job_name}</Text>
        <Text style={[styles.ItemText, {color: tcolor}]}>{date}</Text>
        <Text style={styles.PriceLocText}>{price}</Text>
    </TouchableOpacity>
)}

const Page = () => {
    const router = useRouter();
    return (
        <View style={styles.main}>
            <Text style={styles.MainText}>Explore tasks near You</Text>
            <Text style={styles.LocationText}>Location</Text>
            <View style={styles.SearchBarCollection}>
                <Ionicons style={styles.SearchIcon} name='search-outline' size={24}/>
                <TextInput
                    style={styles.SearchBar}
                    placeholder='What job are you searching for?'
                    placeholderTextColor="black"
                    />
            </View>

            <View style={styles.JobPanel}>
                <FlatList
                    data={TEST_DATA}
                    renderItem = {({ item }) => job_ad(item.id,
                                                    item.username,
                                                    item.location,
                                                    item.job_name,
                                                    item.date,
                                                    item.price,
                                                    router,
                                                    item.image,
                                                    item.post_type
                                                )}
                    keyExtractor={(item) => item.id}
                    />
            </View>
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
        borderRadius: 5
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
