import { View, Text, TouchableOpacity, StyleSheet, TextInput, SafeAreaView } from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React from 'react';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const Categories = () => {
    const router = useRouter();
    return (
        <SafeAreaView>
            <TouchableOpacity style={[styles.OtherBtn, {marginLeft: 10}]}>
                <Ionicons name='close-outline' size={25}/>
            </TouchableOpacity>
        <View style={styles.OuterView}>

            <View style={styles.SearchBarCollection}>
                <Ionicons style={styles.SearchIcon} name='search-outline' size={25}/>
                <TextInput
                    style={styles.SearchBar}
                    placeholder='What job are you searching for?'
                    placeholderTextColor="black"
                    />
            <TouchableOpacity style={styles.OtherBtn}>
                <Ionicons name='options-outline' size={20}/>
            </TouchableOpacity>
            </View>

            <Text style={styles.MainText}>Categories</Text>

            <View style={styles.CategView}>
                <TouchableOpacity style={styles.categoryBtn} onPress={() => router.push({ pathname: '/(modals)/posts', params:{ category: "Taskers"}})}>
                    <MaterialIcons name="engineering" size={40}/>
                    <Text style={styles.CategBtnText}>Taskers</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.categoryBtn} onPress={() => router.push({ pathname: '/(modals)/posts', params:{ category: "Seekers"}})}>
                    <MaterialIcons name="person-search" size={40}/>
                    <Text style={styles.CategBtnText}>Seekers</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.CategView}>
                <TouchableOpacity style={styles.categoryBtn} onPress={() => router.push({ pathname: '/(modals)/posts', params:{ category: "Professionals"}})}>
                    <FontAwesome5 name="wrench" size={40}/>
                    <Text style={styles.CategBtnText}>Professionals</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.categoryBtn} onPress={() => router.push({ pathname: '/(modals)/posts', params:{ category: "Moving"}})}>
                    <FontAwesome5 name="truck" size={40}/>
                    <Text style={styles.CategBtnText}>Moving</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.categoryBtn} onPress={() => router.push({ pathname: '/(modals)/posts', params:{ category: "Garden"}})}>
                    <FontAwesome5 name="leaf" size={40}/>
                    <Text style={styles.CategBtnText}>Garden</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.CategView}>
                <TouchableOpacity style={styles.categoryBtn} onPress={() => router.push({ pathname: '/(modals)/posts', params:{ category: "Furniture"}})}>
                    <FontAwesome5 name="couch" size={40}/>
                    <Text style={styles.CategBtnText}>Furniture</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.categoryBtn} onPress={() => router.push({ pathname: '/(modals)/posts', params:{ category: "Housework"}})}>
                    <FontAwesome6 name="house-chimney" size={40}/>
                    <Text style={styles.CategBtnText}>Housework</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.categoryBtn} onPress={() => router.push({ pathname: '/(modals)/posts', params:{ category: "Cleaning"}})}>
                    <FontAwesome5 name="broom" size={40}/>
                    <Text style={styles.CategBtnText}>Cleaning</Text>
                </TouchableOpacity>
            </View>
        </View>
            <Text style={styles.tasklinkLogo}>taskLink</Text>
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
        justifyContent: 'center',
        alignContent: "center"
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
        height: 100,
        width: 100,
        margin: 8,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 20,
        shadowColor: '#DEDEDE',
        shadowOpacity: 1,
        shadowOffset: { width: 0, height: 1},
        flexDirection: "column"
    },
    CategView: {
        flexDirection: "row",
        alignItems: "center"
    },
    OuterView: {
        width: "95%",
        height: 500,
        backgroundColor: "#FCFFFB",
        alignSelf: "center",
        alignItems: "center",
        borderRadius: 20,
        margin: 8,
        padding: 10
    },
    CategBtnText: {
        fontFamily: 'mon-b'
    },
    tasklinkLogo: {
        fontSize: 18,
        fontFamily: 'modernaRegular',
        color: '#888888',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
        position: "absolute",
        top: 750,
        alignSelf: "center"
    },
    OtherBtn: {
        width: 30,
        height: 30,
        shadowColor: '#DEDEDE',
        backgroundColor: "white",
        shadowOpacity: 1,
        shadowOffset: { width: 0, height: 1},
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center"
    }
})

export default Categories;
