import React from 'react';
import { View, Text, Button, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm } from '../context/FormContext';

const Screen3 = () => {
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
        <View>
            <Text>Screen Three</Text>
            <Text>{formData.offeringTask ? 'Offering a task' : 'Seeking a task'}</Text>
            <Text>Latitude: {formData.coordinates?.latitude}</Text>
            <Text>Longitude: {formData.coordinates?.longitude}</Text>
            {/* <Button
                title="Submit"
                onPress={handleSubmit}
            /> */}
        </View>
    );
};

export default Screen3;