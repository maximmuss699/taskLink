import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link } from "expo-router";
import React from 'react';

const Categories = () => {
    return (
        <View>
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

            <Text>Categories</Text>

            <Link href={{ pathname: '/(modals)/posts', params:{ category: "Taskers"}}}>
                <Text>Taskers</Text>
            </Link>

            <Link href={{ pathname: '/(modals)/posts', params:{ category: "Seekers"}}}>
                <Text>Seekers</Text>
            </Link>

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

        </View>
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
    }
})

export default Categories;
