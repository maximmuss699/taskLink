import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
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
        <SafeAreaView>
            {/* <TouchableOpacity style={styles.backBtn} onPress={() => router.push({
                                                                        pathname: '/(tabs)/inbox'
                                                                        })}>
                <Ionicons style={styles.icon} name='chevron-back-outline'/>
            </TouchableOpacity> */}
            <Text style={styles.Username}>{ username }</Text>
            <Text style={styles.LocText}>{ location }</Text>
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    Username: {
        textAlign: "center",
        fontSize: 22,
        fontFamily: 'mon-b',
        fontWeight: 'bold',
        color: 'black',
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
    }
})

export default Page;
