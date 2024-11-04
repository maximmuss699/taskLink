import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import React from 'react';
import { Link } from "expo-router";
import Colors from "@/constants/Colors";
import { SearchBar } from 'react-native-screens';
import Ionicons from "@expo/vector-icons/Ionicons";
import { FlatList } from 'react-native-reanimated/lib/typescript/Animated';

const Page = () => {
    return (
        <View>
            <Text style={styles.MainText}>Explore tasks near you</Text>
            <Text style={styles.LocationText}>Location</Text>
            <TouchableOpacity style={styles.SearchBtn}>
                <Ionicons style={styles.SearchIcon} name='search-outline' size={24}/>
                <Text style={styles.SearchBtnText}>What job are you searching for?</Text>
            </TouchableOpacity>

            <Text>Page</Text>
            <Link href={'/(modals)/login'}>
            Login
            </Link>
            <Link href={'/(modals)/booking'}>
            Booking
            </Link>
            <Link href={'/listing/1337'}>
                Listing details
            </Link>
            {/* <FlatList
                data={data}
                renderItem = {({}) => }
                keyExtractor={}
            /> */}
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
    SearchBtn: {
        marginTop: 8,
        alignSelf: 'center',
        borderWidth: 2,
        borderColor: '#DEDEDE',
        borderRadius: 30,
        backgroundColor: '#FFFFFF',
        shadowColor: '#DEDEDE',
        shadowOpacity: 1,
        shadowOffset: { width: 0, height: 1},
        flexDirection: 'row'
    },
    SearchBtnText: {
        fontFamily: 'mon-b',
        fontWeight: 'bold',
        color: 'black',
        marginLeft: 10,
        marginRight: 30,
        marginTop: 10,
        marginBottom: 10
    },
    SearchIcon: {
        marginLeft: 15,
        marginTop: 5
    }
})

export default Page;
