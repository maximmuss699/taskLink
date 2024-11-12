import { View, Text, TouchableOpacity, StyleSheet, TextInput, SafeAreaView } from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, useRouter } from "expo-router";
import React from 'react';

const Categories = () => {
    const router = useRouter();
    return (
        <SafeAreaView>
            <View>
            <TouchableOpacity>
                <Ionicons style={styles.SearchIcon} name='close-outline' size={18}/>
            </TouchableOpacity>

            <View style={styles.SearchBarCollection}>
                <Ionicons style={styles.SearchIcon} name='search-outline' size={24}/>
                <TextInput
                    style={styles.SearchBar}
                    placeholder='What job are you searching for?'
                    placeholderTextColor="black"
                    />
            </View>

            <TouchableOpacity>
                <Ionicons style={styles.SearchIcon} name='options-outline' size={18}/>
            </TouchableOpacity>

            <Text style={styles.MainText}>Categories</Text>

            <TouchableOpacity style={styles.categoryBtn}>
                <Link href={{ pathname: '/(modals)/posts', params:{ category: "Taskers"}}}>
                    <Text>Taskers</Text>
                </Link>
            </TouchableOpacity>

            <TouchableOpacity onPress={ () => router.push({ pathname: '/(modals)/posts', params:{ category: "Seekers"}})}>
                <Text>Seekers</Text>
            </TouchableOpacity>

            <Link href={{ pathname: '/(modals)/posts', params:{ category: "Professionals"}}}>
                <Text>Professionals</Text>
            </Link>

            <Link href={{ pathname: '/(modals)/posts', params:{ category: "Moving"}}}>
                <Text>Moving</Text>
            </Link>

            <Link href={{ pathname: '/(modals)/posts', params:{ category: "Garden"}}}>
                <Text>Garden</Text>
            </Link>

            <Link href={{ pathname: '/(modals)/posts', params:{ category: "Furniture"}}}>
                <Text>Furniture</Text>
            </Link>

            <Link href={{ pathname: '/(modals)/posts', params:{ category: "Housework"}}}>
                <Text>Housework</Text>
            </Link>

            <Link href={{ pathname: '/(modals)/posts', params:{ category: "Cleaning"}}}>
                <Text>Cleaning</Text>
            </Link>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
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
    MainText: {
        alignSelf: "center",
        fontSize: 28,
        fontFamily: 'mon-b',
        fontWeight: 'bold',
        color: 'black',
        marginLeft: 5
    },
    categoryBtn: {
        height: 80,
        width: 80,
        margin: 20,
        backgroundColor: "#FCFFFB",
        alignContent: "center",
        justifyContent: "center",
        borderRadius: 20
    }
})

export default Categories;
