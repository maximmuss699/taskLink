import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapScreen from '../createNew/mapScreen';
import FormScreen from '../createNew/formScreen';
import CategoryScreen from '../createNew/categoryScreen';
import PictureScreen from '../createNew/pictureScreen';
import { FormProvider } from '../context/FormContext';
import { useForm } from '../context/FormContext';

const Stack = createNativeStackNavigator();

const NewStack = () => {
    return (
        <FormProvider>
            <NavigationContainer independent={true}>
                <Stack.Navigator initialRouteName="New">
                    <Stack.Screen name="New" component={New} options={{ headerShown: false }} />
                    <Stack.Screen name="categoryScreen" component={CategoryScreen} options={{ title: "Category"}} />
                    <Stack.Screen name="mapScreen" component={MapScreen} />
                    <Stack.Screen name="formScreen" component={FormScreen} />
                    <Stack.Screen name="pictureScreen" component={PictureScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </FormProvider>
    );
};

const New = ({ navigation }: { navigation: NativeStackNavigationProp<any> }) => {
    const { formData, setFormData } = useForm();

    return (
        <SafeAreaView style={styles.container}>
            <View>
                <Text style={styles.header}>I want to: </Text>

                <TouchableOpacity style={styles.categoryButton} onPress={() => { setFormData({ ...formData, offeringTask: true }); navigation.navigate('categoryScreen'); }}>
                    <View style={styles.dropShadow} />
                    <Text style={styles.text}>{'Offer a \nnew task'}</Text>
                    <FontAwesome6 style={styles.icon} resizeMode="cover" name="file-invoice-dollar" size={55} color="black" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.categoryButton} onPress={() => { setFormData({ ...formData, offeringTask: false }); navigation.navigate('categoryScreen'); }}>
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

export default NewStack;