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

            <Link href={{ pathname: '/(modals)/posts'}}>
                <Text>Taskers</Text>
            </Link>

            <TouchableOpacity>
                <Text>Seekers</Text>
            </TouchableOpacity>

            <TouchableOpacity>
                <Text>Professionals</Text>
            </TouchableOpacity>

            <TouchableOpacity>
                <Text>Moving</Text>
            </TouchableOpacity>

            <TouchableOpacity>
                <Text>Garden</Text>
            </TouchableOpacity>

            <TouchableOpacity>
                <Text>Furniture</Text>
            </TouchableOpacity>

            <TouchableOpacity>
                <Text>Housework</Text>
            </TouchableOpacity>

            <TouchableOpacity>
                <Text>Cleaning</Text>
            </TouchableOpacity>
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
