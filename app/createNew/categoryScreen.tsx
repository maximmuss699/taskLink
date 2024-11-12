import React from 'react';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm } from '../context/FormContext';
import { Category } from '../context/FormContext';
import MapScreen from './mapScreen';

const CategoryScreen = () => {
    const navigation = useNavigation();
    const { formData, setFormData } = useForm();

    return (
        <View>
            <Text style={[styles.upperText, {fontSize: 30}]}>Create new task</Text>
            <Text style={styles.upperText}>Please choose a category</Text>

            <View style={{flexDirection: 'row', justifyContent: 'center', marginTop:20}}>
                {/* Left Row */}
                <View>
                    <TouchableOpacity style={styles.categoryButton} onPress={() => { setFormData({ ...formData, category: Category.Professionals }); navigation.navigate('mapScreen' as never); }}>
                        <View style={styles.dropShadow} />
                        <FontAwesome5 style={styles.icon} resizeMode="cover" name="wrench" size={40} />
                        <Text style={styles.text}>Professionals</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.categoryButton} onPress={() => { setFormData({ ...formData, category: Category.Moving }); navigation.navigate('mapScreen' as never); }}>
                        <View style={styles.dropShadow} />
                        <FontAwesome5 style={styles.icon} resizeMode="cover" name="truck" size={40} />
                        <Text style={styles.text}>Moving</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.categoryButton} onPress={() => { setFormData({ ...formData, category: Category.Garden }); navigation.navigate('mapScreen' as never); }}>
                        <View style={styles.dropShadow} />
                        <FontAwesome5 style={styles.icon} resizeMode="cover" name="leaf" size={40} />
                        <Text style={styles.text}>Garden</Text>
                    </TouchableOpacity>
                </View>

                {/* Right Row */}
                <View>
                    <TouchableOpacity style={styles.categoryButton} onPress={() => { setFormData({ ...formData, category: Category.Furniture }); navigation.navigate('mapScreen' as never); }}>
                        <View style={styles.dropShadow} />
                        <FontAwesome5 style={styles.icon} resizeMode="cover" name="couch" size={40} />
                        <Text style={styles.text}>Furniture</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.categoryButton} onPress={() => { setFormData({ ...formData, category: Category.Housework }); navigation.navigate('mapScreen' as never); }}>
                        <View style={styles.dropShadow} />
                        <FontAwesome6 style={styles.icon} resizeMode="cover" name="house-chimney" size={40} />
                        <Text style={styles.text}>Housework</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.categoryButton} onPress={() => { setFormData({ ...formData, category: Category.Cleaning }); navigation.navigate('mapScreen' as never); }}>
                        <View style={styles.dropShadow} />
                        <FontAwesome5 style={styles.icon} resizeMode="cover" name="broom" size={40} />
                        <Text style={styles.text}>Cleaning</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    upperText: {
        // alignSelf: 'flex-start',
        marginLeft: '5%',
        fontFamily: 'Montserrat-Bold',
        fontSize: 20,
        marginTop: 10,
    },
    categoryButton: {
        height: 130,
        width: 137,
        backgroundColor: '#DDDDDD',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 20,
    },
    icon: {
        margin: 15,
        color: 'black',
    },
    text: {
        fontSize: 16,
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

export default CategoryScreen;