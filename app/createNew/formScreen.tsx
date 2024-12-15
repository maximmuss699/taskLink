/**
 * @file formScreen.tsx
 * @author Jakub Zelenay (xzelen29)
 * @description Screen for filling in the details of the task
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BottomButton } from './mapScreen';
import { useNavigation } from '@react-navigation/native';
import { useForm } from '../context/FormContext';
import Colors from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

const FormScreen = () => {
    const navigation = useNavigation();
    // Define the form data and setFormData function for manipulating the form data context
    const { formData, setFormData } = useForm();
    const [currentDate] = useState(new Date());

    // If the form data does not contain a date, set it to the current date
    useEffect(() => {
        if (!formData.date) {
            setFormData({ ...formData, date: currentDate });
        }
    }, [currentDate, formData, setFormData]);

    // Function to handle the price change event
    const handlePriceChange = (text: string) => {
        // Remove any non-numeric characters
        const numericText = text.replace(/[^0-9]/g, '');
        setFormData({ ...formData, price: numericText === '' ? undefined : parseInt(numericText) });
    };

    // Function to handle the date change event
    const handleDateChange = (event: any, selectedDate: Date | undefined) => {
        if (selectedDate) {
            setFormData({ ...formData, date: selectedDate });
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={30} color="#000" />
                    </TouchableOpacity>
                    <Text style={[styles.upperText, {fontSize: 30}]}>Create new task</Text>
                </View>
            <Text style={styles.upperText}>Please fill in the details</Text>

            <View style={{flex: 1, alignItems: 'center', justifyContent: 'flex-start', marginTop: 15}}>
                <TextInput
                    style={styles.inputField}
                    placeholder="Title"
                    placeholderTextColor={'#666666'}
                    value={formData.title}
                    autoCorrect={false}
                    autoComplete='off'
                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                />
                <TextInput
                    style={styles.inputField}
                    placeholder="Price"
                    placeholderTextColor={'#666666'}
                    value={formData.price?.toString()}
                    autoCorrect={false}
                    autoComplete='off'
                    keyboardType='numeric'
                    onChangeText={handlePriceChange}
                />
                <TextInput
                    style={[styles.inputField, styles.descriptionField, {marginBottom: 0}]}
                    placeholder="Description"
                    placeholderTextColor={'#666666'}
                    value={formData.description}
                    autoCorrect={false}
                    autoComplete='off'
                    multiline={true}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                />
                <DateTimePicker
                    style={{width: '90%'}}
                    value={formData.date || currentDate}
                    minimumDate={new Date()}
                    accentColor={Colors.primary}
                    themeVariant='light'
                    mode="date"
                    display="inline"    // maybe change to "spinner" to save vertical space
                    onChange={handleDateChange}
                />

            </View>
            <View style={styles.bottomButtonContainer}>
                <BottomButton
                    title="Next"
                    onPress={() => navigation.navigate('pictureScreen' as never)}
                    disabled={!formData.title || !formData.price || !formData.description || !formData.date}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    upperText: {
        marginLeft: '5%',
        fontFamily: 'Montserrat-Bold',
        fontSize: 20,
    },
    inputField: {
        backgroundColor: '#FFFFFF',
        width: '90%',
        borderWidth: 1,
        padding: 10,
        borderRadius: 20,
        fontFamily: 'Montserrat-Regular',
        fontSize: 16,
        marginBottom: 15,
    },
    descriptionField: {
        height: 80,
        textAlignVertical: 'top',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 16,
        paddingHorizontal: 16,
        paddingBottom: 10,
        fontSize: 24,
        fontFamily: 'mon-b',
    },
    backButton: {
        padding: 8,
    },
    bottomButtonContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        alignItems: 'center',
        paddingBottom: 10,
    },
});

export default FormScreen;