import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import React from 'react';
import { useRouter, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

const Page = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { username } = useLocalSearchParams<{ username: string }>();
    const { location } = useLocalSearchParams<{ location: string }>();
    const { job_name } = useLocalSearchParams<{ job_name: string }>();
    const { date } = useLocalSearchParams<{ date: string }>();
    const { price } = useLocalSearchParams<{ price: string }>();

    return (
        <ScrollView style={styles.ScrollView}>
            <View style={styles.outerView}>
            {/* <TouchableOpacity style={styles.backBtn} onPress={() => router.push({
                                                                        pathname: '/(tabs)/inbox'
                                                                        })}>
                                                                        <Ionicons style={styles.icon} name='chevron-back-outline'/>
                                                                        </TouchableOpacity> */}
            <View style={styles.textHeader}>
                <Text style={styles.Username}>{ username }</Text>
                <TouchableOpacity style={styles.ContactBtn}>
                    <Text style={styles.contactText}>Contact</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.Location}>
                    <Ionicons name="location" size={30}/>
                    <Text style={styles.LocText}>{ location }</Text>
            </View>
            <View style={styles.datePrice}>
                <View style={styles.datePriceElem}>
                    <Ionicons name='cash' size={40}/>
                    <Text style={styles.Text}>{ price }</Text>
                </View>
                <View style={styles.datePriceElem}>
                    <Ionicons name='calendar' size={40}/>
                    <Text style={styles.Text}>{ date }</Text>
                </View>
            </View>
            <Text style={styles.Text}>Popis</Text>
            <Text style={styles.DescText}>{ job_name }</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    Username: {
        textAlign: "center",
        fontSize: 22,
        fontFamily: 'mon-b',
        fontWeight: 'bold',
        color: 'black',
        alignSelf: 'center'
    },
    LocText: {
        marginTop: 18,
        textAlign: "center",
        fontSize: 20,
        fontFamily: 'mon-b',
        fontWeight: 'bold',
        color: 'black',
    },
    Text: {
        margin: 10,
        fontSize: 18,
        fontFamily: 'mon-b',
        fontWeight: 'bold',
        color: 'black',
    },
    datePrice: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    datePriceElem: {
        margin: 15,
        flexDirection: "row"
    },
    DescText: {
        margin: 10,
        fontSize: 15,
        fontFamily: 'mon',
        color: 'black',
    },
    backBtn: {
        height: 80,
        width: 80,
        position: "absolute",
        left: 20,
        top: 50
    },
    icon: {
        width: "90%",
        height: "90%"
    },
    ScrollView: {
        marginTop: 70
    },
    Location: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },
    textHeader: {
        flexDirection: "row",
    },
    ContactBtn: {
        width: 100,
        height: 28,
        backgroundColor: "green",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        right: 15,
        marginLeft: 80
    },
    contactText: {
        color: "white",
        fontFamily: 'mon-b'
    },
    outerView: {
        alignItems: "center"
    }
})

export default Page;
