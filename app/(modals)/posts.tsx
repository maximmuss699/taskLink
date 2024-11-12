import { View, Text, StyleSheet, TextInput, TouchableOpacity, ViewBase, FlatList } from 'react-native';
import React from 'react';
import { Link, useLocalSearchParams } from "expo-router";
import Colors from "@/constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from 'react-native-safe-area-context';


const Page = () => {
    const { category } = useLocalSearchParams<{ category: string }>();
    return (
        <View>
            <Text style={styles.MainText}>Posts in { category } </Text>
            {/* <SafeAreaView style={styles.JobPanel}>
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
            </SafeAreaView> */}
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
        alignSelf: 'center'
    },
    JobPanel: {
        height: "75%"
    }
})

export default Page;
