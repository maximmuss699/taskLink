import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BottomButton } from './mapScreen';
import { useNavigation } from '@react-navigation/native';
import { useForm } from '../context/FormContext';

const FormScreen = () => {
    const navigation = useNavigation();
    const { formData, setFormData } = useForm();
    const [currentDate] = useState(new Date());

    // If the form data does not contain a date, set it to the current date
    useEffect(() => {
        if (!formData.date) {
            setFormData({ ...formData, date: currentDate });
        }
    }, [currentDate, formData, setFormData]);

    const handlePriceChange = (text: string) => {
        // Remove any non-numeric characters
        const numericText = text.replace(/[^0-9]/g, '');
        setFormData({ ...formData, price: numericText === '' ? undefined : parseInt(numericText) });
    };

    const handleDateChange = (event: any, selectedDate: Date | undefined) => {
        if (selectedDate) {
            setFormData({ ...formData, date: selectedDate });
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <Text style={[styles.upperText, {fontSize: 30}]}>Create new task</Text>
            <Text style={styles.upperText}>Please fill in the details</Text>

            <View style={{flex: 1, alignItems: 'center', justifyContent: 'flex-start', marginTop: 15}}>
                <TextInput
                    style={styles.inputField}
                    placeholder="Title"
                    value={formData.title}
                    autoCorrect={false}
                    autoComplete='off'
                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                />
                <TextInput
                    style={styles.inputField}
                    placeholder="Price"
                    value={formData.price?.toString()}
                    autoCorrect={false}
                    autoComplete='off'
                    keyboardType='numeric'
                    onChangeText={handlePriceChange}
                />
                <TextInput
                    style={[styles.inputField, styles.descriptionField, {marginBottom: 0}]}
                    placeholder="Description"
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
                    mode="date"
                    display="inline"    // maybe change to "spinner" to save vertical space
                    onChange={handleDateChange}
                />

            </View>

            {/* If the following view is blocking other elements, add 'borderWidth: 1' to style to see the border */}
            <View style={{justifyContent: 'flex-end'}}>
                <BottomButton
                    title="Next"
                    // onPress={() => navigation.navigate('Confirmation')} TODO: Add next screen
                    disabled={!formData.title || !formData.price || !formData.description || !formData.date}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    upperText: {
        marginLeft: '5%',
        fontFamily: 'Montserrat-Bold',
        fontSize: 20,
        marginTop: 10,
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
});

export default FormScreen;