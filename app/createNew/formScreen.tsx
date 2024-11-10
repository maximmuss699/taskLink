import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm } from '../context/FormContext';

const FormScreen = () => {
    const navigation = useNavigation();
    const { formData, setFormData } = useForm();

    // const handleSubmit = () => {
    //     // Post formData to the database
    //     console.log('Submitting data:', formData);
    //     // Reset form data
    //     setFormData({ field1: '', field2: '' });
    //     // Navigate back to the first screen or show a success message
    //     navigation.navigate('Wishlist');
    // };

    return (
        <View style={{ flex: 1 }}>
            <Text style={[styles.upperText, {fontSize: 30}]}>Create new task</Text>
            <Text style={styles.upperText}>Please fill in the details</Text>

            <View style={{alignItems: 'center', marginTop: 15}}>
                <TextInput
                    style={styles.inputField}
                    placeholder="Enter a title"
                    value={formData.title}
                    autoCorrect={false}
                    autoComplete='off'
                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                />

                <Text>{formData.offeringTask ? 'Offering a task' : 'Seeking a task'}</Text>
                <Text>Latitude: {formData.coordinates?.latitude}</Text>
                <Text>Longitude: {formData.coordinates?.longitude}</Text>
                <Text>Address: {formData.address?.name}</Text>
                <Text>Category: {formData.category}</Text>
                <Text>Title: {formData.title}</Text>
                <Text>Price: {formData.price}</Text>
                <Text>Description: {formData.description}</Text>
                <Text>Date: {formData.date?.toString()}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    upperText: {
        // alignSelf: 'flex-start',
        marginLeft: '5%',
        fontFamily: 'Montserrat-Bold',
        fontSize: 20,
        marginTop: 10,
    },
    inputField: {
        backgroundColor: '#FFFFFF',
        height: 40,
        width: '90%',
        borderWidth: 1,
        padding: 10,
        borderRadius: 20,
        fontFamily: 'Montserrat-Regular',
    },
});

export default FormScreen;