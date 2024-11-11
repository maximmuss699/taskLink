import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import Ionicons from "@expo/vector-icons/Ionicons";
import Colors from "@/constants/Colors";
import { useNavigation } from 'expo-router';
import { Link } from "expo-router";

const Explore = () => {
    return (
        <View>
            <Text style={styles.MainText}>Explore Jobs</Text>
            <TouchableOpacity style={styles.SearchBtn}>
                <Link href="/(modals)/categories" style={styles.SearchLink}>
                    <Ionicons style={styles.SearchIcon} name='search-outline' size={24}/>
                    <Text style={styles.SearchBtnText}>What job are you searching for?</Text>
                </Link>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    MainText: {
        fontSize: 28,
        fontFamily: 'mon-b',
        fontWeight: 'bold',
        color: 'black',
        margin: 10
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
        height: 40,
        width: "80%",
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
    },
    SearchLink: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%"
    }
})

export default Explore;
