import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

const New = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View>
                <Text style={styles.header}>I want to: </Text>
                <TouchableOpacity style={styles.categoryButton}>
                    <View style={styles.dropShadow} />
                    <Text style={styles.text}>{'Offer a \nnew task'}</Text>
                    <FontAwesome6 style={styles.icon} resizeMode="cover" name="file-invoice-dollar" size={55} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.categoryButton}>
                    <View style={styles.dropShadow} />
                    <Text style={styles.text}>Seek out a new task</Text>
                    <MaterialIcons style={styles.icon} resizeMode="cover" name="person-search" size={70} color="black" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    header: {
        fontSize: 48,
        marginTop: 30,
        marginBottom: 20,
        textAlign: "center",
        color: "#000",
        fontFamily: "Montserrat-Bold",
        fontWeight: "700",
        flexWrap: "wrap",
    },
    categoryButton: {
        height: 243,
        width: 264,
        backgroundColor: '#DDDDDD',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 20,
    },
    icon: {
        marginTop: 15,
    },
    text: {
        fontSize: 36,
        lineHeight: 40,
        textAlign: "center",
        color: "#000",
        fontFamily: "Montserrat-Bold",
        fontWeight: "700",
    },
    dropShadow: {
        backgroundColor: "rgba(255, 255, 255, 0.98)",
        borderRadius: 15,
        shadowOpacity: 1,
        elevation: 4,
        shadowRadius: 4,
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowColor: "rgba(0, 0, 0, 0.25)",
        height: "100%",
        width: "100%",
        position: "absolute",
    },
});

export default New;