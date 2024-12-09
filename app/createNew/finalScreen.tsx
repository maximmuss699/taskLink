import React, { useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { BottomButton } from './mapScreen';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm } from '../context/FormContext';
import Colors from '@/constants/Colors';
import { collection, addDoc } from 'firebase/firestore';
import { FIRESTORE } from '@/firebaseConfig';
import { FontAwesome5 } from "@expo/vector-icons";

const FinalScreen = () => {
    const navigation = useNavigation();
    const { formData, setFormData } = useForm();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);

    const onPublish = async () => {
        setLoading(true);
        setError(false);
        setFormData({ ...formData, username: "Michael Scott" });  // Hardcoded user name demonstration purposes
        try {
            await addDoc(collection(FIRESTORE, 'posts'), formData);
            setSuccess(true);
            setTimeout(() => {      // Navigate back to the new task screen after 1 second and reset the form data
                setFormData({});
                navigation.navigate('new' as never);
            }, 1000);
        } catch (error) {
            console.error("Error uploading post: ", error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <Text style={[styles.upperText, {fontSize: 30}]}>Create new task</Text>
            <Text style={styles.upperText}>Please review the details</Text>

            <View style={{flex: 1, justifyContent: 'flex-start', marginTop: 15, marginLeft:'5%'}}>
                <Text style={styles.text}>Title: {formData.title}</Text>
                <Text style={styles.text}>Price: {formData.price} CZK</Text>
                <Text style={styles.text}>Category: {formData.category}</Text>
                <Text style={styles.text}>Description: {formData.description}</Text>
                <Text style={styles.text}>Date: {formData.date?.toLocaleDateString()}</Text>
                <Text style={styles.text}>Address: {formData.address?.name}</Text>
                <Text style={styles.text}>Coordinates: {formData.coordinates?.latitude}, {formData.coordinates?.longitude}</Text>
                <Text style={styles.text}>Images: {formData.images?.length}</Text>
            </View>


            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 15}}>
                {loading && <ActivityIndicator size='large' color={Colors.dark} />}
                {success && (
                    <View style={{alignItems: 'center'}}>
                        <FontAwesome5 name="check-circle" size={50} color="green" />
                        <Text style={styles.text}>Post uploaded successfully!</Text>
                    </View>
                )}
                {error && <Text style={styles.errorText}>{'Failed to upload post.\nPlease try again.'}</Text>}
            </View>

            <BottomButton
                title="Publish"
                onPress={onPublish}
                disabled={loading || success}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    upperText: {
        marginLeft: '5%',
        fontFamily: 'Montserrat-Bold',
        fontSize: 20,
        marginTop: 10,
    },
    text: {
        color: Colors.dark,
        fontFamily: 'Montserrat-Regular',
        fontSize: 16,
        margin: 5,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        fontFamily: 'Montserrat-Bold',
        fontSize: 20,
        margin: 10,
    },
});

export default FinalScreen;
