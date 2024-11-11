import { View, Text, StyleSheet, TextInput, TouchableOpacity, ViewBase, FlatList } from 'react-native';
import React from 'react';
import { Link } from "expo-router";
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
    },
    {
        id: "2",
        username: "Jan",
        location: "Krnov, Moravskoslezský kraj",
        job_name: "Sečení trávy",
        date: "2024-11-02",
        price: "500kč/hod",
    },
    {
        id: "3",
        username: "Emanuel",
        location: "Bruntál, Moravskoslezský kraj",
        job_name: "Profesionální úklid",
        date: "2024-11-03",
        price: "300kč/hod",
    },
];

const job_ad = (id: string, username: string, location: string, job_name: string, date: string, price: string) => (
    <TouchableOpacity style={styles.JobAdvertisement}>
    <Link href={{ pathname: '/(modals)/job_post', params: { id,
                                                                username,
                                                                location,
                                                                job_name,
                                                                date,
                                                                price
                                                            } }}>
        <Text style={styles.ItemText}>{username}</Text>
        {/* <Image src="pfp"/>
        <Image src="images"/> */}
        <Text style={styles.ItemText}>{location}</Text>
        <Text style={styles.ItemText}>{job_name}</Text>
        <Text style={styles.ItemText}>{date}</Text>
        <Text style={styles.ItemText}>{price}</Text>
    </Link>
    </TouchableOpacity>
)

const Page = () => {
    return (
        <View>
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

            {/* <Text>Page</Text>
            <Link href={'/(modals)/login'}>
            Login
            </Link>
            <Link href={'/(modals)/booking'}>
            Booking
            </Link>
            <Link href={'/listing/1337'}>
                Listing details
            </Link> */}
            <SafeAreaView style={styles.JobPanel}>
                <FlatList
                    data={TEST_DATA}
                    renderItem = {({ item }) => job_ad(item.id,
                                                    item.username,
                                                    item.location,
                                                    item.job_name,
                                                    item.date,
                                                    item.price
                                                )}
                    keyExtractor={(item) => item.id}
                    />
            </SafeAreaView>
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
        justifyContent: 'center'
    },
    JobPanel: {
        height: "75%"
    },
    ItemText: {
        margin: 10,
    }
})

export default Page;
